import React from 'react';
import { GeneratedCharacter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getImageUrl } from '../utils/imageUtils';

interface BattleRewardModalProps {
  isOpen: boolean;
  winner: GeneratedCharacter | null;
  generatedImage: string | null;
  onClose: () => void;
}

const BattleRewardModal: React.FC<BattleRewardModalProps> = ({ isOpen, winner, generatedImage, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }
  
  const showReward = generatedImage;
  const showWaitingForImage = !generatedImage;

  const RewardView: React.FC = () => (
    <div className="flex flex-col items-center p-6 sm:p-8 text-center animate-fade-in">
      {/* Crown icon */}
      <div className="text-5xl mb-4 animate-float">👑</div>
      
      <h3 className="font-display text-3xl sm:text-4xl font-bold gradient-text tracking-wider mb-6">
        {t('victoryMementoTitle')}
      </h3>
      
      {/* Image frame */}
      <div className="relative w-full max-w-md mb-6">
        {/* Glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 blur-xl animate-pulse" />
        
        {/* Frame */}
        <div className="relative p-1 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500">
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-900">
            {generatedImage === 'ERROR' ? (
              <div className="w-full h-full flex items-center justify-center">
                    <p className="text-slate-400">{t('generationFailed')}</p>
                </div>
            ) : (
                <img 
                    src={getImageUrl(generatedImage)} 
                    alt={`Victory Memento for ${winner?.name}`}
                    className="w-full h-full object-cover"
                />
            )}
        </div>
        </div>
      </div>
      
      {/* Winner name */}
      {winner && (
        <p className="font-heading text-xl text-slate-300 italic mb-6">
          "{winner.name}" 승리의 순간
        </p>
      )}
      
        <button
            onClick={onClose}
        className="btn-gold px-8 py-3 rounded-xl font-semibold text-lg"
        >
            {t('returnToNexusButton')}
        </button>
    </div>
  );
  
  const WaitingView: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {/* Animated rings */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-violet-500/30 rounded-full animate-ping" />
        <div className="absolute inset-2 border-4 border-violet-400/40 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
        <div className="absolute inset-4 border-4 border-violet-300/50 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </div>
      
      <p className="font-heading text-xl text-violet-300 font-semibold">{t('generatingMemento')}</p>
      <p className="text-slate-500 text-sm mt-2">잠시만 기다려주세요...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 animate-fade-in-fast" aria-modal="true" role="dialog">
      {/* Backdrop with particles */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md">
        {/* Sparkles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Modal */}
      <div className="relative card-premium rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {showWaitingForImage && <WaitingView />}
        {showReward && <RewardView />}
      </div>
    </div>
  );
};

export default BattleRewardModal;
