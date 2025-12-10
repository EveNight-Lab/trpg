import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PlaceholderViewProps {
  onBack: () => void;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 animate-fade-in">
      {/* Void visualization */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-10">
        {/* Outer rings */}
        <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-pulse" />
        <div className="absolute inset-4 rounded-full border border-violet-500/30" 
             style={{ animation: 'spin 20s linear infinite reverse' }} />
        <div className="absolute inset-8 rounded-full border border-violet-500/40" 
             style={{ animation: 'spin 15s linear infinite' }} />
        
        {/* Core void */}
        <div className="absolute inset-12 rounded-full bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-black/50" />
        </div>
        
        {/* Question mark */}
        <span className="relative text-5xl font-display font-bold text-violet-400/60 animate-pulse">?</span>
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-violet-400/50 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 45}deg) translateY(-80px)`,
              animation: `pulse 2s ease-in-out ${i * 0.25}s infinite`
            }}
          />
        ))}
      </div>

      {/* Text content */}
      <div className="space-y-4 mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-wider gradient-text-purple">
          {t('placeholderTitle')}
        </h1>
        <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
          {t('placeholderMessage')}
        </p>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="w-16 h-px bg-gradient-to-r from-transparent to-violet-500/30"></div>
        <div className="text-violet-500/30 text-xs">◆</div>
        <div className="w-16 h-px bg-gradient-to-l from-transparent to-violet-500/30"></div>
      </div>

      {/* Return button */}
      <button
        onClick={onBack}
        className="group relative px-8 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
      >
        {/* Button background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 group-hover:from-violet-500 group-hover:to-indigo-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Button content */}
        <span className="relative flex items-center gap-2">
          <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          {t('returnToLandingButton')}
        </span>
      </button>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlaceholderView;
