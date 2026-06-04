import React, { useRef, useEffect } from 'react';
import { ActiveStatusEffect, StatusEffectType } from '../../types';
import { useLanguage, TranslationKeys } from '../../contexts/LanguageContext';
import { getImageUrl } from '../../utils/imageUtils';

export const ManaPips: React.FC<{ mana: number; maxMana: number; isFlipped?: boolean }> = ({ mana, maxMana, isFlipped }) => (
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

export const HpBar: React.FC<{ current: number; max: number; isFlipped?: boolean }> = ({ current, max, isFlipped }) => {
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

export const GaugeBar: React.FC<{ value: number; max: number; isFlipped?: boolean }> = ({ value, max, isFlipped }) => {
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

export const StatusEffectBadge: React.FC<{ effect: ActiveStatusEffect }> = ({ effect }) => {
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

export const DamageNumber: React.FC<{ value: number | string; type: 'damage' | 'heal' | 'block' | 'miss' }> = ({ value, type }) => {
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

export const SkillActivation: React.FC<{ 
    name: string; 
    type: 'active' | 'passive';
    position: 'left' | 'right';
}> = ({ name, type, position }) => {
    const isActive = type === 'active';

    return (
        <div className={`absolute top-1/2 ${position === 'left' ? 'left-[15%]' : 'right-[15%]'} -translate-y-1/2 z-40`}>
            <div className="relative animate-skill-burst">
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

export const SpeechBubble: React.FC<{ text: string; isFlipped?: boolean }> = ({ text, isFlipped }) => (
    <div className={`absolute -top-4 transform -translate-y-full ${isFlipped ? 'right-0' : 'left-0'} z-20`}>
        <div className="relative bg-white text-slate-800 text-sm font-medium px-4 py-2 rounded-2xl shadow-xl animate-speech-bubble max-w-[200px]">
            <div className="relative z-10">{text}</div>
            <div className={`absolute w-4 h-4 bg-white transform rotate-45 -bottom-1.5 ${isFlipped ? 'right-6' : 'left-6'}`} />
        </div>
    </div>
);

export const BattleLog: React.FC<{ log: string[]; winner: any }> = ({ log, winner }) => {
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

export const VictoryScreen: React.FC<{ winner: any; onReturn: () => void }> = ({ winner, onReturn }) => {
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
                            <img src={getImageUrl(winner.base.image)} alt={winner.base.name} className="w-full h-full object-cover" />
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

export const FrenzyIndicator: React.FC = () => {
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
