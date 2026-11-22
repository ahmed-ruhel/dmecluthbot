const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY=(.+)/)[1].trim();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(key);

const text = "A multi-plate disc clutch has five steel on four bronze discs. The clutch is required to transmit maximum torque of 240 kN-mm. A factor of safety of 2.5 is to be considered for slippage for full engine torque. If intensity of pressure is 0.35 MPa, coefficient of friction is 0.25, calculate the diameters of clutch friction lining.";

const SYSTEM_PROMPT = `You are a parameter extraction assistant for a clutch and brake design calculator (course 23EMEC301, DME).
Given a textbook problem statement, extract ONLY the numerical inputs listed in the problem.
DO NOT solve or calculate anything. Return a JSON object with:
- module: "clutch" | "block_brake" | "band_brake" (best guess from context)
- inputs: an object where keys are field names and values are numbers
- confidence: 0-1 confidence score
- notes: array of strings for ambiguous or assumed values

For CLUTCH problems, extract from these field names (use null if absent):
powerKw, speedRpm, torqueNm, fos, mu, pAllowableMpa, diaOuterMm, diaInnerMm,
diameterRatio, radialWidthFraction, axialForceLimitN, numDrivingDiscs, numDrivenDiscs

Note: if torque is in kN-mm (e.g. 240 kN-mm), convert to N·m (240 kN-mm = 240 N·m).

IMPORTANT: Return ONLY valid JSON. No markdown. No explanations outside the JSON.`;

async function run() {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
  const res = await model.generateContent(SYSTEM_PROMPT + '\n\nProblem:\n' + text);
  console.log('Result:\n', res.response.text());
}
run();
