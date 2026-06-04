import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GeneratedCharacter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { gradeToValue } from '../utils/diceUtils';

interface RecruitmentMinigameProps {
  character: GeneratedCharacter;
  onEnd: (success: boolean) => void;
}

const ManaOrb: React.FC<{ status: 'pending' | 'success' | 'failure' }> = ({ status }) => {
    const baseClasses = "w-6 h-6 rounded-full transition-all duration-300 ring-2 ring-black/30";
    const statusClasses = {
        pending: "bg-slate-600",
        success: "bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.7)] scale-110",
        failure: "bg-red-800",
    };
    return <div className={`${baseClasses} ${statusClasses[status]}`}></div>;
};


const RecruitmentMinigame: React.FC<RecruitmentMinigameProps> = ({ character, onEnd }) => {
  const { t } = useLanguage();

  const gameParams = useMemo(() => {
    const vitality = gradeToValue(character.stats.Vitality, character.bonusStats.Vitality, 'Vitality');
    const defense = gradeToValue(character.stats.Defense, character.bonusStats.Defense, 'Defense');
    const attack = gradeToValue(character.stats.Attack, character.bonusStats.Attack, 'Attack');
    const precision = gradeToValue(character.stats.Precision, character.bonusStats.Precision, 'Precision');
    const agility = gradeToValue(character.stats.Agility, character.bonusStats.Agility, 'Agility');
    const speed = gradeToValue(character.stats.Speed, character.bonusStats.Speed, 'Speed');
    const mana = gradeToValue(character.stats.Mana, character.bonusStats.Mana, 'Mana');

    return {
      maxGauge: 150 + vitality,
      manaCount: Math.max(1, mana),
      successAmount: 10 + defense * 0.5,
      failurePenalty: 12 + attack * 0.4,
      perfectChainBonus: 20,
      successZoneWidth: Math.max(0.08, 0.25 - precision * 0.005),
      indicatorSpeed: 0.6 + agility * 0.04,
      timeBetweenBars: Math.max(100, 400 - speed * 10),
    };
  }, [character]);
  
  const [gauge, setGauge] = useState(gameParams.maxGauge / 3);
  const [gameStatus, setGameStatus] = useState<'idle' | 'chaining' | 'won' | 'lost'>('idle');
  const [feedback, setFeedback] = useState<'hit' | 'miss' | 'perfect' | null>(null);
  
  // Chain-specific state
  const [chainIndex, setChainIndex] = useState(0);
  const [chainResults, setChainResults] = useState<('pending' | 'success' | 'failure')[]>(Array(gameParams.manaCount).fill('pending'));
  
  // Animation state
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const indicatorDirection = useRef(1);
  const chainDirectionRef = useRef(1); // Holds the direction for the entire chain.
  const positionRef = useRef(0); // Use a ref to get the real-time position on click

  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  
  // Win/Loss condition check
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    if (gauge >= gameParams.maxGauge) {
      setGameStatus('won');
      setTimeout(() => onEndRef.current(true), 1500);
    } else if (gauge <= 0) {
      setGameStatus('lost');
      setTimeout(() => onEndRef.current(false), 1500);
    }
  }, [gauge, gameParams.maxGauge, gameStatus]);
  
  // Animation loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const speed = gameParams.indicatorSpeed;
      
      setIndicatorPosition(prevPos => {
        let newPos = prevPos + (speed * (deltaTime / 1000) * indicatorDirection.current);
        // 끝에 닿으면 방향을 반전해 바운스 처리
        if (newPos >= 1) {
          newPos = 1 - (newPos - 1); // 반사
          indicatorDirection.current = -1;
        } else if (newPos <= 0) {
          newPos = Math.abs(newPos); // 반사
          indicatorDirection.current = 1;
        }
        positionRef.current = newPos;
        return newPos;
      });
    }
    lastTimeRef.current = time;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [gameParams.indicatorSpeed]);

  const startBarAnimation = useCallback(() => {
    const startPos = chainDirectionRef.current === 1 ? 0 : 1;
    setIndicatorPosition(startPos);
    positionRef.current = startPos; // Sync ref with state
    indicatorDirection.current = chainDirectionRef.current;
    
    lastTimeRef.current = performance.now();
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Main action handler
  const handleAction = () => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    if (gameStatus === 'idle') {
        chainDirectionRef.current = 1; // Always start from left to right
        setGameStatus('chaining');
        setChainIndex(0);
        setChainResults(Array(gameParams.manaCount).fill('pending'));
        startBarAnimation();
        return;
    }

    if (gameStatus === 'chaining') {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        const zoneStart = (1 - gameParams.successZoneWidth) / 2;
        const zoneEnd = zoneStart + gameParams.successZoneWidth;
        const currentPosition = positionRef.current; // Read from the ref for accuracy
        const isSuccess = currentPosition >= zoneStart && currentPosition <= zoneEnd;

        const newResults = [...chainResults];
        newResults[chainIndex] = isSuccess ? 'success' : 'failure';
        setChainResults(newResults);
        setFeedback(isSuccess ? 'hit' : 'miss');
        setTimeout(() => setFeedback(null), 300);

        // Apply gauge change immediately
        const gaugeChange = isSuccess ? gameParams.successAmount : -gameParams.failurePenalty;
        setGauge(prev => Math.max(0, Math.min(gameParams.maxGauge, prev + gaugeChange)));

        const isChainOver = chainIndex >= gameParams.manaCount - 1;

        if (isChainOver) {
            // A chain is complete. Check for perfect bonus, then reset for the next chain.
            if (newResults.every(r => r === 'success')) {
                setGauge(prev => Math.max(0, Math.min(gameParams.maxGauge, prev + gameParams.perfectChainBonus)));
                setFeedback('perfect');
                setTimeout(() => setFeedback(null), 1000);
            }
            
            setChainIndex(0);
            setChainResults(Array(gameParams.manaCount).fill('pending'));
            chainDirectionRef.current = 1; // Always start from left to right
            
            setTimeout(startBarAnimation, gameParams.timeBetweenBars);

        } else {
            // Continue the current chain.
            setChainIndex(prev => prev + 1);
            setTimeout(startBarAnimation, gameParams.timeBetweenBars);
        }
    }
  };
  
  const gaugePercentage = (gauge / gameParams.maxGauge) * 100;
  const buttonDisabled = gameStatus !== 'idle' && gameStatus !== 'chaining';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 animate-fade-in-fast backdrop-blur-sm" onClick={() => onEnd(false)}>
      <div className="bg-slate-900/80 rounded-lg shadow-2xl w-full max-w-sm mx-4 border border-slate-700 text-center p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white font-cinzel mb-2">{t('tugOfWarTitle', { characterName: character.name })}</h3>
        <p className="text-sm text-slate-400 mb-6">{t('tugOfWarInstructions')}</p>

        <div className="flex justify-center items-end gap-4 h-64">
            <div className="relative w-24 h-full bg-slate-800 rounded-lg overflow-hidden ring-1 ring-slate-600 flex flex-col justify-end">
                <div className="absolute inset-x-0 top-2 text-center z-10">
                    <p className="text-xs font-bold text-slate-300">{t('gaugeStatus')}</p>
                    <p className="text-lg font-bold text-white">{Math.round(gaugePercentage)}%</p>
                </div>
                <div className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 transition-all duration-200 ease-linear" style={{ height: `${gaugePercentage}%` }}></div>
                {feedback === 'hit' && <div className="absolute inset-0 bg-green-500/50 animate-pulse-once"></div>}
                {feedback === 'miss' && <div className="absolute inset-0 bg-red-500/50 animate-pulse-once"></div>}
            </div>
        </div>

        <div className="h-12 flex flex-col items-center justify-center my-2">
          {gameStatus === 'won' ? (
            <div className="text-2xl font-bold text-green-400 animate-pulse">{t('gameWon')}</div>
          ) : gameStatus === 'lost' ? (
            <div className="text-2xl font-bold text-red-400 animate-pulse">{t('gameLost')}</div>
          ) : feedback === 'perfect' ? (
            <div className="text-lg font-bold text-yellow-300 animate-pulse">{t('perfectChain')}</div>
          ) : null}
        </div>
        
        <div className="mt-8 space-y-4">
             <div className="flex justify-center items-center gap-2 h-6">
                {chainResults.map((status, index) => (
                    <ManaOrb key={index} status={status} />
                ))}
             </div>
            <div className="relative w-full h-8 bg-slate-800 rounded-full overflow-hidden ring-1 ring-slate-600">
                <div className="absolute h-full bg-slate-600/50" style={{ left: `${(1 - gameParams.successZoneWidth) / 2 * 100}%`, width: `${gameParams.successZoneWidth * 100}%` }}></div>
                <div className="absolute top-0 h-full w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" style={{ left: `calc(${indicatorPosition * 100}% - 4px)` }}></div>
            </div>
            <button
              onClick={handleAction}
              disabled={buttonDisabled}
              className="w-full py-3 text-lg font-bold rounded-lg transition-all duration-200 text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {gameStatus === 'chaining' ? `${t('pullButton')} (${chainIndex + 1}/${gameParams.manaCount})` : t('pullButton')}
            </button>
        </div>
        <style>{`
            @keyframes pulse-once { 0% { opacity: 0.8; } 100% { opacity: 0; } }
            .animate-pulse-once { animation: pulse-once 0.4s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default RecruitmentMinigame;
