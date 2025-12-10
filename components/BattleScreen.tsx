import React, { useState, useEffect, useRef } from 'react';
import { GeneratedCharacter, ActiveStatusEffect, StatusEffectType, StatGrade } from '../types';
import { useBattleEngine, HitCheckRequest, DamageRollRequest, BattleEvent, AnimationTrigger } from '../hooks/useBattleEngine';
import { useLanguage, TranslationKeys } from '../contexts/LanguageContext';
import ContestedRollDisplay from './ContestedRollDisplay';
import { gradeToValue } from '../utils/diceUtils';

interface BattleScreenProps {
    combatant1: GeneratedCharacter;
    combatant2: GeneratedCharacter;
    onBattleEnd: (winnerId: string | null) => void;
}

// ==================== UI COMPONENTS ====================

const ManaPips: React.FC<{ mana: number, maxMana: number, isFlipped?: boolean }> = ({ mana, maxMana, isFlipped }) => (
    <div className={`flex ${isFlipped ? 'flex-col-reverse' : 'flex-col'} gap-1`}>
        {Array.from({ length: maxMana }).map((_, i) => (
            <div key={i} className={`relative w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 ${i < mana ? 'scale-100' : 'scale-75 opacity-30'}`}>
                <div className={`absolute inset-0 rounded-sm rotate-45 border transition-all duration-300 ${
                    i < mana 
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
                        : 'bg-slate-800 border-slate-600'
                }`} />
                {i < mana && (
                    <div className="absolute inset-1 rounded-sm rotate-45 bg-white/30" />
                )}
            </div>
        ))}
    </div>
);

const HpBar: React.FC<{ current: number; max: number; isFlipped?: boolean }> = ({ current, max, isFlipped }) => {
    const percentage = Math.max(0, (current / max) * 100);
    const getHpColor = () => {
        if (percentage > 60) return 'from-emerald-400 to-green-500';
        if (percentage > 30) return 'from-amber-400 to-orange-500';
        return 'from-red-500 to-rose-600';
    };
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HP</span>
                <span className="text-sm font-bold text-white">{current} / {max}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-800/80 border border-slate-700 overflow-hidden">
                <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getHpColor()} transition-all duration-500 ease-out relative`}
                    style={{ width: `${percentage}%`, transformOrigin: isFlipped ? 'right' : 'left' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20" />
                </div>
            </div>
        </div>
    );
};

const GaugeBar: React.FC<{ value: number; max: number; isFlipped?: boolean }> = ({ value, max, isFlipped }) => {
    const percentage = Math.min(100, (value / max) * 100);
    const isFull = percentage >= 100;
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATB</span>
                <span className={`text-xs font-bold ${isFull ? 'text-amber-400' : 'text-slate-400'}`}>
                    {isFull ? 'READY!' : `${Math.floor(percentage)}%`}
                </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/80 border border-slate-700 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-100 relative ${
                        isFull 
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-pulse' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${percentage}%`, transformOrigin: isFlipped ? 'right' : 'left' }}
                >
                    {!isFull && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />}
                </div>
            </div>
        </div>
    );
};

const StatusEffectBadge: React.FC<{ effect: ActiveStatusEffect }> = ({ effect }) => {
    const { t } = useLanguage();
    const effectStyles: Record<StatusEffectType, { bg: string; icon: string }> = {
        POISON: { bg: 'from-green-600 to-emerald-700', icon: '☠' },
        STUN: { bg: 'from-yellow-500 to-amber-600', icon: '⚡' },
        BURN: { bg: 'from-orange-500 to-red-600', icon: '🔥' },
        SLOW: { bg: 'from-blue-500 to-cyan-600', icon: '❄' },
        VULNERABLE: { bg: 'from-purple-500 to-violet-600', icon: '💔' },
        BLIND: { bg: 'from-gray-500 to-slate-600', icon: '👁' },
    };
    
    const style = effectStyles[effect.type] || { bg: 'from-gray-500 to-slate-600', icon: '?' };
    
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${style.bg} shadow-lg animate-fade-in`}>
            <span className="text-sm">{style.icon}</span>
            <span className="text-xs font-bold text-white">{effect.remainingDuration}</span>
        </div>
    );
};

const DamageNumber: React.FC<{ value: number | string; type: 'damage' | 'heal' | 'block' | 'miss' }> = ({ value, type }) => {
    const styles = {
        damage: 'text-red-400 text-6xl sm:text-7xl',
        heal: 'text-emerald-400 text-5xl sm:text-6xl',
        block: 'text-blue-400 text-4xl sm:text-5xl',
        miss: 'text-slate-400 text-4xl sm:text-5xl italic',
    };
    
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <span 
                className={`font-display font-bold ${styles[type]} animate-damage-popup`}
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px currentColor' }}
            >
                {type === 'damage' ? `-${value}` : type === 'heal' ? `+${value}` : value}
            </span>
        </div>
    );
};

const SkillActivation: React.FC<{ 
    name: string; 
    type: 'active' | 'passive';
    position: 'left' | 'right';
}> = ({ name, type, position }) => {
    const isActive = type === 'active';
    
    return (
        <div className={`absolute top-1/2 ${position === 'left' ? 'left-[15%]' : 'right-[15%]'} -translate-y-1/2 z-40`}>
            <div className={`relative animate-skill-burst`}>
                {/* Glow background */}
                <div className={`absolute -inset-4 rounded-xl blur-xl ${
                    isActive ? 'bg-amber-500/40' : 'bg-cyan-500/40'
                }`} />
                
                {/* Main card */}
                <div className={`relative px-6 py-4 rounded-xl border-2 backdrop-blur-md ${
                    isActive 
                        ? 'bg-gradient-to-br from-amber-900/90 to-orange-900/90 border-amber-400' 
                        : 'bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border-cyan-400'
                }`}>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                        isActive ? 'text-amber-300' : 'text-cyan-300'
                    }`}>
                        {isActive ? '✦ SKILL ✦' : '◈ PASSIVE ◈'}
                    </div>
                    <div className="font-display text-xl sm:text-2xl font-bold text-white text-center">
                        {name}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpeechBubble: React.FC<{ text: string; isFlipped?: boolean }> = ({ text, isFlipped }) => (
    <div className={`absolute -top-4 transform -translate-y-full ${isFlipped ? 'right-0' : 'left-0'} z-20`}>
        <div className={`relative bg-white text-slate-800 text-sm font-medium px-4 py-2 rounded-2xl shadow-xl animate-speech-bubble max-w-[200px]`}>
            <div className="relative z-10">{text}</div>
            <div className={`absolute w-4 h-4 bg-white transform rotate-45 -bottom-1.5 ${isFlipped ? 'right-6' : 'left-6'}`} />
        </div>
    </div>
);

// ==================== CHARACTER DISPLAY ====================

const CharacterDisplay: React.FC<{
    character: any;
    isFlipped?: boolean;
    isTurn?: boolean;
    isFrenzy?: boolean;
    activeDialogue: { characterId: string; text: string } | null;
    animationTrigger: AnimationTrigger | null;
    battleEvent: BattleEvent | null;
}> = ({ character, isFlipped = false, isTurn = false, isFrenzy = false, activeDialogue, animationTrigger, battleEvent }) => {
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
                                src={`data:image/jpeg;base64,${character.base.image}`}
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

// ==================== BATTLE LOG ====================

const BattleLog: React.FC<{ log: string[]; winner: any }> = ({ log, winner }) => {
    const { t } = useLanguage();
    const logRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [log]);

    return (
        <div className="card-premium rounded-xl overflow-hidden flex flex-col h-40">
            <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 className="font-heading text-sm font-semibold text-slate-300 uppercase tracking-wider">{t('battleLogTitle')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1" ref={logRef}>
                {log.map((entry, index) => (
                    <p key={index} className="text-sm text-slate-400 animate-fade-in leading-relaxed">
                        {entry}
                    </p>
                ))}
                {winner && (
                    <p className="text-center py-4 font-display text-xl font-bold text-amber-400 animate-pulse">
                        🏆 {winner.logMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

// ==================== VICTORY SCREEN ====================

const VictoryScreen: React.FC<{ winner: any; onReturn: () => void }> = ({ winner, onReturn }) => {
    const { t } = useLanguage();
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="text-center">
                {/* Crown */}
                <div className="text-6xl mb-4 animate-float">👑</div>
                
                {/* Winner name */}
                <h1 className="font-display text-5xl sm:text-6xl font-bold gradient-text mb-4 animate-fade-in-up">
                    VICTORY!
                </h1>
                
                {/* Winner portrait */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 animate-fade-in-scale">
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 blur-lg opacity-60 animate-pulse" />
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-amber-400">
                        {winner.base.image ? (
                            <img src={`data:image/jpeg;base64,${winner.base.image}`} alt={winner.base.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <span className="text-4xl font-display font-bold text-slate-600">{winner.base.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <h2 className="font-display text-3xl font-bold text-white mb-2">{winner.base.name}</h2>
                <p className="text-slate-400 italic mb-8">"{winner.logMessage}"</p>
                
                <button
                    onClick={onReturn}
                    className="btn-gold px-8 py-3 rounded-xl font-semibold text-lg"
                >
                    {t('returnToGalleryButton')}
                </button>
            </div>
        </div>
    );
};

// ==================== FRENZY INDICATOR ====================

const FrenzyIndicator: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="relative animate-frenzy-burst">
                {/* Background flash */}
                <div className="absolute -inset-40 bg-gradient-to-r from-red-600/30 via-orange-500/20 to-red-600/30 blur-3xl" />
                
                {/* Text */}
                <h1 className="relative font-display text-6xl sm:text-8xl font-bold text-red-500 tracking-widest"
                    style={{ textShadow: '0 0 40px rgba(239,68,68,0.8), 0 0 80px rgba(239,68,68,0.4)' }}>
                    {t('frenzyIndicatorText')}
                </h1>
            </div>
        </div>
    );
};

// ==================== MAIN BATTLE SCREEN ====================

const BattleScreen: React.FC<BattleScreenProps> = ({ combatant1, combatant2, onBattleEnd }) => {
    const { t } = useLanguage();
    const { 
        fighters, log, winner, 
        hitCheckRequest, damageRollRequest, resolveHitCheck, resolveDamageRoll,
        activeSkill, activePassive,
        activeDialogue, currentAttackerId, battleEvent, animationTrigger, isFrenzy,
        turnCount
    } = useBattleEngine(combatant1, combatant2);

    const [showFrenzyIndicator, setShowFrenzyIndicator] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    
    useEffect(() => {
        if (isFrenzy) {
            setShowFrenzyIndicator(true);
            const timer = setTimeout(() => setShowFrenzyIndicator(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isFrenzy]);
    
    useEffect(() => {
        if (winner) {
            const timer = setTimeout(() => setShowVictory(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [winner]);

    return (
        <>
            {/* Battle Animation Styles */}
            <style>{`
                .character-container {
                    transition: transform 0.3s ease-out;
                }
                
                @keyframes lunge-right {
                    0% { transform: translateX(0) scale(1); }
                    50% { transform: translateX(80px) scale(1.1); }
                    100% { transform: translateX(80px) scale(1.1); }
                }
                @keyframes lunge-left {
                    0% { transform: translateX(0) scale(1); }
                    50% { transform: translateX(-80px) scale(1.1); }
                    100% { transform: translateX(-80px) scale(1.1); }
                }
                @keyframes return-right {
                    0% { transform: translateX(80px) scale(1.1); }
                    100% { transform: translateX(0) scale(1); }
                }
                @keyframes return-left {
                    0% { transform: translateX(-80px) scale(1.1); }
                    100% { transform: translateX(0) scale(1); }
                }
                @keyframes attack-pose-right {
                    0%, 100% { transform: translateX(80px) scale(1.1) rotate(0deg); }
                    50% { transform: translateX(90px) scale(1.15) rotate(5deg); }
                }
                @keyframes attack-pose-left {
                    0%, 100% { transform: translateX(-80px) scale(1.1) rotate(0deg); }
                    50% { transform: translateX(-90px) scale(1.15) rotate(-5deg); }
                }
                @keyframes take-hit {
                    0% { transform: translateX(0) scale(1); filter: brightness(1); }
                    20% { transform: translateX(15px) scale(0.95); filter: brightness(2); }
                    40% { transform: translateX(-10px) scale(0.98); filter: brightness(0.8); }
                    100% { transform: translateX(0) scale(1); filter: brightness(1); }
                }
                @keyframes miss-attack-right {
                    0% { transform: translateX(0) scale(1); }
                    30% { transform: translateX(60px) scale(1.1); }
                    60% { transform: translateX(70px) scale(1.05) rotate(10deg); }
                    100% { transform: translateX(0) scale(1) rotate(0deg); }
                }
                @keyframes miss-attack-left {
                    0% { transform: translateX(0) scale(1); }
                    30% { transform: translateX(-60px) scale(1.1); }
                    60% { transform: translateX(-70px) scale(1.05) rotate(-10deg); }
                    100% { transform: translateX(0) scale(1) rotate(0deg); }
                }
                @keyframes dodge-back {
                    0% { transform: translateX(0) scale(1) rotate(0deg); }
                    30% { transform: translateX(25px) scale(0.9) rotate(8deg); }
                    100% { transform: translateX(0) scale(1) rotate(0deg); }
                }
                @keyframes damage-popup {
                    0% { opacity: 0; transform: translateY(20px) scale(0.5); }
                    20% { opacity: 1; transform: translateY(-10px) scale(1.2); }
                    80% { opacity: 1; transform: translateY(-30px) scale(1); }
                    100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
                }
                @keyframes skill-burst {
                    0% { opacity: 0; transform: scale(0.5); }
                    30% { opacity: 1; transform: scale(1.1); }
                    80% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.9); }
                }
                @keyframes speech-bubble {
                    0% { opacity: 0; transform: translateY(10px) scale(0.9); }
                    20% { opacity: 1; transform: translateY(0) scale(1); }
                    80% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                }
                @keyframes frenzy-burst {
                    0% { opacity: 0; transform: scale(2); }
                    30% { opacity: 1; transform: scale(1); }
                    70% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0; transform: scale(0.9); }
                }
                
                .anim-lunge-right { animation: lunge-right 0.8s ease-in-out forwards; }
                .anim-lunge-left { animation: lunge-left 0.8s ease-in-out forwards; }
                .anim-return-right { animation: return-right 0.6s ease-out forwards; }
                .anim-return-left { animation: return-left 0.6s ease-out forwards; }
                .anim-attack-pose-right { animation: attack-pose-right 0.5s ease-in-out; }
                .anim-attack-pose-left { animation: attack-pose-left 0.5s ease-in-out; }
                .anim-take-hit { animation: take-hit 0.5s ease-out; }
                .anim-miss-attack-right { animation: miss-attack-right 0.8s ease-in-out; }
                .anim-miss-attack-left { animation: miss-attack-left 0.8s ease-in-out; }
                .anim-dodge-back { animation: dodge-back 0.6s ease-out; }
                .animate-damage-popup { animation: damage-popup 1.2s ease-out forwards; }
                .animate-skill-burst { animation: skill-burst 1.5s ease-out forwards; }
                .animate-speech-bubble { animation: speech-bubble 2s ease-out forwards; }
                .animate-frenzy-burst { animation: frenzy-burst 2s ease-out forwards; }
            `}</style>
            
            <div className="max-w-6xl mx-auto animate-fade-in flex flex-col min-h-[80vh]">
                {/* Battle Arena */}
                <div className="relative flex-1 flex items-center justify-center px-4 py-8">
                    {/* Background arena effect */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-violet-900/10 to-transparent" />
                        <div className="absolute inset-0 border-b border-violet-500/10" style={{ 
                            background: 'radial-gradient(ellipse at center bottom, rgba(139,92,246,0.05) 0%, transparent 70%)' 
                        }} />
                    </div>
                    
                    {/* Skill Activations */}
                    {activeSkill && (
                        <SkillActivation 
                            key={`active-${activeSkill.characterId}`} 
                            name={activeSkill.skillName} 
                            type="active" 
                            position={activeSkill.characterId === fighters[0].base.id ? 'left' : 'right'} 
                        />
                    )}
                    {activePassive && (
                        <SkillActivation 
                            key={activePassive.key} 
                            name={activePassive.skillName} 
                            type="passive" 
                            position={activePassive.characterId === fighters[0].base.id ? 'left' : 'right'} 
                        />
                    )}
                    
                    {/* Fighters */}
                    <div className="relative z-10 flex items-center justify-between w-full max-w-4xl gap-8">
                        <div className="flex-1">
                            <CharacterDisplay 
                                character={fighters[0]} 
                                isTurn={currentAttackerId === fighters[0].base.id}
                                isFrenzy={isFrenzy}
                                activeDialogue={activeDialogue}
                                animationTrigger={animationTrigger}
                                battleEvent={battleEvent}
                            />
                        </div>
                        
                        {/* VS indicator */}
                        <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 blur-xl bg-violet-500/20 rounded-full" />
                            <div className="relative font-display text-3xl sm:text-4xl font-bold text-violet-400">
                                VS
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <CharacterDisplay 
                                character={fighters[1]} 
                                isFlipped 
                                isTurn={currentAttackerId === fighters[1].base.id}
                                isFrenzy={isFrenzy}
                                activeDialogue={activeDialogue}
                                animationTrigger={animationTrigger}
                                battleEvent={battleEvent}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Roll Display Area */}
                <div className="h-48 flex items-center justify-center px-4">
                    {hitCheckRequest && (
                        <ContestedRollDisplay 
                            key={`hit-${turnCount}-${hitCheckRequest.payload.attackerId}`}
                            request={hitCheckRequest} 
                            onComplete={resolveHitCheck} 
                            type="hit" 
                            attackerId={hitCheckRequest.payload.attackerId} 
                            leftFighterId={fighters[0].base.id} 
                        />
                    )}
                    {damageRollRequest && (
                        <ContestedRollDisplay 
                            key={`damage-${turnCount}-${damageRollRequest.payload.attackerId}`}
                            request={damageRollRequest} 
                            onComplete={resolveDamageRoll} 
                            type="damage" 
                            attackerId={damageRollRequest.payload.attackerId} 
                            leftFighterId={fighters[0].base.id} 
                        />
                    )}
                </div>
                
                {/* Battle Log */}
                <div className="px-4 pb-4">
                    <BattleLog log={log} winner={winner} />
                </div>
            </div>
            
            {/* Overlays */}
            {showFrenzyIndicator && !winner && <FrenzyIndicator />}
            {showVictory && winner && <VictoryScreen winner={winner} onReturn={() => onBattleEnd(winner.base.id)} />}
        </>
    );
};

export default BattleScreen;
