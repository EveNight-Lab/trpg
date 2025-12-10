

/**
 * Character Generation Service - AI 없이 완전히 로직으로 작동
 */

import { UserCharacterInput, GeneratedCharacter, Trait, PassiveSkill, SpecialSkill, ChatMessage } from '../types';
import { generateTraits, generatePassiveSkill, generateSpecialSkill, generateFullCharacter } from './abilityGenerator';

// 캐릭터 상세 생성 - AI 없이 완전히 로직으로 생성
export async function generateCharacterDetails(userInput: UserCharacterInput, language: 'ko' | 'en'): Promise<Omit<GeneratedCharacter, 'image' | 'id' | 'victoryImages' | 'victoryPoints' | 'unlockedTraits' | 'unlockedPassiveSkills' | 'unlockedSpecialSkills' | 'stats' | 'bonusStats' | 'postRecruitmentChatHistory' | 'resonanceLevel' | 'resonanceExp' | 'unlockedResonancePassives' | 'status' | 'cooldownUntil'>> {
  // AI 없이 템플릿 기반으로 모든 것 생성
  const character = generateFullCharacter(userInput, language);
  
  return {
    name: character.name,
    race: character.race,
    backstory: character.backstory,
    appearance: character.appearance,
    combatStyle: character.combatStyle,
    personality: character.personality,
    personalityAnecdote: character.personalityAnecdote,
    personalityAnecdoteTitle: character.personalityAnecdoteTitle,
    combatAnecdote: character.combatAnecdote,
    combatAnecdoteTitle: character.combatAnecdoteTitle,
    imageKey: '',
    wins: 0,
    losses: 0,
    traits: character.traits,
    passiveSkill: character.passiveSkill,
    specialSkill: character.specialSkill,
    resonancePassive: character.resonancePassive,
    combatLines: character.combatLines,
  };
}

// 이미지 생성 - AI 없이 빈 문자열 반환 (추후 AI 연동 시 활성화)
export async function generateCharacterImage(characterDetails: Omit<GeneratedCharacter, 'image' | 'id' | 'victoryImages' | 'victoryPoints' | 'unlockedTraits' | 'unlockedPassiveSkills' | 'unlockedSpecialSkills' | 'stats' | 'bonusStats' | 'postRecruitmentChatHistory' | 'resonanceLevel' | 'resonanceExp' | 'unlockedResonancePassives' | 'status' | 'cooldownUntil'>): Promise<string> {
  // AI 없이 작동 - 빈 문자열 반환
  return '';
}

// 배틀 이미지 생성 - AI 없이 빈 문자열 반환
export async function generateBattleImage(victor: GeneratedCharacter, defeated: GeneratedCharacter): Promise<string> {
  // AI 없이 작동 - 빈 문자열 반환
  return '';
}

// --- ASCENSION SYSTEM (승천 - 새 능력 해금) ---

// 새 특성 생성 (AI 없이 로직으로 생성)
export async function generateNewTrait(character: GeneratedCharacter, language: 'ko' | 'en'): Promise<Trait> {
    // 기존 특성과 중복되지 않도록 여러 번 시도
    const existingKeys = new Set(character.unlockedTraits.map(t => 
        t.modifications.map(m => `${m.stat}:${m.value}`).join('|')
    ));
    
    let attempts = 0;
    while (attempts < 10) {
        const newTraits = generateTraits(language);
        const newTrait = newTraits[0];
        const newKey = newTrait.modifications.map(m => `${m.stat}:${m.value}`).join('|');
        
        if (!existingKeys.has(newKey)) {
            return newTrait;
        }
        attempts++;
    }
    
    // 최대 시도 후에도 중복이면 그냥 반환
    return generateTraits(language)[0];
}

// 새 패시브 스킬 생성 (AI 없이 로직으로 생성)
export async function generateNewPassiveSkill(character: GeneratedCharacter, language: 'ko' | 'en'): Promise<PassiveSkill> {
    // 기존 패시브와 중복되지 않도록 여러 번 시도
    const existingNames = new Set(character.unlockedPassiveSkills.map(p => p.name));
    
    let attempts = 0;
    while (attempts < 10) {
        const newPassive = generatePassiveSkill(language);
        
        if (!existingNames.has(newPassive.name)) {
            return newPassive;
        }
        attempts++;
    }
    
    // 최대 시도 후에도 중복이면 그냥 반환
    return generatePassiveSkill(language);
}

// 새 액티브 스킬 생성 (AI 없이 로직으로 생성)
export async function generateNewSpecialSkill(character: GeneratedCharacter, language: 'ko' | 'en'): Promise<SpecialSkill> {
    // 기존 스킬과 중복되지 않도록 여러 번 시도
    const existingNames = new Set(character.unlockedSpecialSkills.map(s => s.name));
    
    let attempts = 0;
    while (attempts < 10) {
        const newSkill = generateSpecialSkill(language);
        
        if (!existingNames.has(newSkill.name)) {
            return newSkill;
        }
        attempts++;
    }
    
    // 최대 시도 후에도 중복이면 그냥 반환
    return generateSpecialSkill(language);
}

// --- CONVERSATION SYSTEM (템플릿 기반) ---

const CHAT_RESPONSES_KO = [
  "창조주님, 무슨 일이신가요?",
  "제가 도움이 될 수 있다면 좋겠습니다.",
  "흥미로운 질문이군요...",
  "음, 그건 생각해본 적 없는데...",
  "창조주님과 이야기하는 건 언제나 좋습니다.",
  "저도 그 생각을 하고 있었어요.",
  "다음 전투가 기대됩니다.",
  "제 능력을 보여드리고 싶군요.",
  "좋은 하루 되세요, 창조주님.",
  "언제든 불러주세요.",
];

const CHAT_RESPONSES_EN = [
  "What is it, Creator?",
  "I hope I can be of help.",
  "That's an interesting question...",
  "Hmm, I haven't thought about that...",
  "It's always good to talk with you, Creator.",
  "I was thinking the same thing.",
  "I look forward to the next battle.",
  "I'd like to show you my abilities.",
  "Have a good day, Creator.",
  "Call me anytime.",
];

export async function generatePostRecruitmentChatResponse(character: GeneratedCharacter, history: ChatMessage[], newMessage: string): Promise<string> {
  // AI 없이 템플릿 응답
  const responses = CHAT_RESPONSES_KO; // 기본적으로 한국어
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // 캐릭터 이름 포함한 간단한 개인화
  const personalizedResponses = [
    `${randomResponse}`,
    `${character.name}입니다. ${randomResponse}`,
  ];
  
  return personalizedResponses[Math.floor(Math.random() * personalizedResponses.length)];
}