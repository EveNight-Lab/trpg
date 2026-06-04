import React, { useState, useEffect } from 'react';
import { GeneratedCharacter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useBattleEngine } from '../hooks/useBattleEngine';
import ContestedRollDisplay from './ContestedRollDisplay';
import CharacterDisplay from './battle/CharacterDisplay';
import { 
    SkillActivation, BattleLog, VictoryScreen, FrenzyIndicator 
} from './battle/BattleUIComponents';

interface BattleScreenProps {
    combatant1: GeneratedCharacter;
    combatant2: GeneratedCharacter;
    onBattleEnd: (winnerId: string | null) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ combatant1, combatant2, onBattleEnd }) => {
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
