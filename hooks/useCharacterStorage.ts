import { useState, useEffect } from 'react';
import { GeneratedCharacter, CharacterStats, ResonancePassive, Trait, PassiveSkill, SpecialSkill, StatGrade, ChatMessage } from '../types';
import { defaultCharacters } from '../data/defaultCharacters';
import { setImage, getImage, deleteImages } from '../services/imageStore';
import { getFinalCharacterStats, STAT_GRADES, parseDiceNotation } from '../utils/diceUtils';

// Internal types for the data format stored in localStorage (without image data)
interface StorableVictoryImage {
    imageKey: string;
    opponentName: string;
}
interface StorableCharacter {
    id: string; imageKey: string; name: string; race: string; backstory: string; appearance: string;
    combatStyle: string; personality: string; personalityAnecdote: string; personalityAnecdoteTitle: string;
    combatAnecdote: string; combatAnecdoteTitle: string; traits: Trait[]; passiveSkill: PassiveSkill;
    stats: CharacterStats; bonusStats: any; specialSkill: SpecialSkill; combatLines: any; wins: number; losses: number;
    victoryImages: StorableVictoryImage[];
    victoryPoints: number;
    unlockedTraits: Trait[];
    unlockedPassiveSkills: PassiveSkill[];
    unlockedSpecialSkills: SpecialSkill[];
    postRecruitmentChatHistory: ChatMessage[];
    status: 'UNRECRUITED' | 'RECRUITED';
    cooldownUntil: number | null;
    resonanceLevel: number;
    resonanceExp: number;
    resonancePassive: ResonancePassive | null;
    unlockedResonancePassives: ResonancePassive[];
}

export const FIXED_BASE_STATS: CharacterStats = {
  Vitality: 'C',
  Attack: 'C',
  Defense: 'C',
  Speed: 'C',
  Precision: 'C',
  Agility: 'C',
  Mana: 'C',
};

// Helper for data migration
const convertDiceStatToGrade = (statValue: string | number): StatGrade => {
    if (typeof statValue === 'number') {
        if (statValue >= 50) return 'SS';
        if (statValue >= 45) return 'S';
        if (statValue >= 40) return 'A';
        if (statValue >= 35) return 'B';
        if (statValue >= 30) return 'C';
        if (statValue >= 25) return 'D';
        return 'E';
    }
    const parsed = parseDiceNotation(statValue);
    const avg = parsed.count * ((parsed.sides + 1) / 2) + parsed.modifier;

    if (parsed.sides === 20) { // Precision, Agility
        if (avg >= 16) return 'SS';
        if (avg >= 14) return 'S';
        if (avg >= 12) return 'A';
        if (avg >= 10) return 'B';
        if (avg >= 8) return 'C';
        if (avg >= 6) return 'D';
        return 'E';
    } else { // Attack, Defense
        if (avg >= 13) return 'SS';
        if (avg >= 11) return 'S';
        if (avg >= 9) return 'A';
        if (avg >= 7) return 'B';
        if (avg >= 5) return 'C';
        if (avg >= 3) return 'D';
        return 'E';
    }
};

export const useCharacterStorage = () => {
  const [savedCharacters, setSavedCharacters] = useState<GeneratedCharacter[]>([]);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Load characters from storage on initial render, hydrating images from IndexedDB
  useEffect(() => {
    const hydrateCharacters = async () => {
        setIsHydrating(true);
        try {
            const storedData = localStorage.getItem('trpg_characters');
            if (!storedData) {
                // Default characters must have their stats calculated from traits upon first load.
                const processedDefaults = defaultCharacters.map(char => {
                    const { finalStats, finalBonusStats } = getFinalCharacterStats(char.stats, char.traits);
                    return { ...char, stats: finalStats, bonusStats: finalBonusStats };
                });
                setSavedCharacters(processedDefaults);
                return;
            }

            let parsedData = JSON.parse(storedData);
            if (!Array.isArray(parsedData) || parsedData.length === 0) {
                 setSavedCharacters(defaultCharacters);
                 return;
            }

            const isOldFormat = !('imageKey' in parsedData[0]);
            const needsAscensionMigration = !('victoryPoints' in parsedData[0]);
            const needsGradeMigration = typeof parsedData[0].stats.Vitality !== 'string' || !STAT_GRADES.includes(parsedData[0].stats.Vitality);
            const needsChatMigration = !('postRecruitmentChatHistory' in parsedData[0]);
            const needsResonanceMigration = !('resonanceLevel' in parsedData[0]);
            const needsRecruitmentMigration = !('status' in parsedData[0]);

            if (isOldFormat) { // Very old format without IndexedDB keys
                const storableCharacters: Partial<StorableCharacter>[] = [];
                for (const oldChar of parsedData) {
                    const newChar: any = { ...oldChar };
                    newChar.id = newChar.id || crypto.randomUUID();
                    newChar.imageKey = `portrait-${newChar.id}`;
                    newChar.victoryImages = (newChar.victoryImages || []).map((vic: any, index: number) => ({
                        imageKey: `memento-${newChar.id}-${index}`,
                        opponentName: vic.opponentName
                    }));
                    
                    if (newChar.image) await setImage(newChar.imageKey, newChar.image);
                    for (const vic of oldChar.victoryImages || []) {
                        if (vic.image) await setImage(`memento-${newChar.id}-${oldChar.victoryImages.indexOf(vic)}`, vic.image);
                    }
                    delete newChar.image;
                    (newChar.victoryImages || []).forEach((v: any) => delete v.image);
                    storableCharacters.push(newChar);
                }
                localStorage.setItem('trpg_characters', JSON.stringify(storableCharacters));
                parsedData = storableCharacters;
            }

            let storableChars = parsedData as StorableCharacter[];

            // --- FILTER STALE DEFAULT CHARACTERS ---
            const activeDefaultIds = new Set(defaultCharacters.map(c => c.id));
            storableChars = storableChars.filter(char => !char.id.startsWith('default-char-') || activeDefaultIds.has(char.id));

            if (needsAscensionMigration) {
                storableChars = storableChars.map(char => ({
                    ...char,
                    victoryPoints: char.wins || 0,
                    unlockedTraits: char.traits,
                    unlockedPassiveSkills: [char.passiveSkill],
                    unlockedSpecialSkills: [char.specialSkill]
                }));
            }
            
            if (needsGradeMigration) {
                storableChars = storableChars.map((char: any) => {
                    const newStats: CharacterStats = {
                        Vitality: convertDiceStatToGrade(char.stats.Vitality),
                        Attack: convertDiceStatToGrade(char.stats.Attack),
                        Defense: convertDiceStatToGrade(char.stats.Defense),
                        Speed: convertDiceStatToGrade(char.stats.Speed),
                        Precision: convertDiceStatToGrade(char.stats.Precision),
                        Agility: convertDiceStatToGrade(char.stats.Agility),
                        Mana: convertDiceStatToGrade(char.stats.Mana),
                    };
                    return { ...char, stats: newStats, bonusStats: {} };
                });
            }

            if (needsChatMigration) {
                storableChars = storableChars.map((char: any) => ({
                    ...char,
                    postRecruitmentChatHistory: char.chatHistory || [],
                    chatHistory: undefined,
                }));
            }

            if (needsResonanceMigration) {
                storableChars = storableChars.map(char => ({
                    ...char,
                    resonanceLevel: 0,
                    resonanceExp: 0,
                    resonancePassive: null,
                    unlockedResonancePassives: [],
                }));
            }
            
            if (needsRecruitmentMigration) {
                storableChars = storableChars.map((char: any) => ({
                    ...char,
                    status: 'RECRUITED',
                    cooldownUntil: null,
                    affinity: undefined,
                    recruitmentChatHistory: undefined,
                }));
            }
            
            const hydratedCharacters = await Promise.all(storableChars.map(async (storableChar) => {
                const portraitImage = await getImage(storableChar.imageKey) || '';
                const victoryImages = await Promise.all((storableChar.victoryImages || []).map(async (vic) => ({
                    ...vic,
                    image: await getImage(vic.imageKey) || ''
                })));
                
                const { finalStats, finalBonusStats } = getFinalCharacterStats(FIXED_BASE_STATS, storableChar.traits);

                return { 
                    ...storableChar, 
                    stats: finalStats,
                    bonusStats: finalBonusStats,
                    image: portraitImage, 
                    victoryImages 
                };
            }));
            
            // Merge new default characters that don't exist in saved data
            const existingIds = new Set(hydratedCharacters.map(c => c.id));
            const newDefaultChars = defaultCharacters
                .filter(dc => !existingIds.has(dc.id))
                .map(char => {
                    const { finalStats, finalBonusStats } = getFinalCharacterStats(char.stats, char.traits);
                    return { ...char, stats: finalStats, bonusStats: finalBonusStats };
                });
            
            const allCharacters = [...hydratedCharacters, ...newDefaultChars] as GeneratedCharacter[];
            setSavedCharacters(allCharacters);
        } catch (e) {
            console.error("Failed to load or initialize characters:", e);
            setSavedCharacters(defaultCharacters);
        } finally {
            setIsHydrating(false);
        }
    };
    hydrateCharacters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Persist saved characters to storage whenever they change, stripping image data
  useEffect(() => {
    if (isHydrating) return;
    
    const persistCharacters = async () => {
        try {
            const storableCharacters: StorableCharacter[] = await Promise.all(savedCharacters.map(async (char) => {
                if (char.imageKey && char.image) await setImage(char.imageKey, char.image);
                for (const vic of char.victoryImages) {
                    if (vic.imageKey && vic.image) await setImage(vic.imageKey, vic.image);
                }
                
                const { image, victoryImages, ...restOfChar } = char;
                const storableVictoryImages = victoryImages.map(vic => ({
                    imageKey: vic.imageKey,
                    opponentName: vic.opponentName,
                }));
                
                return { ...restOfChar, victoryImages: storableVictoryImages };
            }));
            
            localStorage.setItem('trpg_characters', JSON.stringify(storableCharacters));
        } catch (e) {
            console.error("Failed to save characters:", e);
        }
    };
    
    persistCharacters();
  }, [savedCharacters, isHydrating]);

  const deleteCharacter = async (idToDelete: string) => {
    const charToDelete = savedCharacters.find(char => char.id === idToDelete);
    if (charToDelete) {
        const keysToDelete = [charToDelete.imageKey, ...charToDelete.victoryImages.map(v => v.imageKey)];
        try {
            await deleteImages(keysToDelete.filter(Boolean));
        } catch (e) {
            console.error("Failed to delete images from IndexedDB", e);
        }
    }
    setSavedCharacters(prev => prev.filter(char => char.id !== idToDelete));
  };

  return {
    savedCharacters,
    setSavedCharacters,
    isHydrating,
    deleteCharacter
  };
};
