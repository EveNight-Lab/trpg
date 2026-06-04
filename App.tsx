import React, { useState, useEffect, useCallback } from 'react';
import { UserCharacterInput, GeneratedCharacter, VictoryImage, Trait, PassiveSkill, CharacterStats, SpecialSkill, CombatLines, BonusStats, StatGrade, ChatMessage, ResonancePassive } from './types';
import { generateCharacterDetails, generateCharacterImage, generateBattleImage, generateNewTrait, generateNewPassiveSkill, generateNewSpecialSkill, generatePostRecruitmentChatResponse } from './services/geminiService';
import CharacterInputForm from './components/CharacterInputForm';
import CharacterSheet from './components/i18n/CharacterSheet';
import LoadingSpinner from './components/LoadingSpinner';
import CharacterGallery from './components/CharacterGallery';
import BattleScreen from './components/BattleScreen';
import ChatView from './components/ChatView';
import RecruitmentMinigame from './components/RecruitmentMinigame';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import BattleRewardModal from './components/BattleRewardModal';
import InterstitialAdModal from './components/InterstitialAdModal';
import { getFinalCharacterStats } from './utils/diceUtils';
import RecruitmentResultModal from './components/RecruitmentResultModal';
import LandingPage from './components/LandingPage';
import { RESONANCE_EXP_PER_WIN, RESONANCE_EXP_PER_CHAT, RESONANCE_LEVEL_THRESHOLDS, RECRUITMENT_COOLDOWN_MS } from './utils/constants';
import { useCharacterStorage, FIXED_BASE_STATS } from './hooks/useCharacterStorage';

type View = 'landing' | 'form' | 'sheet' | 'gallery' | 'battle' | 'chat';

const AppContent: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  // App State
  const [view, setView] = useState<View>('landing');
  const [userInput, setUserInput] = useState<UserCharacterInput>({
    name: '', race: '', backstory: '', appearance: '', combatStyle: '', personality: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Character Storage custom hook
  const { savedCharacters, setSavedCharacters, isHydrating, deleteCharacter } = useCharacterStorage();

  // Character Data State
  const [currentCharacter, setCurrentCharacter] = useState<GeneratedCharacter | null>(null);
  const [combatants, setCombatants] = useState<[GeneratedCharacter, GeneratedCharacter] | null>(null);
  
  // Post-battle state
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [lastBattleWinner, setLastBattleWinner] = useState<GeneratedCharacter | null>(null);
  const [lastBattleLoser, setLastBattleLoser] = useState<GeneratedCharacter | null>(null);
  const [battleMementoImage, setBattleMementoImage] = useState<string | null>(null);
  const [isPlayerWin, setIsPlayerWin] = useState(false);
  
  // Recruitment state
  const [recruitmentResult, setRecruitmentResult] = useState<'success' | 'failure' | null>(null);
  const [isMinigameOpen, setIsMinigameOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const detailsWithoutStats = await generateCharacterDetails(userInput, language);
      const imageBase64 = await generateCharacterImage(detailsWithoutStats);
      const id = crypto.randomUUID();

      // FIX: Calculate final stats immediately upon creation.
      const { finalStats, finalBonusStats } = getFinalCharacterStats(FIXED_BASE_STATS, detailsWithoutStats.traits);

      const newCharacter: GeneratedCharacter = { 
        ...detailsWithoutStats, 
        stats: finalStats,
        bonusStats: finalBonusStats,
        image: imageBase64,
        imageKey: `portrait-${id}`,
        id: id,
        wins: 0,
        losses: 0,
        victoryImages: [],
        victoryPoints: 5,
        unlockedTraits: detailsWithoutStats.traits,
        unlockedPassiveSkills: [detailsWithoutStats.passiveSkill],
        unlockedSpecialSkills: [detailsWithoutStats.specialSkill],
        status: 'UNRECRUITED',
        cooldownUntil: null,
        postRecruitmentChatHistory: [],
        resonanceLevel: 0,
        resonanceExp: 0,
        resonancePassive: null, // Starts unequipped
        unlockedResonancePassives: detailsWithoutStats.resonancePassive ? [detailsWithoutStats.resonancePassive] : [],
      };
      
      setCurrentCharacter(newCharacter);
      setView('sheet');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred. Please try again.';
      setError(errorMessage);
      setView('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCharacter = useCallback(() => {
    if (currentCharacter && !savedCharacters.find(c => c.id === currentCharacter.id)) {
      setSavedCharacters(prev => [...prev, currentCharacter]);
    }
  }, [currentCharacter, savedCharacters]);
  
  const handleDeleteCharacter = useCallback(async (idToDelete: string) => {
    await deleteCharacter(idToDelete);
    handleReturnToGallery();
  }, [deleteCharacter]);

  const handleStartBattle = (char1: GeneratedCharacter, char2: GeneratedCharacter) => {
    setCombatants([char1, char2]);
    setView('battle');
  };

    const handleResonanceLevelUp = (character: GeneratedCharacter): GeneratedCharacter => {
        const newLevel = character.resonanceLevel + 1;
        console.log(`${character.name} reached Resonance Level ${newLevel}!`);
        let updatedChar = { ...character, resonanceLevel: newLevel };

        // --- DEFINE LEVEL-UP REWARDS HERE ---
        if (newLevel === 1) {
            // Unlock and equip the first resonance passive
            if (updatedChar.unlockedResonancePassives.length > 0) {
                updatedChar.resonancePassive = updatedChar.unlockedResonancePassives[0];
            }
        }
        // Add more rewards for level 2, 3, etc. later
        // if (newLevel === 2) { ... }

        return updatedChar;
    };


  const handleBattleEnd = (winnerId: string | null) => {
    if (!combatants) return;

    const [char1, char2] = combatants;
    const winner = winnerId ? (winnerId === char1.id ? char1 : char2) : null;
    const loser = winnerId ? (winnerId === char1.id ? char2 : char1) : null;
    
    const playerWon = !!winner && winner.id === char1.id;
    setIsPlayerWin(playerWon);

    if (winner && loser) {
        setLastBattleWinner(winner);
        setLastBattleLoser(loser);
        setSavedCharacters(prev => prev.map(char => {
            if (char.id === winner.id) {
                let updatedChar = { 
                    ...char, 
                    wins: char.wins + 1, 
                    victoryPoints: char.victoryPoints + 1,
                    resonanceExp: char.resonanceExp + RESONANCE_EXP_PER_WIN,
                };

                // Check for resonance level up
                const expForNextLevel = RESONANCE_LEVEL_THRESHOLDS[updatedChar.resonanceLevel + 1];
                if (expForNextLevel && updatedChar.resonanceExp >= expForNextLevel) {
                    updatedChar = handleResonanceLevelUp(updatedChar);
                }
                
                return updatedChar;
            }
            if (char.id === loser.id) return { ...char, losses: (char.losses || 0) + 1 };
            return char;
        }));
    } else {
        setLastBattleWinner(null);
        setLastBattleLoser(null);
    }

    setCombatants(null);
    setCurrentCharacter(null);
    setIsAdVisible(true);
  };

  const handleAdClose = () => {
    setIsAdVisible(false);

    if (isPlayerWin && lastBattleWinner && lastBattleLoser) {
        setIsRewardModalOpen(true);
        // Generate memento image *after* the ad, while showing the reward modal's loading spinner.
        generateBattleImage(lastBattleWinner, lastBattleLoser)
            .then(battleImage => {
                setBattleMementoImage(battleImage);
                const newVictory: VictoryImage = { 
                    image: battleImage, 
                    opponentName: lastBattleLoser.name,
                    imageKey: `memento-${lastBattleWinner.id}-${Date.now()}`
                };
                
                setSavedCharacters(prev => prev.map(char => {
                    if (char.id === lastBattleWinner.id) {
                        return { ...char, victoryImages: [...(char.victoryImages || []), newVictory] };
                    }
                    return char;
                }));
            })
            .catch(err => {
                console.error("Failed to generate battle memento:", err);
                setBattleMementoImage('ERROR'); // To unblock the UI
            });
    } else {
        // If player lost or it was a draw, just go back to the gallery.
        handleReturnToGallery();
    }
  };
  
  const handleCloseRewardModal = () => {
    setIsRewardModalOpen(false);
    setLastBattleWinner(null);
    setLastBattleLoser(null);
    setBattleMementoImage(null);
    setIsPlayerWin(false);
    setView('gallery');
  };


  const handleViewCharacter = (character: GeneratedCharacter) => {
    setCurrentCharacter(character);
    setView('sheet');
  };

  const handleReturnToForm = () => {
    setCurrentCharacter(null);
    setUserInput({ name: '', race: '', backstory: '', appearance: '', combatStyle: '', personality: '' });
    setError(null);
    setView('form');
  };
  
  const handleReturnToGallery = () => {
    setCombatants(null);
    setCurrentCharacter(null);
    setView('gallery');
  };
  
  const handleReturnToLanding = () => {
    setUserInput({
      name: '', race: '', backstory: '', appearance: '', combatStyle: '', personality: '',
    });
    setError(null);
    setView('landing');
  };

  const handleUnlockAbility = async (characterId: string, abilityType: 'trait' | 'passive' | 'special', cost: number) => {
    const character = savedCharacters.find(c => c.id === characterId);
    if (!character || character.victoryPoints < cost) return;

    setIsLoading(true);
    setError(null);
    try {
        let newAbility: Trait | PassiveSkill | SpecialSkill;
        switch (abilityType) {
            case 'trait':
                newAbility = await generateNewTrait(character, language);
                break;
            case 'passive':
                newAbility = await generateNewPassiveSkill(character, language);
                break;
            case 'special':
                newAbility = await generateNewSpecialSkill(character, language);
                break;
        }

        if (!newAbility) {
            throw new Error(`Failed to generate new ${abilityType}`);
        }

        setSavedCharacters(prev => prev.map(char => {
            if (char.id === characterId) {
                const updatedChar = { 
                    ...char, 
                    victoryPoints: char.victoryPoints - cost,
                    unlockedTraits: abilityType === 'trait' ? [...char.unlockedTraits, newAbility as Trait] : char.unlockedTraits,
                    unlockedPassiveSkills: abilityType === 'passive' ? [...char.unlockedPassiveSkills, newAbility as PassiveSkill] : char.unlockedPassiveSkills,
                    unlockedSpecialSkills: abilityType === 'special' ? [...char.unlockedSpecialSkills, newAbility as SpecialSkill] : char.unlockedSpecialSkills,
                };
                setCurrentCharacter(updatedChar); // Update sheet view in real-time
                return updatedChar;
            }
            return char;
        }));

    } catch (err) {
        console.error(`Failed to generate new ${abilityType}`, err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleEquipAbilities = (characterId: string, abilityType: 'trait' | 'passive' | 'special', equippedAbilities: any) => {
    // This function defines the logic for updating a single character.
    // It's used to keep the updates consistent for both the main list and the detailed view.
    const getUpdatedCharacter = (charToUpdate: GeneratedCharacter) => {
        const updated = { ...charToUpdate };

        switch (abilityType) {
            case 'trait':
                updated.traits = equippedAbilities as Trait[];
                break;
            case 'passive':
                updated.passiveSkill = equippedAbilities as PassiveSkill;
                break;
            case 'special':
                updated.specialSkill = equippedAbilities as SpecialSkill;
                break;
        }

        // Stat recalculation is only necessary when traits change.
        const { finalStats, finalBonusStats } = getFinalCharacterStats(FIXED_BASE_STATS, updated.traits);
        updated.stats = finalStats;
        updated.bonusStats = finalBonusStats;
        
        return updated;
    };

    // Use a functional update for the main character list.
    // This is the most robust way to prevent race conditions from stale state.
    setSavedCharacters(prevSaved => 
        prevSaved.map(char => 
            char.id === characterId ? getUpdatedCharacter(char) : char
        )
    );

    // If the character being viewed is the one that was edited,
    // we must also update its state using the same robust, functional pattern.
    if (currentCharacter?.id === characterId) {
        setCurrentCharacter(prevCurrent => {
            if (!prevCurrent) return null;
            return getUpdatedCharacter(prevCurrent);
        });
    }
  };

  const handleStartRecruitment = (character: GeneratedCharacter) => {
      setCurrentCharacter(character);
      setIsMinigameOpen(true);
  };

  const handleMinigameEnd = (wasSuccessful: boolean) => {
    setIsMinigameOpen(false);
    if (!currentCharacter) return;

    if (wasSuccessful) {
        setSavedCharacters(prev => prev.map(c => 
            c.id === currentCharacter.id ? { ...c, status: 'RECRUITED' } : c
        ));
        setRecruitmentResult('success');
    } else {
        setSavedCharacters(prev => prev.map(c => 
            c.id === currentCharacter.id ? { ...c, cooldownUntil: Date.now() + RECRUITMENT_COOLDOWN_MS } : c
        ));
        setRecruitmentResult('failure');
    }
  };

  const handleStartPostRecruitmentConversation = (character: GeneratedCharacter) => {
      setCurrentCharacter(character);
      setView('chat');
  };
  
  const handleEndPostRecruitmentConversation = () => {
      if (currentCharacter) {
        let updatedChar = { 
            ...currentCharacter, 
            resonanceExp: currentCharacter.resonanceExp + RESONANCE_EXP_PER_CHAT 
        };
        const expForNextLevel = RESONANCE_LEVEL_THRESHOLDS[updatedChar.resonanceLevel + 1];
        if (expForNextLevel && updatedChar.resonanceExp >= expForNextLevel) {
            updatedChar = handleResonanceLevelUp(updatedChar);
        }
        setCurrentCharacter(updatedChar);
        setSavedCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
      }
      setView('sheet');
  }


  const handleSendMessage = async (message: string) => {
    if (!currentCharacter || view !== 'chat') return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    const updatedHistory = [...currentCharacter.postRecruitmentChatHistory, userMessage];
    const updatedChar = { ...currentCharacter, postRecruitmentChatHistory: updatedHistory };
    setCurrentCharacter(updatedChar);
    setSavedCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
    setIsLoading(true);

    try {
        const responseText = await generatePostRecruitmentChatResponse(currentCharacter, updatedHistory, message);
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
        const finalHistory = [...updatedHistory, modelMessage];
        
        const finalChar = { ...updatedChar, postRecruitmentChatHistory: finalHistory };
        setCurrentCharacter(finalChar);
        setSavedCharacters(prev => prev.map(c => c.id === finalChar.id ? finalChar : c));

    } catch (err) {
        console.error("Failed to get chat response", err);
        const errorText = t('chatError');
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: errorText }] };
        const finalHistory = [...updatedHistory, modelMessage];
        
        const finalChar = { ...updatedChar, postRecruitmentChatHistory: finalHistory };
        setCurrentCharacter(finalChar);
        setSavedCharacters(prev => prev.map(c => c.id === finalChar.id ? finalChar : c));
    } finally {
        setIsLoading(false);
    }
  };


  const HeartIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.645 20.91a.75.75 0 0 1-1.29 0C8.343 17.636 3.75 13.25 3.75 9.375 3.75 6.402 6.152 4 9 4c1.789 0 3.242.962 4.086 2.378A5.253 5.253 0 0 1 17.25 4c2.848 0 5.25 2.402 5.25 5.375 0 3.875-4.593 8.261-6.605 11.535Z" />
    </svg>
  );

  const renderContent = () => {
    if (isHydrating && view === 'landing') {
        return <LoadingSpinner />;
    }
    switch (view) {
      case 'landing':
        return <LandingPage onNavigate={(v) => setView(v)} />;
      case 'gallery':
        return <CharacterGallery 
                  characters={savedCharacters} 
                  onStartBattle={handleStartBattle}
                  onNavigateToForm={() => setView('landing')}
                  onViewCharacter={handleViewCharacter}
                  onStartRecruitment={handleStartRecruitment}
                />;
      case 'sheet':
        if (currentCharacter) {
          const isSaved = !!savedCharacters.find(c => c.id === currentCharacter.id);
          return <CharacterSheet 
                    character={currentCharacter} 
                    onBack={isSaved ? handleReturnToGallery : handleReturnToForm}
                    onSave={handleSaveCharacter}
                    isSaved={isSaved}
                    onDelete={handleDeleteCharacter}
                    onUnlockAbility={handleUnlockAbility}
                    onEquipAbilities={handleEquipAbilities}
                    onStartPostRecruitmentConversation={handleStartPostRecruitmentConversation}
                  />;
        }
        return null; // Should not happen
      case 'battle':
        if (combatants) {
          return <BattleScreen 
                    combatant1={combatants[0]} 
                    combatant2={combatants[1]}
                    onBattleEnd={handleBattleEnd}
                  />;
        }
        return null; // Should not happen
      case 'chat':
        if (currentCharacter) {
          return <ChatView
                    character={currentCharacter}
                    onSendMessage={handleSendMessage}
                    onBack={handleEndPostRecruitmentConversation}
                    isLoading={isLoading}
                  />;
        }
        return null;
      case 'form':
      default:
        return <CharacterInputForm 
                  userInput={userInput} 
                  setUserInput={setUserInput} 
                  onSubmit={handleGenerate} 
                  isLoading={isLoading} 
                  onReturnToLanding={handleReturnToLanding}
                />;
    }
  };

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      {isLoading && !isHydrating && <LoadingSpinner />}
      {isAdVisible && <InterstitialAdModal onClose={handleAdClose} />}
      {isMinigameOpen && currentCharacter && (
        <RecruitmentMinigame 
            character={currentCharacter} 
            onEnd={handleMinigameEnd} 
        />
      )}
      <BattleRewardModal
          isOpen={isRewardModalOpen}
          winner={lastBattleWinner}
          generatedImage={battleMementoImage}
          onClose={handleCloseRewardModal}
        />
      <RecruitmentResultModal
          isOpen={!!recruitmentResult}
          result={recruitmentResult}
          characterName={currentCharacter?.name || ''}
          onClose={() => {
              if (recruitmentResult === 'success') {
                  const recruitedChar = savedCharacters.find(c => c.id === currentCharacter?.id);
                  if (recruitedChar) {
                      setCurrentCharacter(recruitedChar); // Ensure currentCharacter is updated with status
                      setView('sheet');
                  } else {
                      setView('gallery');
                  }
              } else {
                  setView('gallery');
              }
              setRecruitmentResult(null);
          }}
      />
      <main className="container mx-auto">
        {view !== 'landing' && (
            <header className="text-center mb-12 animate-fade-in">
                <div className="flex justify-center mb-3">
                    <span className="text-amber-500/50 text-sm tracking-[0.3em]">✦ ✦ ✦</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.15em] uppercase cursor-pointer gradient-text hover:opacity-80 transition-opacity" onClick={() => setView('landing')}>
                    {t('appTitle')}
                </h1>
                <p className="mt-2 font-heading text-base text-slate-500 max-w-2xl mx-auto italic">
                    {t('appSubtitle')}
                </p>
                <div className="flex items-center justify-center gap-3 mt-4 mb-6">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/30"></div>
                    <div className="text-amber-500/30 text-xs">✦</div>
                    <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/30"></div>
                </div>
                <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                    <button 
                        onClick={() => setLanguage('ko')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${language === 'ko' ? 'btn-premium' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                    >
                        {t('langKo')}
                    </button>
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${language === 'en' ? 'btn-premium' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                    >
                        {t('langEn')}
                    </button>
                    <button 
                        onClick={() => setView('gallery')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300"
                    >
                        {t('myCharactersButton')}
                    </button>
                    <button 
                        onClick={() => window.open('https://buymeacoffee.com/creatorsnexus', '_blank')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 flex items-center gap-2 transition-all duration-300"
                        title={t('supportNexusTooltip')}
                    >
                        <HeartIcon className="w-4 h-4" />
                        {t('supportNexus')}
                    </button>
                </div>
            </header>
        )}

        {error && (view === 'form' || view === 'sheet') && (
          <div className="max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-6" role="alert">
            <strong className="font-bold">{t('generationFailed')} </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {renderContent()}
      </main>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};


export default App;