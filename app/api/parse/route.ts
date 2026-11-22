/**
 * POST /api/parse
 * Parses a pasted engineering problem (text or image) using Gemini,
 * returning structured inputs for the requested module.
 * Gemini NEVER calculates — only extracts inputs from the problem statement.
 *
 * Request body: { text?: string; imageBase64?: string; mimeType?: string }
 * Response:     { module, inputs, confidence, rawResponse }
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are a parameter extraction assistant for a clutch and brake design calculator (course 23EMEC301, DME).
Given a textbook problem statement, extract ONLY the numerical inputs listed in the problem.
DO NOT solve or calculate anything. Return a JSON object with:
- module: "clutch" | "block_brake" | "band_brake" (best guess from context)
- inputs: an object where keys are field names and values are numbers
- confidence: 0-1 confidence score
- notes: array of strings for ambiguous or assumed values

For CLUTCH problems, extract from these field names (use null if absent):
powerKw, speedRpm, torqueNm, fos, mu, pAllowableMpa, diaOuterMm, diaInnerMm,
diameterRatio, radialWidthFraction, axialForceLimitN, numDrivingDiscs, numDrivenDiscs

For BLOCK BRAKE problems, extract:
drumDiaMm (D), leverArmForceMm (a), leverArmFulcrumMm (b), fulcrumOffsetMm (c),
contactAngleDeg (2θ), mu, faceWidthMm, torqueNm, speedRpm, timeSec, appliedForceN, pMaxMpa

For BAND BRAKE problems, extract:
D (drum dia mm), theta_deg (wrap angle°), mu, a (lever arm), b (simple band attachment),
b1, b2 (differential), h (band thickness mm), sigma_d_band (MPa), sigma_lever (MPa),
Ft (N), T_Nm, P_kW, N_rpm

IMPORTANT: Return ONLY valid JSON. No markdown. No calculations. No explanations outside the JSON.
`.trim();

/** Simple offline regex fallback when no API key is set. */
function offlineParse(text: string): object {
  const nums: Record<string, string[]> = {};
  // Extract all "number unit" or "unit = number" patterns
  const regex = /([\w.]+)\s*=\s*([\d.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1];
    const val = match[2];
    nums[key] = [...(nums[key] || []), val];
  }
  return {
    module: text.toLowerCase().includes("clutch") ? "clutch"
           : text.toLowerCase().includes("band") ? "band_brake" : "block_brake",
    inputs: {},
    confidence: 0.1,
    notes: ["Offline fallback: could not connect to Gemini. Add GEMINI_API_KEY to .env.local."],
    rawPatterns: nums,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageBase64, mimeType = "image/jpeg" } = body as {
      text?: string;
      imageBase64?: string;
      mimeType?: string;
    };

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Provide text or imageBase64" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful offline mode
      const fallback = offlineParse(text || "");
      return NextResponse.json({ ...fallback, offline: true });
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
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
    const jsonText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    let parsed: object;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: "Gemini response was not valid JSON", rawResponse: rawText }, { status: 500 });
    }

    return NextResponse.json({ ...parsed, rawResponse: rawText });
  } catch (err: any) {
    console.error("[/api/parse]", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
