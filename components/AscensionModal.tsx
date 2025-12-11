import React from 'react';
import { GeneratedCharacter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AscensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: GeneratedCharacter;
  onUnlockAbility: (characterId: string, abilityType: 'trait' | 'passive' | 'special', cost: number) => Promise<void>;
}

const AscensionModal: React.FC<AscensionModalProps> = ({ isOpen, onClose, character, onUnlockAbility }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleUnlock = (abilityType: 'trait' | 'passive' | 'special', cost: number) => {
    if (character.victoryPoints >= cost) {
      onUnlockAbility(character.id, abilityType, cost);
      onClose();
    }
  };

  const costs = {
    trait: 1,
    passive: 2,
    special: 3,
  };

  const icons = {
    trait: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    passive: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    special: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  };

  const AbilityUnlockRow: React.FC<{
    abilityType: 'trait' | 'passive' | 'special';
    title: string;
    description: string;
  }> = ({ abilityType, title, description }) => {
    const cost = costs[abilityType];
    const canAfford = character.victoryPoints >= cost;
    
    return (
      <div className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
        canAfford ? 'hover:scale-[1.02]' : 'opacity-60'
      }`}>
        {/* Glow effect */}
        {canAfford && (
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        <div className="relative flex items-center gap-4 p-4 bg-slate-800/80 border border-white/10 rounded-xl">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            canAfford 
              ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-slate-700/50 text-slate-500 border border-slate-600'
          }`}>
            {icons[abilityType]}
          </div>
          
          {/* Content */}
          <div className="flex-grow min-w-0">
            <p className="font-heading text-base font-semibold text-white truncate">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
          
          {/* Button */}
        <button
          onClick={() => handleUnlock(abilityType, cost)}
          disabled={!canAfford}
            className={`flex-shrink-0 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
              canAfford
                ? 'btn-gold'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {cost} VP
        </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative card-premium rounded-2xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border border-amber-500/50 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          <h3 className="font-display text-2xl font-bold gradient-text tracking-wider">{t('ascensionAltarTitle')}</h3>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z"/>
            </svg>
            <span className="text-amber-300 font-bold">{character.victoryPoints} VP</span>
          </div>
        </div>
        
        {/* Unlock options */}
        <div className="space-y-3 mb-6">
          <AbilityUnlockRow abilityType="trait" title={t('unlockNewTrait')} description={t('coreTraits')} />
          <AbilityUnlockRow abilityType="passive" title={t('unlockNewPassive')} description={t('passiveSkill')} />
          <AbilityUnlockRow abilityType="special" title={t('unlockNewActive')} description={t('specialSkill')} />
        </div>

        {/* Close button */}
          <button
            onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            {t('cancelButton')}
          </button>
      </div>
    </div>
  );
};

export default AscensionModal;
