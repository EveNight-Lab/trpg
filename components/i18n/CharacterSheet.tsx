import React, { useState } from 'react';
import { GeneratedCharacter, Trait, PassiveSkill, TraitEffect, TraitConditionType, StatName, ResonancePassive } from '../../types';
import { useLanguage, TranslationKeys } from '../../contexts/LanguageContext';
import { getImageUrl } from '../../utils/imageUtils';
import ConfirmationModal from '../ConfirmationModal';
import HeptagonStats from '../HeptagonStats';
import AscensionModal from '../AscensionModal';
import EquipSkillModal from './EquipSkillModal';
import BattleMementosModal from '../BattleMementosModal';
import { formatCondition } from '../../utils/i18nUtils';
import { RESONANCE_LEVEL_THRESHOLDS } from '../../utils/constants';

const TraitIcon: React.FC<{ type: TraitConditionType | TraitEffect['type'] | 'TRADE_OFF' | 'DEFAULT' | 'RESONANCE'; className?: string }> = ({ type, className = "w-5 h-5" }) => {
    const iconMap: { [key in TraitConditionType | TraitEffect['type'] | 'TRADE_OFF' | 'DEFAULT' | 'RESONANCE' | string]: React.ReactElement } = {
        HP_BELOW_THRESHOLD: <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12zM12 13.06l-3-3.001-3 3.001" />,
        HP_ABOVE_THRESHOLD: <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />,
        ENEMY_HP_BELOW_THRESHOLD: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
        ENEMY_HAS_STATUS_EFFECT: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.21 1.002l-1.529 2.958a2.25 2.25 0 01-4.305-1.002l1.529-2.958a2.25 2.25 0 01.21-1.002V3.104m6.495 0v5.714a2.25 2.25 0 00.21 1.002l1.529 2.958a2.25 2.25 0 004.305-1.002l-1.529-2.958a2.25 2.25 0 00-.21-1.002V3.104" />,
        ALWAYS_ACTIVE: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99" />,
        STAT_MODIFICATION: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
        APPLY_STATUS_EFFECT_ON_HIT: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 002.999.433z" />,
        TRADE_OFF: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99" />,
        RESONANCE: <path strokeLinecap="round" strokeLinejoin="round" d="M11.645 20.91a.75.75 0 01-1.29 0C8.343 17.636 3.75 13.25 3.75 9.375 3.75 6.402 6.152 4 9 4c1.789 0 3.242.962 4.086 2.378A5.253 5.253 0 0117.25 4c2.848 0 5.25 2.402 5.25 5.375 0 3.875-4.593 8.261-6.605 11.535Z" />,
        DEFAULT: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    };
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            {iconMap[type] || iconMap.DEFAULT}
        </svg>
    );
};

const TraitDisplay: React.FC<{ trait: Trait }> = ({ trait }) => {
    const { t } = useLanguage();
    const statLabels: { [key in StatName]: TranslationKeys } = {
      Vitality: 'Vitality', Attack: 'Attack', Defense: 'Defense', Speed: 'Speed',
      Precision: 'Precision', Agility: 'Agility', Mana: 'Mana',
    };
    
    const modUp = trait.modifications.find(m => m.value > 0);
    const modDown = trait.modifications.find(m => m.value < 0);

    const formatEffect = (mod: typeof modUp) => {
        if (!mod) return '';
        const changeSymbol = mod.value > 0 ? '▲' : '▼';
        const changeValue = Math.abs(mod.value);
        const statName = t(statLabels[mod.stat]);
        return t('traitEffect_STAT_MODIFICATION', { stat: statName, change: `${changeSymbol}${changeValue} ${t('gradeChange')}` });
    };

    return (
        <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/20 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center group-hover:border-violet-500/40 transition-colors">
                <TraitIcon type="TRADE_OFF" className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-grow min-w-0">
                <strong className="font-heading text-base text-slate-200 block">{trait.name}</strong>
                <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">{trait.description}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-mono">
                   {modUp && <span className="text-emerald-400">{formatEffect(modUp)}</span>}
                   {modDown && <span className="text-rose-400">{formatEffect(modDown)}</span>}
                </div>
            </div>
        </div>
    );
};

const PassiveSkillDisplay: React.FC<{ skill: PassiveSkill | ResonancePassive, type: 'standard' | 'resonance' }> = ({ skill, type }) => {
    const { t } = useLanguage();
    
    const isResonance = type === 'resonance';
    const gradientColors = isResonance ? 'from-rose-500/20 to-pink-500/20' : 'from-amber-500/20 to-yellow-500/20';
    const borderColor = isResonance ? 'border-rose-500/20 group-hover:border-rose-500/40' : 'border-amber-500/20 group-hover:border-amber-500/40';
    const iconColor = isResonance ? 'text-rose-400' : 'text-amber-400';
    const textColor = isResonance ? 'text-rose-300' : 'text-amber-300';

    const getIconKey = () => {
        if (isResonance) return 'RESONANCE';
        const standardSkill = skill as PassiveSkill;
        if (standardSkill.condition.type !== 'ALWAYS_ACTIVE') return standardSkill.condition.type;
        return standardSkill.effect.type;
    };
    
    const formatEffect = () => {
        if (isResonance) {
            const rSkill = skill as ResonancePassive;
            return t(`resonanceEffect_${rSkill.effect.type}` as TranslationKeys, { value: String(rSkill.effect.value) });
        } else {
            const pSkill = skill as PassiveSkill;
            switch (pSkill.effect.type) {
                case 'STAT_MODIFICATION':
                    const mod = pSkill.effect.modification;
                    const changeSymbol = mod.value > 0 ? '▲' : '▼';
                    const statName = t(mod.stat as TranslationKeys);
                    return t('traitEffect_STAT_MODIFICATION', { stat: statName, change: `${changeSymbol}${Math.abs(mod.value)} ${t('gradeChange')}` });
                case 'APPLY_STATUS_EFFECT_ON_HIT':
                    const statusName = t(pSkill.effect.effect.type as TranslationKeys);
                    return t('traitEffect_APPLY_STATUS_EFFECT_ON_HIT', { chance: String(pSkill.effect.chance * 100), status: statusName });
                default: return 'Unknown effect';
            }
        }
    };
    
    const formattedCondition = !isResonance ? formatCondition((skill as PassiveSkill).condition, t) : t('resonanceCondition');

    return (
        <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-opacity-100 transition-all duration-300">
            <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradientColors} border ${borderColor} flex items-center justify-center transition-colors`}>
                <TraitIcon type={getIconKey()} className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-grow min-w-0">
                <strong className="font-heading text-base text-slate-200 block">{skill.name}</strong>
                <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">{skill.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono">
                    <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">{formattedCondition}</span>
                    <span className="text-slate-600">→</span>
                    <span className={textColor}>{formatEffect()}</span>
                </div>
            </div>
        </div>
    );
};


interface CharacterSheetProps {
  character: GeneratedCharacter;
  onBack: () => void;
  onSave: () => void;
  isSaved: boolean;
  onDelete: (id: string) => void;
  onUnlockAbility: (characterId: string, abilityType: 'trait' | 'passive' | 'special', cost: number) => Promise<void>;
  onEquipAbilities: (characterId: string, abilityType: 'trait' | 'passive' | 'special', equippedAbilities: any) => void;
  onStartPostRecruitmentConversation: (character: GeneratedCharacter) => void;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
                <h4 className="font-heading text-base text-amber-400/90">{title}</h4>
                <span className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="p-4 pt-0 border-t border-white/5">
                    {children}
                </div>
            </div>
        </div>
    );
};


const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onBack, onSave, isSaved, onDelete, onUnlockAbility, onEquipAbilities, onStartPostRecruitmentConversation }) => {
  const { t } = useLanguage();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAscensionModalOpen, setIsAscensionModalOpen] = useState(false);
  const [isMementosModalOpen, setIsMementosModalOpen] = useState(false);
  const [equipModalState, setEquipModalState] = useState<{isOpen: boolean, type: 'trait' | 'passive' | 'special' | null}>({isOpen: false, type: null});
  
  const handleDeleteClick = () => setIsDeleteModalOpen(true);
  const handleConfirmDelete = () => { onDelete(character.id); setIsDeleteModalOpen(false); };
  const handleEquipConfirm = (equippedAbilities: any) => {
    if (equipModalState.type) onEquipAbilities(character.id, equipModalState.type, equippedAbilities);
    setEquipModalState({isOpen: false, type: null});
  };

  const Section: React.FC<{title: string, onSelect?: () => void, children: React.ReactNode, className?: string}> = ({ title, onSelect, children, className = '' }) => (
      <div className={`card-premium rounded-xl p-5 ${className}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-lg text-amber-400/90 tracking-wide">{title}</h3>
            {onSelect && (
                <button onClick={onSelect} className="text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all">
                    {t('selectButton')}
                </button>
            )}
          </div>
          {children}
      </div>
  );

  const skillConditionText = character.specialSkill.activation.condition 
      ? formatCondition(character.specialSkill.activation.condition, t)
      : null;
      
    const expForNextLevel = RESONANCE_LEVEL_THRESHOLDS[character.resonanceLevel + 1];
    const expForCurrentLevel = RESONANCE_LEVEL_THRESHOLDS[character.resonanceLevel];
    const resonanceProgress = expForNextLevel 
        ? ((character.resonanceExp - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100
        : 100;

  return (
    <>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="card-premium rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className="relative p-8 text-center border-b border-white/5">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent"></div>
            <div className="relative">
              <div className="flex justify-center mb-2">
                <span className="text-amber-500/50 text-sm tracking-[0.3em]">✦ ✦ ✦</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-wider gradient-text">{character.name}</h2>
              <p className="font-heading text-lg text-slate-400 mt-1 italic">{character.race}</p>
              
             {character.resonanceLevel > 0 && (
                <div className="mt-6 max-w-xs mx-auto">
                    <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-semibold text-rose-400">{t('resonanceLevel', { level: String(character.resonanceLevel) })}</span>
                        <span className="text-slate-500">{character.resonanceExp} / {expForNextLevel || 'MAX'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/50 border border-rose-500/20 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500" style={{ width: `${resonanceProgress}%` }}></div>
                    </div>
                </div>
             )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Portrait */}
                <div className="md:col-span-2 flex justify-center">
                    <div className="relative w-full max-w-[280px]">
                        <div className="aspect-square p-1 rounded-2xl bg-gradient-to-br from-amber-500/50 via-violet-500/50 to-cyan-500/50">
                          <div className="w-full h-full rounded-xl overflow-hidden bg-black">
                         {character.image ? (
                            <img 
                                src={getImageUrl(character.image)} 
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                            />
                         ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                    <span className="text-7xl font-display text-slate-700">{character.name.charAt(0)}</span>
                            </div>
                         )}
                          </div>
                      </div>
                    </div>
                </div>
                
                {/* Skills Column */}
                <div className="md:col-span-3 space-y-5">
                    <Section title={t('specialSkill')} onSelect={() => setEquipModalState({isOpen: true, type: 'special'})}>
                       <div className="space-y-2">
                          <h4 className="font-display text-xl text-amber-300 tracking-wide">{character.specialSkill.name}</h4>
                          <p className="text-sm text-slate-400 italic">"{character.specialSkill.description}"</p>
                          <div className="flex flex-wrap gap-2 mt-3 text-xs font-mono">
                              <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">{character.specialSkill.effectDescription}</span>
                          {skillConditionText && (
                                <span className="bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/20">{skillConditionText}</span>
                          )}
                          </div>
                      </div>
                    </Section>
                    
                    <Section title={t('passiveSkill')} onSelect={() => setEquipModalState({isOpen: true, type: 'passive'})}>
                        <PassiveSkillDisplay skill={character.passiveSkill} type="standard" />
                    </Section>
                    
                    {character.resonanceLevel > 0 && character.resonancePassive && (
                        <Section title={t('resonancePassive')}>
                           <PassiveSkillDisplay skill={character.resonancePassive} type="resonance" />
                        </Section>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title={t('coreTraits')} onSelect={() => setEquipModalState({isOpen: true, type: 'trait'})}>
                 <div className="space-y-3">
                    {character.traits.map((trait, index) => (
                        <TraitDisplay key={index} trait={trait} />
                    ))}
                </div>
              </Section>

              <div className="space-y-5">
                <Section title={t('stats')}>
                        <HeptagonStats character={character} />
                </Section>
                
                 <Section title={t('combatRecord')}>
                  <div className="flex justify-around items-center text-center py-2">
                    <div>
                      <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">{t('wins')}</span>
                      <p className="text-3xl font-bold font-display text-white mt-1">{character.wins}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10"></div>
                    <div>
                      <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{t('victoryPoints')}</span>
                      <p className="text-3xl font-bold font-display text-white mt-1">{character.victoryPoints}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <button onClick={() => setIsMementosModalOpen(true)}
                        className="w-full py-2.5 text-sm font-semibold rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all">
                        {t('viewMementosButton')}
                      </button>
                   {isSaved && (
                     <button onClick={() => setIsAscensionModalOpen(true)} disabled={character.victoryPoints < 1}
                        className="w-full py-2.5 text-sm font-semibold rounded-lg btn-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                        {t('ascendButton')}
                     </button>
                    )}
                  </div>
                </Section>
              </div>
            </div>

            {/* Story Sections */}
            <div className="space-y-3">
                <CollapsibleSection title={character.personalityAnecdoteTitle}>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{character.personalityAnecdote}</p>
                </CollapsibleSection>
                <CollapsibleSection title={character.combatAnecdoteTitle}>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{character.combatAnecdote}</p>
                </CollapsibleSection>
                <CollapsibleSection title={t('backstory')}>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{character.backstory}</p>
                </CollapsibleSection>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex justify-center items-center gap-3 flex-wrap">
          <button onClick={onBack}
            className="py-2.5 px-6 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all">
            {isSaved ? t('returnToGalleryButton') : t('forgeAnotherButton')}
          </button>
          <button onClick={onSave} disabled={isSaved}
            className="py-2.5 px-6 rounded-xl text-sm font-semibold btn-premium disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isSaved ? t('savedCharacterButton') : t('saveCharacterButton')}
          </button>
          {isSaved && (
              <button onClick={() => onStartPostRecruitmentConversation(character)}
                className="py-2.5 px-6 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all">
                  {t('converseButton')}
              </button>
          )}
          {isSaved && (
              <button onClick={handleDeleteClick}
                  className="py-2.5 px-6 rounded-xl text-sm font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all">
                  {t('deleteCharacterButton')}
              </button>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete}
        title={t('deleteCharacterButton')} message={t('deleteConfirmMessage', { characterName: character.name })} />
      {isSaved && (
        <>
          <AscensionModal isOpen={isAscensionModalOpen} onClose={() => setIsAscensionModalOpen(false)} character={character} onUnlockAbility={onUnlockAbility} />
          <EquipSkillModal isOpen={equipModalState.isOpen} onClose={() => setEquipModalState({isOpen: false, type: null})} onConfirm={handleEquipConfirm} character={character} abilityType={equipModalState.type} />
          <BattleMementosModal isOpen={isMementosModalOpen} onClose={() => setIsMementosModalOpen(false)} character={character} />
        </>
      )}
    </>
  );
};

export default CharacterSheet;
