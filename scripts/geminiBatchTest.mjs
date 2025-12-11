/**
 * 네 가지 모델(2.0 Flash / 2.0 Flash Lite / 2.5 Flash / 2.5 Flash Lite)을
 * 동일 프롬프트로 호출해 비교하는 간단 테스트 스크립트.
 *
 * 실행:
 *   node --env-file=.env.local scripts/geminiBatchTest.mjs
 *
 * 환경변수:
 *   GEMINI_API_KEY=...
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY가 설정되어 있지 않습니다.');
  process.exit(1);
}

const client = new GoogleGenAI({ apiKey });

const MODELS = [
  'models/gemini-2.0-flash',
  'models/gemini-2.0-flash-lite',
  'models/gemini-2.5-flash',
  'models/gemini-2.5-flash-lite',
];

const PROMPT = '한국어로 짧게 인사하고, 불의 마법사 아리엘의 배경 1문장, 성격 1문장, 특기 1문장을 만들어줘.';

function extractText(response) {
  const parts =
    response?.candidates?.[0]?.content?.parts ||
    response?.response?.candidates?.[0]?.content?.parts ||
    [];
  return parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(' ')
    .trim();
}

async function run() {
  for (const model of MODELS) {
    try {
      const res = await client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: PROMPT }],
          },
        ],
      });
      const text = extractText(res);
      console.log(`\n[${model}]`);
      console.log(text || '(no text)');
    } catch (err) {
      console.log(`\n[${model}] ERROR: ${err.message || err}`);
    }
  }
}

run();

