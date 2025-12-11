/**
 * Transformers.js 서비스 - 영어 생성 후 한국어 번역 방식
 * 비용: $0 (Hugging Face 무료 CDN)
 */

// @ts-ignore - Transformers.js 타입 정의 없음
import { pipeline, env } from '@xenova/transformers';

// 모델 캐시 설정
env.cacheDir = './.cache';
env.allowLocalModels = false;

// 파이프라인 인스턴스
let translator: any = null;
let generator: any = null;
let isLoading = false;

type ProgressCallback = (progress: number, status: string) => void;

/**
 * 번역 모델 초기화 (영어 → 한국어)
 * 여러 모델 시도 (한국어 모델이 없을 수 있음)
 */
export async function initTranslator(onProgress?: ProgressCallback): Promise<boolean> {
  if (translator) return true;
  if (isLoading) return false;

  isLoading = true;
  onProgress?.(0, '번역 모델 로딩 중...');

  // 시도할 모델 목록 (한국어 지원 모델들)
  const modelCandidates = [
    'Xenova/opus-mt-en-ko',           // 영어→한국어 직접
    'Xenova/opus-mt-en-mul',          // 영어→다국어
    'Xenova/nllb-200-distilled-600M', // Meta NLLB 다국어
    'Xenova/m2m100_418M',             // Facebook M2M 다국어
  ];

  for (const modelId of modelCandidates) {
    try {
      onProgress?.(10, `${modelId} 로딩 시도 중...`);
      console.log(`[Transformers] ${modelId} 로딩 시도...`);
      
      translator = await pipeline('translation', modelId, {
        progress_callback: (data: any) => {
          if (data.status === 'progress') {
            const progress = data.progress || 0;
            onProgress?.(progress, `${modelId}: ${progress.toFixed(1)}%`);
          }
        }
      });

      isLoading = false;
      onProgress?.(100, `${modelId} 준비 완료!`);
      console.log(`[Transformers] ${modelId} 로딩 성공!`);
      return true;
    } catch (error) {
      console.warn(`[Transformers] ${modelId} 로딩 실패:`, error);
      continue; // 다음 모델 시도
    }
  }

  // 모든 모델 실패
  isLoading = false;
  console.error('[Transformers] 모든 번역 모델 로딩 실패');
  throw new Error('번역 모델을 찾을 수 없습니다. 브라우저 콘솔을 확인하세요.');
}

/**
 * 텍스트 생성 모델 초기화 (영어)
 */
export async function initGenerator(onProgress?: ProgressCallback): Promise<boolean> {
  if (generator) return true;
  if (isLoading) return false;

  isLoading = true;
  onProgress?.(0, '텍스트 생성 모델 로딩 중...');

  try {
    // GPT-2 영어 텍스트 생성 (작은 모델)
    generator = await pipeline('text-generation', 'Xenova/gpt2', {
      progress_callback: (data: any) => {
        if (data.status === 'progress') {
          const progress = data.progress || 0;
          onProgress?.(progress, `모델 다운로드: ${progress.toFixed(1)}%`);
        }
      }
    });

    isLoading = false;
    onProgress?.(100, '텍스트 생성 모델 준비 완료!');
    console.log('[Transformers] 텍스트 생성 모델 로딩 완료!');
    return true;
  } catch (error) {
    isLoading = false;
    console.error('[Transformers] 텍스트 생성 모델 로딩 실패:', error);
    throw error;
  }
}

/**
 * 영어 → 한국어 번역
 */
export async function translateToKorean(text: string): Promise<string> {
  if (!translator) {
    throw new Error('번역 모델이 초기화되지 않았습니다.');
  }

  try {
    const result = await translator(text, {
      max_length: 512,
    });
    return result[0]?.translation_text || text;
  } catch (error) {
    console.error('[Transformers] 번역 실패:', error);
    return text;
  }
}

/**
 * 영어 텍스트 생성
 */
export async function generateEnglishText(prompt: string, maxLength: number = 100): Promise<string> {
  if (!generator) {
    throw new Error('텍스트 생성 모델이 초기화되지 않았습니다.');
  }

  try {
    const result = await generator(prompt, {
      max_new_tokens: maxLength,
      temperature: 0.8,
      do_sample: true,
      top_p: 0.9,
    });
    return result[0]?.generated_text || '';
  } catch (error) {
    console.error('[Transformers] 텍스트 생성 실패:', error);
    return '';
  }
}

/**
 * 캐릭터 서사 생성 (영어 생성 → 한국어 번역)
 */
export async function generateNarrativeWithTranslation(
  name: string,
  race: string,
  concept: string
): Promise<{
  backstory: string;
  appearance: string;
  combatStyle: string;
  personality: string;
  originalEnglish: string;
}> {
  if (!generator || !translator) {
    throw new Error('모델이 초기화되지 않았습니다.');
  }

  // 영어 프롬프트로 각 섹션 생성
  const backstoryPrompt = `${name} is a ${race} ${concept}. Their backstory:`;
  const appearancePrompt = `${name}, the ${race}, has a distinctive appearance:`;
  const combatPrompt = `In battle, ${name} fights with`;
  const personalityPrompt = `${name}'s personality is`;

  try {
    // 영어로 각 섹션 생성
    const [backstoryEn, appearanceEn, combatEn, personalityEn] = await Promise.all([
      generateEnglishText(backstoryPrompt, 60),
      generateEnglishText(appearancePrompt, 50),
      generateEnglishText(combatPrompt, 40),
      generateEnglishText(personalityPrompt, 40),
    ]);

    // 프롬프트 부분 제거
    const cleanBackstory = backstoryEn.replace(backstoryPrompt, '').trim();
    const cleanAppearance = appearanceEn.replace(appearancePrompt, '').trim();
    const cleanCombat = combatEn.replace(combatPrompt, '').trim();
    const cleanPersonality = personalityEn.replace(personalityPrompt, '').trim();

    const originalEnglish = `
[Backstory] ${cleanBackstory}
[Appearance] ${cleanAppearance}
[Combat] ${cleanCombat}
[Personality] ${cleanPersonality}
    `.trim();

    // 한국어로 번역
    const [backstoryKo, appearanceKo, combatKo, personalityKo] = await Promise.all([
      translateToKorean(cleanBackstory),
      translateToKorean(cleanAppearance),
      translateToKorean(cleanCombat),
      translateToKorean(cleanPersonality),
    ]);

    return {
      backstory: backstoryKo,
      appearance: appearanceKo,
      combatStyle: combatKo,
      personality: personalityKo,
      originalEnglish,
    };
  } catch (error) {
    console.error('[Transformers] 서사 생성 실패:', error);
    throw error;
  }
}

/**
 * 간단한 번역 테스트
 */
export async function testTranslation(englishText: string): Promise<string> {
  return translateToKorean(englishText);
}

/**
 * 모델 상태 확인
 */
export function isReady(): { translator: boolean; generator: boolean } {
  return {
    translator: translator !== null,
    generator: generator !== null,
  };
}

/**
 * 리소스 해제
 */
export function dispose(): void {
  translator = null;
  generator = null;
  console.log('[Transformers] 리소스 해제됨');
}

