const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY=(.+)/)[1].trim();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(key);

async function test() {
  const models = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash-lite',
    'gemini-pro-latest',
    'gemini-3.8-flash'
  ];
  for (const m of models) {
    try {
      console.log('Testing', m, '...');
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Hi');
      console.log('SUCCESS for', m, '->', res.response.text().trim().slice(0, 40));
      return m;
    } catch (e) {
      console.log('FAIL for', m, ':', e.message.slice(0, 120));
    }
  }
}

test().then(working => console.log('Final working:', working));
