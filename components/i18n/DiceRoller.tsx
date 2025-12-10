import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatGrade, StatName } from '../../types';
import { rollGrade, getGradeColorHex } from '../../utils/diceUtils';

interface ValueResolverProps {
    title: string;
    grade: StatGrade;
    bonus: number;
    statName: StatName;
    onResolveComplete: (result: number) => void;
}

const ValueResolver: React.FC<ValueResolverProps> = ({ title, grade, bonus, statName, onResolveComplete }) => {
    const { t } = useLanguage();
    const [displayNumber, setDisplayNumber] = useState<number>(1);
    const [isResolving, setIsResolving] = useState(true);
    const resolved = useRef(false);
    
    const onCompleteRef = useRef(onResolveComplete);
    useEffect(() => {
        onCompleteRef.current = onResolveComplete;
    }, [onResolveComplete]);


    const [isHolding, setIsHolding] = useState(false); // 결과 고정 상태
    
    useEffect(() => {
        resolved.current = false;
        setIsResolving(true);
        setIsHolding(false);
        const result = rollGrade(grade, bonus, statName);
        
        const animationDuration = 800;
        const intervalDuration = 40;
        let elapsed = 0;

        const rollInterval = setInterval(() => {
            // More dynamic number rolling
            const variation = Math.floor(Math.random() * 30) + 1;
            setDisplayNumber(variation);
            elapsed += intervalDuration;

            if (elapsed >= animationDuration) {
                clearInterval(rollInterval);
                setDisplayNumber(result);
                setIsResolving(false);
                setIsHolding(true); // 결과 고정 시작
            }
        }, intervalDuration);

        return () => clearInterval(rollInterval);
    }, [grade, bonus, statName]);

    // 결과가 나온 후 1초 동안 고정 후 완료 신호
    useEffect(() => {
        if (!isResolving && isHolding && !resolved.current) {
            const holdTimer = setTimeout(() => {
                resolved.current = true;
                setIsHolding(false);
                onCompleteRef.current(displayNumber);
            }, 1000); // 1초 동안 결과 고정
            
            return () => clearTimeout(holdTimer);
        }
    }, [isResolving, isHolding, displayNumber]);
    
    const gradeColor = getGradeColorHex(grade);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            {/* Rolling animation background */}
            {isResolving && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 animate-pulse" />
                    {/* Sparkle effects */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                                animationDelay: `${i * 100}ms`,
                                animationDuration: '600ms'
                            }}
                        />
                    ))}
                </div>
            )}
            
            {/* Number display */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div 
                    className={`font-display font-bold transition-all duration-300 ${
                        isResolving 
                            ? 'text-5xl sm:text-6xl text-white animate-bounce-subtle' 
                            : isHolding
                                ? 'text-6xl sm:text-7xl scale-115 animate-pulse-glow'
                                : 'text-6xl sm:text-7xl scale-110'
                    }`}
                    style={{ 
                        color: isResolving ? 'white' : gradeColor,
                        textShadow: isResolving 
                            ? '0 0 20px rgba(255,255,255,0.5)' 
                            : isHolding
                                ? `0 0 40px ${gradeColor}, 0 0 60px ${gradeColor}80, 0 4px 20px rgba(0,0,0,0.5)`
                                : `0 0 30px ${gradeColor}80, 0 4px 20px rgba(0,0,0,0.5)`
                    }}
                >
                    {displayNumber}
                </div>
                
                {/* Result ring animation - 결과 고정 시 표시 */}
                {isHolding && (
                    <>
                        <div 
                            className="absolute inset-0 rounded-full border-4 animate-ping-once pointer-events-none"
                            style={{ borderColor: gradeColor }}
                        />
                        {/* 고정 상태 강조 링 */}
                        <div 
                            className="absolute -inset-2 rounded-full border-2 animate-spin-slow pointer-events-none opacity-50"
                            style={{ borderColor: gradeColor, borderStyle: 'dashed' }}
                        />
                    </>
                )}
            </div>
            
            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes ping-once {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { transform: scale(1.15); filter: brightness(1); }
                    50% { transform: scale(1.2); filter: brightness(1.2); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 0.2s ease-in-out infinite;
                }
                .animate-ping-once {
                    animation: ping-once 0.5s ease-out forwards;
                }
                .animate-pulse-glow {
                    animation: pulse-glow 0.8s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                .scale-115 {
                    transform: scale(1.15);
                }
            `}</style>
        </div>
    );
};

export default ValueResolver;
