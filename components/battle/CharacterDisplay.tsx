import React from 'react';
import { ActiveStatusEffect } from '../../types';
import { AnimationTrigger, BattleEvent } from '../../hooks/useBattleEngine';
import { useLanguage } from '../../contexts/LanguageContext';
import { gradeToValue } from '../../utils/diceUtils';
import { getImageUrl } from '../../utils/imageUtils';
import { 
    ManaPips, HpBar, GaugeBar, StatusEffectBadge, 
    DamageNumber, SpeechBubble 
} from './BattleUIComponents';

interface CharacterDisplayProps {
    character: any;
    isFlipped?: boolean;
    isTurn?: boolean;
    isFrenzy?: boolean;
    activeDialogue: { characterId: string; text: string } | null;
    animationTrigger: AnimationTrigger | null;
    battleEvent: BattleEvent | null;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ 
    character, 
    isFlipped = false, 
    isTurn = false, 
    isFrenzy = false, 
    activeDialogue, 
    animationTrigger, 
    battleEvent 
}) => {
    const { t } = useLanguage();
    const isSpeaking = activeDialogue?.characterId === character.base.id;
    const isThisCharactersEvent = battleEvent && battleEvent.characterId === character.base.id;
    
    const maxHp = gradeToValue(character.base.stats.Vitality, character.base.bonusStats.Vitality, 'Vitality');
    const maxMana = gradeToValue(character.base.stats.Mana, character.base.bonusStats.Mana, 'Mana');

    const getAnimationClasses = () => {
        if (!animationTrigger) return '';
        const { type, attackerId, defenderId } = animationTrigger;
        const isAttacker = character.base.id === attackerId;
        const isDefender = character.base.id === defenderId;

        switch (type) {
            case 'APPROACH':
                if (isAttacker) return isFlipped ? 'anim-lunge-left' : 'anim-lunge-right';
                break;
            case 'RETURN':
                if (isAttacker) return isFlipped ? 'anim-return-left' : 'anim-return-right';
                break;
            case 'HIT_IMPACT':
                if (isAttacker) return isFlipped ? 'anim-attack-pose-left' : 'anim-attack-pose-right';
                if (isDefender) return 'anim-take-hit';
                break;
            case 'MISS_SEQUENCE':
                if (isAttacker) return isFlipped ? 'anim-miss-attack-left' : 'anim-miss-attack-right';
                if (isDefender) return isFlipped ? 'anim-dodge-back' : 'anim-dodge-back';
                break;
        }
        return '';
    };

    const renderBattleEvent = () => {
        if (!isThisCharactersEvent) return null;
        
        switch (battleEvent.type) {
            case 'DAMAGE':
                return <DamageNumber key={battleEvent.key} value={battleEvent.text.replace('-', '')} type="damage" />;
            case 'HEAL':
                return <DamageNumber key={battleEvent.key} value={battleEvent.text} type="heal" />;
            case 'SUCCESS':
                return <DamageNumber key={battleEvent.key} value={battleEvent.text} type="block" />;
            case 'FAILURE':
                return <DamageNumber key={battleEvent.key} value="MISS" type="miss" />;
            default:
                return null;
        }
    };

    return (
        <div className={`flex flex-col items-center gap-4 ${isFlipped ? 'items-end' : 'items-start'}`}>
            {/* Name & Status Effects */}
            <div className={`w-full max-w-xs ${isFlipped ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2 flex-wrap mb-2" style={{ justifyContent: isFlipped ? 'flex-end' : 'flex-start' }}>
                    {character.statusEffects.map((effect: ActiveStatusEffect) => (
                        <StatusEffectBadge key={effect.id} effect={effect} />
                    ))}
                </div>
                <h2 className={`font-display text-2xl sm:text-3xl font-bold text-white truncate ${
                    isTurn ? 'text-amber-300' : ''
                }`}>
                    {character.base.name}
                </h2>
                {isTurn && (
                    <span className="inline-block mt-1 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full animate-pulse">
                        {t('attackingTurn')}
                    </span>
                )}
            </div>

            {/* Character Portrait & Stats */}
            <div className={`flex items-center gap-3 ${isFlipped ? 'flex-row-reverse' : ''}`}>
                {/* Mana */}
                <ManaPips mana={character.mana} maxMana={maxMana} isFlipped={isFlipped} />
                
                {/* Portrait */}
                <div className={`relative character-container ${getAnimationClasses()}`}>
                    {/* Glow effect for turn */}
                    {isTurn && (
                        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 blur-xl animate-pulse" />
                    )}
                    
                    {/* Frenzy effect */}
                    {isFrenzy && (
                        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-red-500/40 to-orange-500/40 blur-xl animate-pulse" />
                    )}
                    
                    {/* Portrait frame */}
                    <div className={`relative w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                        isTurn 
                            ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]' 
                            : isFrenzy 
                                ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                                : 'border-slate-600'
                    } ${character.currentHp <= 0 ? 'grayscale' : ''}`}>
                        {character.base.image ? (
                            <img
                                src={getImageUrl(character.base.image)}
                                alt={character.base.name}
                                className={`w-full h-full object-cover ${isFlipped ? 'scale-x-[-1]' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                <span className="text-5xl font-display font-bold text-slate-500">{character.base.name.charAt(0)}</span>
                            </div>
                        )}
                        
                        {/* Dark overlay on low HP */}
                        {character.currentHp / maxHp <= 0.3 && character.currentHp > 0 && (
                            <div className="absolute inset-0 bg-red-900/30 animate-pulse" />
                        )}
                        
                        {/* Speech bubble */}
                        {isSpeaking && <SpeechBubble text={activeDialogue!.text} isFlipped={isFlipped} />}
                        
                        {/* Battle event */}
                        {renderBattleEvent()}
                        
                        {/* Guard indicator */}
                        {character.guard > 0 && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-blue-600/90 rounded-lg shadow-lg">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                <span className="font-bold text-white text-sm">{character.guard}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* HP & Gauge Bars */}
            <div className="w-full max-w-xs space-y-2">
                <HpBar current={character.currentHp} max={maxHp} isFlipped={isFlipped} />
                <GaugeBar value={character.gauge} max={100} isFlipped={isFlipped} />
            </div>
        </div>
    );
};
export default CharacterDisplay;
