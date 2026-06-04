import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface GeminiApiPanelProps {
  /** 창조 탭에서는 enabled 토글도 표시, 대화 탭에서는 키만 표시 */
  showEnabledToggle?: boolean;
  compact?: boolean;
}

/**
 * Gemini API 키 입력 및 활성화 토글 패널.
 * localStorage를 직접 읽고 씁니다.
 * - showEnabledToggle=true  → 창조 탭: "AI 창조 모드" 토글 + 키 입력
 * - showEnabledToggle=false → 대화 탭: 키만 입력 (키가 있으면 항상 AI 대화)
 */
const GeminiApiPanel: React.FC<GeminiApiPanelProps> = ({
  showEnabledToggle = false,
  compact = false,
}) => {
  const { t } = useLanguage();

  const [apiEnabled, setApiEnabled] = React.useState(() =>
    localStorage.getItem('trpg_gemini_api_enabled') === 'true'
  );
  const [apiKey, setApiKey] = React.useState(() =>
    localStorage.getItem('trpg_gemini_api_key') || ''
  );
  const [showKey, setShowKey] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleToggleApi = () => {
    const next = !apiEnabled;
    setApiEnabled(next);
    localStorage.setItem('trpg_gemini_api_enabled', String(next));
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('trpg_gemini_api_key', val);
    // 저장 피드백
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const hasKey = apiKey.trim().length > 0;

  return (
    <div className={`bg-slate-800/40 border border-slate-700/60 rounded-xl transition-all duration-300 ${compact ? 'p-3' : 'p-4'}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <div>
            <h3 className={`font-semibold text-slate-200 ${compact ? 'text-xs' : 'text-sm'}`}>
              {showEnabledToggle ? t('geminiForgeTitle') : 'AI 대화 설정'}
            </h3>
            <p className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {showEnabledToggle
                ? (apiEnabled ? t('geminiForgeActiveDesc') : t('geminiForgeInactiveDesc'))
                : (hasKey ? '🟢 AI 응답 활성화됨' : '⚫ API 키를 입력하면 AI가 응답합니다')}
            </p>
          </div>
        </div>

        {/* 창조 탭에만 토글 표시 */}
        {showEnabledToggle && (
          <button
            type="button"
            onClick={handleToggleApi}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              apiEnabled ? 'bg-violet-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                apiEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {/* 키 입력 영역: 창조 탭은 enabled 시에만, 대화 탭은 항상 표시 */}
      {(!showEnabledToggle || apiEnabled) && (
        <div className={`${compact ? 'mt-2 pt-2' : 'mt-4 pt-3'} border-t border-slate-700/40 space-y-2 animate-fade-in`}>
          <label htmlFor="gemini-key-panel" className={`block font-semibold text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {t('geminiApiKeyLabel')}
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              id="gemini-key-panel"
              value={apiKey}
              onChange={handleKeyChange}
              placeholder={t('geminiApiKeyPlaceholder')}
              className="premium-input block w-full pr-16 text-xs py-2 text-gray-200 placeholder-gray-500"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {saved && <span className="text-[10px] text-emerald-400">저장됨</span>}
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showKey ? '👀' : '🙈'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">{t('geminiApiKeyHelp')}</p>
        </div>
      )}
    </div>
  );
};

export default GeminiApiPanel;
