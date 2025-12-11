/**
 * AI 데모 컴포넌트 - WebLLM vs Transformers.js 비교 테스트
 */

import React, { useState, useCallback } from 'react';
import { 
  initWebLLM, 
  isWebLLMReady, 
  generateNarrativeWithAI,
  generateText,
} from '../services/webLLMService';
import {
  initTranslator,
  initGenerator,
  isReady as isTransformersReady,
  generateNarrativeWithTranslation,
  testTranslation,
} from '../services/transformersService';
// Gemini 클라이언트 (브라우저에서 직접 호출)
// 키는 UI 입력값을 사용하며, 저장/보관하지 않습니다.
import { GoogleGenAI } from '@google/genai';

interface DemoResult {
  type: 'webllm' | 'transformers' | 'translation' | 'gemini';
  content: string;
  time: number;
  originalEnglish?: string;
  modelName?: string;
}

type TabType = 'webllm' | 'transformers' | 'gemini';

export default function WebLLMDemo() {
  const [activeTab, setActiveTab] = useState<TabType>('transformers');
  
  // WebLLM 상태
  const [webllmLoading, setWebllmLoading] = useState(false);
  const [webllmStatus, setWebllmStatus] = useState('');
  const [webllmProgress, setWebllmProgress] = useState(0);
  const [webllmReady, setWebllmReady] = useState(false);
  
  // Transformers.js 상태
  const [transLoading, setTransLoading] = useState(false);
  const [transStatus, setTransStatus] = useState('');
  const [transProgress, setTransProgress] = useState(0);
  const [translatorReady, setTranslatorReady] = useState(false);
  const [generatorReady, setGeneratorReady] = useState(false);
  
  // 공통 상태
  const [results, setResults] = useState<DemoResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Gemini 상태 (브라우저에서 직접 호출; 키 입력 필요)
  const defaultGeminiKey =
    (import.meta as any).env?.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    '';
  const [geminiKey, setGeminiKey] = useState(defaultGeminiKey);
  const [geminiStatus, setGeminiStatus] = useState('');

  // ===== WebLLM 핸들러 =====
  const handleLoadWebLLM = useCallback(async () => {
    setWebllmLoading(true);
    setWebllmStatus('모델 다운로드 시작...');
    
    try {
      await initWebLLM((prog, status) => {
        setWebllmProgress(prog);
        setWebllmStatus(status);
      });
      setWebllmReady(true);
      setWebllmStatus('준비 완료!');
    } catch (error) {
      setWebllmStatus(`오류: ${error}`);
    } finally {
      setWebllmLoading(false);
    }
  }, []);

  const handleWebLLMGenerate = useCallback(async () => {
    if (!isWebLLMReady()) return;
    
    setIsGenerating(true);
    const startTime = Date.now();
    
    try {
      const result = await generateNarrativeWithAI(
        'Ariel',
        'Elf',
        'fire mage seeking revenge',
        'ko'
      );
      
      setResults(prev => [{
        type: 'webllm',
        content: `[배경] ${result.backstory}\n\n[외모] ${result.appearance}\n\n[전투스타일] ${result.combatStyle}\n\n[성격] ${result.personality}`,
        time: Date.now() - startTime
      }, ...prev]);
    } catch (error) {
      setResults(prev => [{
        type: 'webllm',
        content: `오류: ${error}`,
        time: Date.now() - startTime
      }, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // ===== Transformers.js 핸들러 =====
  const handleLoadTranslator = useCallback(async () => {
    setTransLoading(true);
    setTransStatus('번역 모델 로딩 중...');
    
    try {
      await initTranslator((prog, status) => {
        setTransProgress(prog);
        setTransStatus(status);
      });
      setTranslatorReady(true);
      setTransStatus('번역 모델 준비 완료!');
    } catch (error) {
      setTransStatus(`오류: ${error}`);
    } finally {
      setTransLoading(false);
    }
  }, []);

  const handleLoadGenerator = useCallback(async () => {
    setTransLoading(true);
    setTransStatus('텍스트 생성 모델 로딩 중...');
    
    try {
      await initGenerator((prog, status) => {
        setTransProgress(prog);
        setTransStatus(status);
      });
      setGeneratorReady(true);
      setTransStatus('텍스트 생성 모델 준비 완료!');
    } catch (error) {
      setTransStatus(`오류: ${error}`);
    } finally {
      setTransLoading(false);
    }
  }, []);

  // 번역만 테스트
  const handleTranslationTest = useCallback(async () => {
    if (!translatorReady) return;
    
    setIsGenerating(true);
    const startTime = Date.now();
    
    const testText = "Ariel is a powerful fire mage who travels the world seeking revenge for her fallen family. She wields flames with deadly precision and shows no mercy to her enemies.";
    
    try {
      const result = await testTranslation(testText);
      
      setResults(prev => [{
        type: 'translation',
        content: result,
        time: Date.now() - startTime,
        originalEnglish: testText
      }, ...prev]);
    } catch (error) {
      setResults(prev => [{
        type: 'translation',
        content: `오류: ${error}`,
        time: Date.now() - startTime
      }, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, [translatorReady]);

  // 생성 + 번역 테스트
  const handleGenerateAndTranslate = useCallback(async () => {
    if (!translatorReady || !generatorReady) return;
    
    setIsGenerating(true);
    const startTime = Date.now();
    
    try {
      const result = await generateNarrativeWithTranslation(
        'Ariel',
        'Elf',
        'fire mage seeking revenge'
      );
      
      setResults(prev => [{
        type: 'transformers',
        content: `[배경] ${result.backstory}\n\n[외모] ${result.appearance}\n\n[전투스타일] ${result.combatStyle}\n\n[성격] ${result.personality}`,
        time: Date.now() - startTime,
        originalEnglish: result.originalEnglish
      }, ...prev]);
    } catch (error) {
      setResults(prev => [{
        type: 'transformers',
        content: `오류: ${error}`,
        time: Date.now() - startTime
      }, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, [translatorReady, generatorReady]);

  // ===== Gemini 브라우저 호출 (키 직접 입력) =====
  const handleRunGeminiBatch = useCallback(async () => {
    if (!geminiKey) {
      setGeminiStatus('API 키를 입력하세요.');
      return;
    }

    const models = [
      'models/gemini-2.0-flash',
      'models/gemini-2.0-flash-lite',
      'models/gemini-2.5-flash',
      'models/gemini-2.5-flash-lite',
    ];

    setIsGenerating(true);
    setGeminiStatus('호출 중...');

    const client = new GoogleGenAI({ apiKey: geminiKey });
    const prompt =
      '한국어로 짧게 인사하고, 불의 마법사 아리엘의 배경 1문장, 성격 1문장, 특기 1문장을 만들어줘.';

    for (const model of models) {
      const start = Date.now();
      try {
        const res = await client.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        });
        const parts =
          res.candidates?.[0]?.content?.parts ||
          res.response?.candidates?.[0]?.content?.parts ||
          [];
        const text = parts
          .map((p) => p.text)
          .filter(Boolean)
          .join(' ')
          .trim();

        setResults((prev) => [
          {
            type: 'gemini',
            modelName: model,
            content: text || '(no text)',
            time: Date.now() - start,
          },
          ...prev,
        ]);
      } catch (error: any) {
        setResults((prev) => [
          {
            type: 'gemini',
            modelName: model,
            content: `ERROR: ${error?.message || error}`,
            time: Date.now() - start,
          },
          ...prev,
        ]);
      }
    }

    setGeminiStatus('완료');
    setIsGenerating(false);
  }, [geminiKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🧪 브라우저 AI 테스트
          </h1>
          <p className="text-slate-400">
            WebLLM vs Transformers.js 한국어 품질 비교
          </p>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('transformers')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'transformers'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            🔄 Transformers.js (번역 방식)
          </button>
          <button
            onClick={() => setActiveTab('webllm')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'webllm'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            🤖 WebLLM (직접 생성)
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'gemini'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            ☁️ Gemini API (브라우저)
          </button>
        </div>

        {/* Transformers.js 탭 */}
        {activeTab === 'transformers' && (
          <div className="space-y-6">
            {/* 모델 로딩 */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">1️⃣ 모델 로드</h2>
              
              <div className="space-y-4">
                {/* 번역 모델 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLoadTranslator}
                    disabled={transLoading || translatorReady}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      translatorReady
                        ? 'bg-emerald-600 text-white'
                        : transLoading
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {translatorReady ? '✅ 번역 모델' : '📥 번역 모델 로드'}
                  </button>
                  <span className="text-slate-400 text-sm">영어→한국어 (~300MB)</span>
                </div>

                {/* 텍스트 생성 모델 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLoadGenerator}
                    disabled={transLoading || generatorReady}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      generatorReady
                        ? 'bg-emerald-600 text-white'
                        : transLoading
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {generatorReady ? '✅ 생성 모델' : '📥 생성 모델 로드'}
                  </button>
                  <span className="text-slate-400 text-sm">GPT-2 영어 (~500MB)</span>
                </div>

                {transLoading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                      <span>{transStatus}</span>
                      <span>{transProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${transProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 테스트 버튼 */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">2️⃣ 테스트</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleTranslationTest}
                  disabled={!translatorReady || isGenerating}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    !translatorReady || isGenerating
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-500'
                  }`}
                >
                  🔄 번역만 테스트
                </button>
                
                <button
                  onClick={handleGenerateAndTranslate}
                  disabled={!translatorReady || !generatorReady || isGenerating}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    !translatorReady || !generatorReady || isGenerating
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-500'
                  }`}
                >
                  📖 생성 + 번역
                </button>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                💡 번역 방식: 영어로 생성 → 한국어로 번역
              </p>
            </div>
          </div>
        )}

        {/* WebLLM 탭 */}
        {activeTab === 'webllm' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">1️⃣ 모델 로드</h2>
              
              {!webllmReady ? (
                <>
                  <button
                    onClick={handleLoadWebLLM}
                    disabled={webllmLoading}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                      webllmLoading 
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                    }`}
                  >
                    {webllmLoading ? '로딩 중...' : '🚀 Qwen2-0.5B 로드 (~500MB)'}
                  </button>
                  
                  {webllmLoading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>{webllmStatus}</span>
                        <span>{webllmProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${webllmProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 text-emerald-400">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg font-semibold">모델 준비 완료!</span>
                </div>
              )}
            </div>

            {webllmReady && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">2️⃣ 테스트</h2>
                
                <button
                  onClick={handleWebLLMGenerate}
                  disabled={isGenerating}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    isGenerating
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-500'
                  }`}
                >
                  📖 캐릭터 서사 생성 (한국어 직접)
                </button>

                <p className="mt-3 text-sm text-slate-500">
                  ⚠️ 한국어 품질이 낮을 수 있음 (이전 테스트 결과 참고)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gemini 탭 */}
        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Gemini API (브라우저 호출)</h2>
              <p className="text-sm text-amber-300 mb-2">
                ⚠️ 주의: 입력한 API 키는 브라우저에서 Google로 직접 전송됩니다. 저장/보관하지 않습니다.
              </p>
              {defaultGeminiKey && (
                <p className="text-xs text-emerald-300 mb-2">
                  .env의 GEMINI_API_KEY를 기본값으로 불러왔습니다. (프런트에 노출되니 배포 시 제거 권장)
                </p>
              )}
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="GEMINI_API_KEY 입력"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
              />
              <button
                onClick={handleRunGeminiBatch}
                disabled={isGenerating || !geminiKey}
                className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all ${
                  isGenerating || !geminiKey
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                4개 모델 한꺼번에 테스트 (2.0/2.5 Flash & Flash-Lite)
              </button>
              <div className="mt-2 text-sm text-slate-400">{geminiStatus}</div>
              <p className="mt-3 text-sm text-slate-500">
                프롬프트: “한국어로 짧게 인사하고, 불의 마법사 아리엘의 배경 1문장, 성격 1문장, 특기 1문장을 만들어줘.”
              </p>
            </div>
          </div>
        )}

        {/* 생성 중 표시 */}
        {isGenerating && (
          <div className="mt-4 flex items-center justify-center gap-3 text-slate-400">
            <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
            <span>생성 중... (10~60초 소요)</span>
          </div>
        )}

        {/* 결과 섹션 */}
        {results.length > 0 && (
          <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">3️⃣ 결과</h2>
            
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.type === 'webllm' 
                        ? 'bg-purple-600 text-white' 
                        : result.type === 'translation'
                        ? 'bg-teal-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {result.type === 'webllm'
                        ? 'WebLLM'
                        : result.type === 'translation'
                        ? '번역 테스트'
                        : result.type === 'gemini'
                        ? `Gemini ${result.modelName || ''}`
                        : 'Transformers.js'}
                    </span>
                    <span className="text-sm text-slate-500">
                      ⏱️ {(result.time / 1000).toFixed(1)}초
                    </span>
                  </div>
                  
                  {result.originalEnglish && (
                    <div className="mb-3 p-3 bg-slate-800 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">🇺🇸 원본 (영어)</p>
                      <pre className="text-slate-400 whitespace-pre-wrap font-sans text-sm">
                        {result.originalEnglish}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-slate-500 mb-1">🇰🇷 결과 (한국어)</p>
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {result.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 비용 정보 */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>💰 비용: <span className="text-emerald-400 font-bold">$0</span> (Hugging Face 무료 CDN)</p>
        </div>
      </div>
    </div>
  );
}
