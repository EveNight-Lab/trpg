import React, { useState, useEffect } from 'react';
import { HitCheckRequest, DamageRollRequest, RollInfo } from '../hooks/useBattleEngine';
import { useLanguage } from '../contexts/LanguageContext';
import ValueResolver from './i18n/DiceRoller';

// ─────────────────────────────────────────────
// RollCard: 반드시 파일 최상위에 정의해야 합니다.
// 내부에 정의하면 부모 리렌더 시마다 새 타입으로 인식되어
// ValueResolver가 unmount/remount 되면서 주사위가 2번 굴러갑니다.
// ─────────────────────────────────────────────

interface RollCardProps {
    role: 'attacker' | 'defender';
    rollType: 'hit' | 'damage';
    info: RollInfo;
    cardState: string;
    onResolve: (value: number) => void;
    payloadId: string;
    resolvedValue: number | null;
}

const RollCard: React.FC<RollCardProps> = ({ role, rollType, info, cardState, onResolve, payloadId, resolvedValue }) => {
    const isAttacker = role === 'attacker';
    const iconColor = isAttacker
        ? (rollType === 'hit' ? 'text-orange-400' : 'text-red-400')
        : (rollType === 'hit' ? 'text-cyan-400' : 'text-blue-400');

    const Icon = () => {
        if (rollType === 'hit') {
            return isAttacker ? (
                <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                </svg>
            ) : (
                <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>
                </svg>
            );
        } else {
            return isAttacker ? (
                <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 6l6-3 3 3-3 6-3-3M9.5 17.5L21 6V3h-3L6.5 14.5"/>
                </svg>
            ) : (
                <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
            );
        }
    };

    const getCardStyles = () => {
        const base = 'relative rounded-2xl p-1 transition-all duration-500';
        if (cardState === 'rolling') return `${base} bg-gradient-to-br from-slate-700 to-slate-800`;
        if (cardState === 'win') return `${base} bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 scale-105 shadow-[0_0_30px_rgba(251,191,36,0.5)]`;
        return `${base} bg-gradient-to-br from-slate-700 to-slate-800 opacity-50 scale-95`;
    };

    return (
        <div className={getCardStyles()}>
            {cardState === 'rolling' && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                         style={{ backgroundSize: '200% 100%' }} />
                </div>
            )}
            {cardState === 'win' && (
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/30 to-yellow-400/30 blur-xl animate-pulse" />
            )}

            <div className="relative bg-slate-900/95 rounded-xl overflow-hidden">
                <div className={`px-4 py-2 flex items-center justify-center gap-2 ${
                    isAttacker
                        ? 'bg-gradient-to-r from-red-900/50 to-orange-900/50'
                        : 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50'
                }`}>
                    <Icon />
                    <span className="font-heading text-sm font-semibold text-white uppercase tracking-wider">
                        {info.label}
                    </span>
                    {info.bonus !== 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            info.bonus > 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'
                        }`}>
                            {info.bonus > 0 ? `+${info.bonus}` : info.bonus}
                        </span>
                    )}
                </div>

                <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                    {resolvedValue !== null ? (
                        <div
                            className={`font-display font-bold text-6xl sm:text-7xl transition-all duration-300 ${
                                cardState === 'win' ? 'scale-110 animate-pulse' : 'scale-95 opacity-70'
                            }`}
                            style={{
                                color: cardState === 'win' ? '#fbbf24' : '#94a3b8',
                                textShadow: cardState === 'win'
                                    ? '0 0 30px rgba(251, 191, 36, 0.8), 0 4px 20px rgba(0,0,0,0.5)'
                                    : '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                        >
                            {resolvedValue}
                        </div>
                    ) : (
                        <ValueResolver
                            key={`${role}-${payloadId}`}
                            title=""
                            grade={info.grade}
                            bonus={info.bonus}
                            statName={info.label}
                            onResolveComplete={onResolve}
                        />
                    )}
                </div>

                {cardState !== 'rolling' && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                        cardState === 'win' ? 'bg-amber-500/10' : 'bg-black/30'
                    }`}>
                        {cardState === 'win' && (
                            <div className="absolute top-2 right-2">
                                <span className="text-2xl">✓</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// ContestedRollDisplay
// ─────────────────────────────────────────────

interface ContestedRollDisplayProps {
    request: HitCheckRequest | DamageRollRequest;
    onComplete: (attackerResult: number, defenderResult: number) => void;
    type: 'hit' | 'damage';
    attackerId: string;
    leftFighterId: string;
}

const ContestedRollDisplay: React.FC<ContestedRollDisplayProps> = ({
    request, onComplete, type, attackerId, leftFighterId
}) => {
    const { t } = useLanguage();
    const [attackerResult, setAttackerResult] = useState<number | null>(null);
    const [defenderResult, setDefenderResult] = useState<number | null>(null);

    const isComplete = attackerResult !== null && defenderResult !== null;
    const isAttackerOnLeft = attackerId === leftFighterId;

    useEffect(() => {
        if (!isComplete) return;
        const timer = setTimeout(() => {
            onComplete(attackerResult!, defenderResult!);
        }, 2000);
        return () => clearTimeout(timer);
    // onComplete는 useCallback으로 메모이즈 되어있으므로 deps에서 제외해도 안전합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete]);

    const getResultState = () => {
        if (!isComplete) return { attacker: 'rolling', defender: 'rolling' };
        const attackerWins = attackerResult! > defenderResult!;
        return {
            attacker: attackerWins ? 'win' : 'lose',
            defender: attackerWins ? 'lose' : 'win'
        };
    };

    const resultState = getResultState();

    const attackerCard = (
        <RollCard
            role="attacker"
            rollType={type}
            info={request.attacker}
            cardState={resultState.attacker}
            onResolve={setAttackerResult}
            payloadId={request.payload.attackerId}
            resolvedValue={attackerResult}
        />
    );

    const defenderCard = (
        <RollCard
            role="defender"
            rollType={type}
            info={request.defender}
            cardState={resultState.defender}
            onResolve={setDefenderResult}
            payloadId={request.payload.defenderId}
            resolvedValue={defenderResult}
        />
    );

    return (
        <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in-scale">
            <div className="mb-4 text-center">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
                    type === 'hit'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                }`}>
                    {type === 'hit' ? t('hitCheckLabel') || 'Hit Check' : t('damageRollLabel') || 'Damage Roll'}
                </span>
            </div>

            <div className="flex items-center justify-center gap-6 sm:gap-10">
                {isAttackerOnLeft ? attackerCard : defenderCard}

                <div className="relative">
                    <div className="absolute inset-0 blur-lg bg-white/10 rounded-full" />
                    <div className="relative w-12 h-12 rounded-full border-2 border-slate-600 bg-slate-800/80 flex items-center justify-center">
                        <span className="font-display text-lg font-bold text-slate-400">VS</span>
                    </div>
                </div>

                {isAttackerOnLeft ? defenderCard : attackerCard}
            </div>

            {isComplete && (
                <div className="mt-6 animate-fade-in-up flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <span className={`${attackerResult! > defenderResult! ? 'text-amber-400' : 'text-slate-400'}`}>
                            {attackerResult}
                        </span>
                        <span className="text-slate-500">vs</span>
                        <span className={`${defenderResult! >= attackerResult! ? 'text-amber-400' : 'text-slate-400'}`}>
                            {defenderResult}
                        </span>
                    </div>

                    <div className={`px-6 py-2 rounded-lg font-bold text-lg ${
                        attackerResult! > defenderResult!
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                        {type === 'hit'
                            ? (attackerResult! > defenderResult!
                                ? `✓ ${t('hitSuccess') || 'HIT!'} (+${attackerResult! - defenderResult!})`
                                : `✗ ${t('hitMiss') || 'MISS!'} (${attackerResult! - defenderResult!})`)
                            : (attackerResult! > defenderResult!
                                ? `⚔ ${attackerResult! - defenderResult!} ${t('damageDealtShort') || 'DAMAGE'}`
                                : `🛡 ${t('damageBlocked') || 'BLOCKED!'} (+${defenderResult! - attackerResult!})`)
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestedRollDisplay;
