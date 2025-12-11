/**
 * WebLLM 서비스 - 브라우저에서 무료로 LLM 실행
 * 모델: Qwen2-0.5B (한국어 지원, 무료 CDN)
 */

import * as webllm from "@mlc-ai/web-llm";

// 사용할 모델 - Qwen2가 한국어 지원이 가장 나음
const MODEL_ID = "Qwen2-0.5B-Instruct-q4f16_1-MLC";

// 엔진 인스턴스 (싱글톤)
let engine: webllm.MLCEngine | null = null;
let isLoading = false;
let loadProgress = 0;

// 로딩 상태 콜백 타입
type ProgressCallback = (progress: number, status: string) => void;

/**
 * WebLLM 엔진 초기화 (첫 로딩 시 모델 다운로드)
 */
export async function initWebLLM(onProgress?: ProgressCallback): Promise<boolean> {
  if (engine) {
    return true; // 이미 로드됨
  }

  if (isLoading) {
    return false; // 로딩 중
  }

  isLoading = true;
  loadProgress = 0;

  try {
    engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (report) => {
        loadProgress = report.progress * 100;
        const status = report.text || "모델 로딩 중...";
        onProgress?.(loadProgress, status);
        console.log(`[WebLLM] ${status} (${loadProgress.toFixed(1)}%)`);
      },
    });

    isLoading = false;
    loadProgress = 100;
    console.log("[WebLLM] 모델 로딩 완료!");
    return true;
  } catch (error) {
    isLoading = false;
    console.error("[WebLLM] 모델 로딩 실패:", error);
    throw error;
  }
}

/**
 * WebLLM이 준비되었는지 확인
 */
export function isWebLLMReady(): boolean {
  return engine !== null;
}

/**
 * 현재 로딩 진행률
 */
export function getLoadProgress(): number {
  return loadProgress;
}

/**
 * 캐릭터 서사 생성
 */
export async function generateNarrativeWithAI(
  name: string,
  race: string,
  concept: string,
  language: 'ko' | 'en' = 'ko'
): Promise<{
  backstory: string;
  appearance: string;
  combatStyle: string;
  personality: string;
}> {
  if (!engine) {
    throw new Error("WebLLM이 초기화되지 않았습니다.");
  }

  const isKo = language === 'ko';
  
  const prompt = isKo 
    ? `당신은 TRPG 캐릭터 작가입니다. 다음 캐릭터의 설정을 작성해주세요.

이름: ${name}
종족: ${race}
컨셉: ${concept}

다음 형식으로 정확히 작성해주세요:
[배경] (2-3문장)
[외모] (2-3문장)  
[전투스타일] (1-2문장)
[성격] (1-2문장)`
    : `You are a TRPG character writer. Create settings for the following character.

Name: ${name}
Race: ${race}
Concept: ${concept}

Write in this exact format:
[Backstory] (2-3 sentences)
[Appearance] (2-3 sentences)
[CombatStyle] (1-2 sentences)
[Personality] (1-2 sentences)`;

  try {
    const response = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log("[WebLLM] 생성된 내용:", content);

    // 응답 파싱
    return parseNarrativeResponse(content, isKo);
  } catch (error) {
    console.error("[WebLLM] 생성 실패:", error);
    throw error;
  }
}

/**
 * 응답 텍스트 파싱
 */
function parseNarrativeResponse(content: string, isKo: boolean): {
  backstory: string;
  appearance: string;
  combatStyle: string;
  personality: string;
} {
  const defaultResult = {
    backstory: isKo ? "알 수 없는 과거를 가진 모험가." : "An adventurer with an unknown past.",
    appearance: isKo ? "평범한 외모의 전사." : "A warrior with ordinary appearance.",
    combatStyle: isKo ? "균형 잡힌 전투 스타일." : "A balanced combat style.",
    personality: isKo ? "과묵하고 신중한 성격." : "Quiet and cautious personality.",
  };

  try {
    // 각 섹션 추출
    const backstoryMatch = content.match(/\[배경\]([^[]*)|backstory\]([^[]*)/i);
    const appearanceMatch = content.match(/\[외모\]([^[]*)|appearance\]([^[]*)/i);
    const combatMatch = content.match(/\[전투스타일\]([^[]*)|combatstyle\]([^[]*)/i);
    const personalityMatch = content.match(/\[성격\]([^[]*)|personality\]([^[]*)/i);

    return {
      backstory: (backstoryMatch?.[1] || backstoryMatch?.[2] || defaultResult.backstory).trim(),
      appearance: (appearanceMatch?.[1] || appearanceMatch?.[2] || defaultResult.appearance).trim(),
      combatStyle: (combatMatch?.[1] || combatMatch?.[2] || defaultResult.combatStyle).trim(),
      personality: (personalityMatch?.[1] || personalityMatch?.[2] || defaultResult.personality).trim(),
    };
  } catch {
    return defaultResult;
  }
}

/**
 * 간단한 텍스트 생성 (테스트용)
 */
export async function generateText(prompt: string, maxTokens: number = 200): Promise<string> {
  if (!engine) {
    throw new Error("WebLLM이 초기화되지 않았습니다.");
  }

  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * 엔진 해제 (메모리 정리)
 */
export function disposeWebLLM(): void {
  if (engine) {
    engine = null;
    loadProgress = 0;
    console.log("[WebLLM] 엔진 해제됨");
  }
}

