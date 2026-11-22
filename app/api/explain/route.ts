/**
 * POST /api/explain
 * Returns a plain-English explanation of a completed calculation.
 * Gemini is ONLY allowed to explain the already-computed results in words.
 * It must NEVER perform numerical calculations.
 *
 * Request body: { module, inputs, results, steps }
 * Response:     { explanation: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const EXPLAIN_SYSTEM = `
You are an engineering teaching assistant for a Design of Machine Elements course (23EMEC301) at KLE Technological University.
Your job is to explain the results of clutch and brake calculations in clear, educational language suitable for a 3rd-year engineering student.

RULES (strictly enforced):
1. You are given the already-computed results. Do NOT recalculate anything.
2. Explain in 2-5 short paragraphs what the results MEAN physically and why each formula was used.
3. Relate findings to the design criteria: allowable pressure, self-locking condition, heat generation, factor of safety.
4. Keep language concise. Use engineering terminology correctly.
5. If self-locking is detected, explain the safety implications.
6. Never invent numbers or modify the computed values.
`.trim();

const OFFLINE_EXPLANATIONS: Record<string, string> = {
  clutch: "The deterministic engine has calculated your clutch parameters. The number of active friction surfaces n′ determines how the torque capacity is distributed across the disc pack. The uniform wear assumption (conservative, default) gives a lower torque than uniform pressure — that is why it is used for safe design. The axial force Fa and interface pressure p_max must remain within the allowable material limits from Table 13.4 of the Design Data Handbook.",
  block_brake: "The deterministic engine has solved the block brake moment equilibrium. The equivalent friction coefficient μ′ corrects for contact angles exceeding 60°. When the calculated operating force F is negative, the brake is self-locking — it applies itself without external force, which requires careful safety consideration. Heat generation H = μ′·Fn·v determines thermal load on the drum lining.",
  band_brake: "The deterministic engine has calculated the band brake tensions. The tension ratio F1/F2 = e^(μθ) is fundamental — a larger wrap angle θ or higher μ exponentially increases braking effect. The differential band brake achieves self-locking when e^(μθ) ≥ b2/b1 for the self-energising rotation direction. Band sizing uses the tight-side tension F1 as the design load for width b′ and thickness h.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { module, inputs, results, steps } = body as {
      module: string;
      inputs: object;
      results: object;
      steps: string[];
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = OFFLINE_EXPLANATIONS[module] ?? OFFLINE_EXPLANATIONS.clutch;
      return NextResponse.json({ explanation: fallback, offline: true });
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `${EXPLAIN_SYSTEM}

Module: ${module}
Inputs: ${JSON.stringify(inputs, null, 2)}
Computed Results: ${JSON.stringify(results, null, 2)}
Calculation Steps:
${(steps || []).slice(0, 15).join("\n")}

Please explain these results in plain English for a DME student.`;

    const response = await model.generateContent(prompt);
    const explanation = response.response.text().trim();

    return NextResponse.json({ explanation });
  } catch (err: any) {
    console.error("[/api/explain]", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
