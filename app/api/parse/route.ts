/**
 * POST /api/parse
 * Parses a pasted engineering problem (text or image) using Gemini,
 * returning structured inputs for the requested module.
 * Gemini NEVER calculates — only extracts inputs from the problem statement.
 *
 * Request body: { text?: string; imageBase64?: string; mimeType?: string }
 * Response:     { module, inputs, confidence, notes, rawResponse, offline }
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are a parameter extraction assistant for a clutch and brake design calculator (course 23EMEC301, DME).
Given a textbook problem statement, extract ONLY the numerical inputs listed in the problem.
DO NOT solve or calculate anything. Return a JSON object with:
- module: "clutch" | "block_brake" | "band_brake" (best guess from context)
- inputs: an object where keys are field names and values are numbers (or null if not present)
- confidence: 0-1 confidence score
- notes: array of strings for ambiguous, converted, or assumed values

For CLUTCH problems, extract from these field names:
powerKw, speedRpm, torqueNm, fos, mu, pAllowableMpa, diaOuterMm, diaInnerMm,
diameterRatio, radialWidthFraction, axialForceLimitN, numDrivingDiscs, numDrivenDiscs

Unit conversion rules for clutch:
- If torque is given as "240 kN-mm" or "240 kN mm", convert to N·m: 240 kN·mm = 240 N·m.
- If torque is in N·m, keep as N·m.
- Number words like "five steel on four bronze" mean numDrivingDiscs = 5, numDrivenDiscs = 4.

For BLOCK BRAKE problems, extract:
drumDiaMm (D), leverArmForceMm (a), leverArmFulcrumMm (b), fulcrumOffsetMm (c),
contactAngleDeg (2θ), mu, faceWidthMm, torqueNm, speedRpm, timeSec, appliedForceN, pMaxMpa

For BAND BRAKE problems, extract:
D (drum dia mm), theta_deg (wrap angle°), mu, a (lever arm), b (simple band attachment),
b1, b2 (differential), h (band thickness mm), sigma_d_band (MPa), sigma_lever (MPa),
Ft (N), T_Nm, P_kW, N_rpm

IMPORTANT: Return ONLY valid JSON. No markdown code blocks outside JSON. No calculations.
`.trim();

const WORD_TO_NUM: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parseWordOrDigit(val: string): number | null {
  if (!val) return null;
  const lower = val.toLowerCase().trim();
  if (WORD_TO_NUM[lower] !== undefined) return WORD_TO_NUM[lower];
  const num = parseFloat(lower);
  return isNaN(num) ? null : num;
}

/** Robust offline / fallback regex parser when Gemini API is unavailable or rate-limited */
function intelligentFallbackParse(text: string): {
  module: "clutch" | "block_brake" | "band_brake";
  inputs: Record<string, number | null>;
  confidence: number;
  notes: string[];
  offline: boolean;
} {
  const lower = text.toLowerCase();
  const notes: string[] = ["Processed with built-in engineering heuristic parser."];

  // 1. Detect module
  let module: "clutch" | "block_brake" | "band_brake" = "clutch";
  if (lower.includes("band brake") || (lower.includes("band") && lower.includes("brake"))) {
    module = "band_brake";
  } else if (lower.includes("block brake") || lower.includes("shoe brake") || (lower.includes("shoe") && lower.includes("brake"))) {
    module = "block_brake";
  } else if (lower.includes("clutch") || lower.includes("disc") || lower.includes("friction lining")) {
    module = "clutch";
  }

  const inputs: Record<string, number | null> = {};

  if (module === "clutch") {
    // Discs count (e.g. "five steel on four bronze", "5 driving and 4 driven")
    const discMatch = text.match(/(\b\w+\b)\s+(?:steel|driving|driver|metal)?\s*(?:discs?|plates?)?\s*(?:on|and)\s*(\b\w+\b)\s+(?:bronze|driven)?\s*(?:discs?|plates?)/i);
    if (discMatch) {
      const n1 = parseWordOrDigit(discMatch[1]);
      const n2 = parseWordOrDigit(discMatch[2]);
      if (n1 !== null) inputs.numDrivingDiscs = n1;
      if (n2 !== null) inputs.numDrivenDiscs = n2;
      notes.push(`Detected disc count: ${n1} driving, ${n2} driven.`);
    }

    // Torque (e.g. "maximum torque of 240 kN-mm", "torque of 300 N-m")
    const torqueMatch = text.match(/(?:torque|T)\s*(?:of|=|:)?\s*([0-9.]+)\s*(kN[-·]?mm|kN[-·]?m|N[-·]?m|N[-·]?mm)?/i);
    if (torqueMatch) {
      let tVal = parseFloat(torqueMatch[1]);
      const unit = (torqueMatch[2] || "").toLowerCase();
      if (unit.includes("kn") && unit.includes("mm")) {
        // Standard DME textbook note: 240 kN-mm is 240 N·m
        inputs.torqueNm = tVal;
        notes.push(`Torque ${tVal} kN-mm parsed as ${tVal} N·m (standard DME convention).`);
      } else if (unit.includes("kn") && unit.includes("m")) {
        inputs.torqueNm = tVal * 1000;
      } else if (unit.includes("n") && unit.includes("mm")) {
        inputs.torqueNm = tVal / 1000;
      } else {
        inputs.torqueNm = tVal;
      }
    }

    // FoS (e.g. "factor of safety of 2.5", "fos = 2.5")
    const fosMatch = text.match(/(?:factor\s+of\s+safety|fos|f\.o\.s)\s*(?:of|=|:)?\s*([0-9.]+)/i);
    if (fosMatch) {
      inputs.fos = parseFloat(fosMatch[1]);
    }

    // Pressure (e.g. "pressure is 0.35 MPa", "intensity of pressure is 0.35")
    const pressMatch = text.match(/(?:pressure|intensity\s+of\s+pressure|p)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mpa|n\/mm2)?/i);
    if (pressMatch) {
      inputs.pAllowableMpa = parseFloat(pressMatch[1]);
    }

    // Friction coeff (e.g. "coefficient of friction is 0.25", "μ = 0.25")
    const muMatch = text.match(/(?:coefficient\s+of\s+friction|friction\s+coeff(?:icient)?|[μu])\s*(?:is|=|:)?\s*([0-9.]+)/i);
    if (muMatch) {
      inputs.mu = parseFloat(muMatch[1]);
    }

    // Power (e.g. "transmit 8 kW", "power = 15 kW")
    const powerMatch = text.match(/(?:power|transmits?|P)\s*(?:of|=|:)?\s*([0-9.]+)\s*(?:kW)/i);
    if (powerMatch) {
      inputs.powerKw = parseFloat(powerMatch[1]);
    }

    // Speed (e.g. "1440 rpm", "speed of 960 rpm")
    const speedMatch = text.match(/([0-9.]+)\s*(?:rpm)/i);
    if (speedMatch) {
      inputs.speedRpm = parseFloat(speedMatch[1]);
    }

    // Diameters (e.g. "inner diameter 80 mm", "outer diameter 140 mm")
    const doMatch = text.match(/(?:outer\s+dia(?:meter)?|external\s+dia(?:meter)?|Do|D_o)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (doMatch) inputs.diaOuterMm = parseFloat(doMatch[1]);

    const diMatch = text.match(/(?:inner\s+dia(?:meter)?|internal\s+dia(?:meter)?|Di|D_i)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (diMatch) inputs.diaInnerMm = parseFloat(diMatch[1]);

    // Ratio c = Di/Do
    const ratioMatch = text.match(/(?:ratio\s+Di\/Do|ratio|c)\s*(?:is|=|:)?\s*([0-9.]+)/i);
    if (ratioMatch) inputs.diameterRatio = parseFloat(ratioMatch[1]);
  } else if (module === "block_brake") {
    // Drum diameter
    const dMatch = text.match(/(?:drum\s+dia(?:meter)?|dia(?:meter)?\s+of\s+drum|D)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (dMatch) inputs.drumDiaMm = parseFloat(dMatch[1]);

    // Arms a, b, c
    const aMatch = text.match(/(?:lever\s+arm|arm\s+a|\ba\b)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (aMatch) inputs.leverArmForceMm = parseFloat(aMatch[1]);

    const bMatch = text.match(/(?:fulcrum\s+distance|arm\s+b|\bb\b)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (bMatch) inputs.leverArmFulcrumMm = parseFloat(bMatch[1]);

    const cMatch = text.match(/(?:offset|arm\s+c|\bc\b)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (cMatch) inputs.fulcrumOffsetMm = parseFloat(cMatch[1]);

    // Contact angle 2θ
    const thetaMatch = text.match(/(?:contact\s+angle|angle\s+of\s+contact|2θ|2theta)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:°|deg)?/i);
    if (thetaMatch) inputs.contactAngleDeg = parseFloat(thetaMatch[1]);

    // mu
    const muMatch = text.match(/(?:coefficient\s+of\s+friction|friction\s+coeff(?:icient)?|[μu])\s*(?:is|=|:)?\s*([0-9.]+)/i);
    if (muMatch) inputs.mu = parseFloat(muMatch[1]);

    // Torque
    const torqueMatch = text.match(/(?:torque|T)\s*(?:of|=|:)?\s*([0-9.]+)\s*(?:N[-·]?m)?/i);
    if (torqueMatch) inputs.torqueNm = parseFloat(torqueMatch[1]);
  } else if (module === "band_brake") {
    // Drum dia
    const dMatch = text.match(/(?:drum\s+dia(?:meter)?|dia(?:meter)?|D)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:mm)?/i);
    if (dMatch) inputs.D = parseFloat(dMatch[1]);

    // Wrap angle
    const thetaMatch = text.match(/(?:wrap\s+angle|angle\s+of\s+wrap|angle\s+of\s+contact|θ|theta)\s*(?:is|=|:)?\s*([0-9.]+)\s*(?:°|deg)?/i);
    if (thetaMatch) inputs.theta_deg = parseFloat(thetaMatch[1]);

    // mu
    const muMatch = text.match(/(?:coefficient\s+of\s+friction|friction\s+coeff(?:icient)?|[μu])\s*(?:is|=|:)?\s*([0-9.]+)/i);
    if (muMatch) inputs.mu = parseFloat(muMatch[1]);

    // Torque
    const torqueMatch = text.match(/(?:torque|T)\s*(?:of|=|:)?\s*([0-9.]+)\s*(?:N[-·]?m)?/i);
    if (torqueMatch) inputs.T_Nm = parseFloat(torqueMatch[1]);
  }

  const extractedCount = Object.keys(inputs).length;
  const confidence = extractedCount >= 4 ? 0.9 : extractedCount >= 2 ? 0.7 : 0.4;

  return {
    module,
    inputs,
    confidence,
    notes,
    offline: true,
  };
}

export async function POST(req: NextRequest) {
  let bodyText = "";
  try {
    const body = await req.json();
    const { text, imageBase64, mimeType = "image/jpeg" } = body as {
      text?: string;
      imageBase64?: string;
      mimeType?: string;
    };

    bodyText = text || "";

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Provide problem text or upload an image." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful offline fallback
      const fallback = intelligentFallbackParse(bodyText);
      return NextResponse.json(fallback);
    }

    // Candidate models to try in order of preference
    const candidateModels = Array.from(new Set([
      process.env.GEMINI_MODEL,
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-2.5-flash-lite",
    ].filter(Boolean))) as string[];

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ],
        });

        const parts: Part[] = [
          { text: SYSTEM_PROMPT + "\n\nProblem to parse:\n" + (text || "[see image]") },
        ];
        if (imageBase64) {
          parts.push({ inlineData: { mimeType, data: imageBase64 } });
        }

        const response = await model.generateContent(parts);
        const rawText = response.response.text().trim();

        // Strip markdown code fences if present
        const jsonText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

        try {
          const parsed = JSON.parse(jsonText);
          return NextResponse.json({ ...parsed, rawResponse: rawText, modelUsed: modelName });
        } catch {
          // If JSON parse failed, try next or fallback
          lastError = new Error("Model response was not valid JSON: " + rawText);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[API /parse] Model ${modelName} failed:`, err.message);
        // Continue to next candidate model
      }
    }

    // If all candidate models failed, degrade gracefully using heuristic parser
    console.warn("[API /parse] All candidate models failed, falling back to intelligent offline parser.", lastError?.message);
    const fallback = intelligentFallbackParse(bodyText);
    fallback.notes.push(`Notice: AI model was busy (${lastError?.message?.slice(0, 80) || "service temporarily unavailable"}). Parameters were extracted via the built-in DME parser.`);
    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error("[/api/parse critical]", err);
    const fallback = intelligentFallbackParse(bodyText);
    return NextResponse.json(fallback);
  }
}
