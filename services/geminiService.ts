import { UserCharacterInput, GeneratedCharacter, Trait, PassiveSkill, SpecialSkill, ChatMessage, ResonancePassive } from '../types';
import { generateTraits, generatePassiveSkill, generateSpecialSkill } from './abilityGenerator';
import { generateFullCharacter as generateLocalFullCharacter } from './narrativeGenerator';

// Helper to check configuration
function getGeminiConfig() {
  const apiKey = localStorage.getItem('trpg_gemini_api_key') || '';
  const enabled = localStorage.getItem('trpg_gemini_api_enabled') === 'true';
  return { apiKey, enabled };
}

// Select a matching fantasy portrait local image based on character description keywords
function selectLocalPortrait(input: { name?: string; race?: string; backstory?: string; appearance?: string; combatStyle?: string }): string {
  const text = `${input.name || ''} ${input.race || ''} ${input.appearance || ''} ${input.combatStyle || ''} ${input.backstory || ''}`.toLowerCase();
  
  if (text.includes('신성') || text.includes('치유') || text.includes('사제') || text.includes('cleric') || text.includes('priest') || text.includes('holy') || text.includes('temple') || text.includes('heal')) {
    return '/images/cleric.png';
  }
  if (text.includes('마법') || text.includes('주문') || text.includes('마술') || text.includes('마법사') || text.includes('warlock') || text.includes('mage') || text.includes('wizard') || text.includes('spell') || text.includes('magic')) {
    return '/images/warlock.png';
  }
  if (text.includes('활') || text.includes('화살') || text.includes('레인저') || text.includes('궁수') || text.includes('bow') || text.includes('arrow') || text.includes('ranger') || text.includes('archer') || text.includes('forest')) {
    return '/images/ranger.png';
  }
  if (text.includes('방패') || text.includes('기사') || text.includes('성기사') || text.includes('shield') || text.includes('paladin') || text.includes('knight') || text.includes('armor')) {
    return '/images/paladin.png';
  }
  
  // Deterministic hash fallback
  const portraits = [
    '/images/ranger.png',
    '/images/cleric.png',
    '/images/warlock.png',
    '/images/paladin.png',
  ];
  let hash = 0;
  const nameStr = input.name || 'Random';
  for (let i = 0; i < nameStr.length; i++) {
    hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % portraits.length;
  return portraits[index];
}

// REST call helper to Google Gemini API
async function callGeminiAPI(apiKey: string, prompt: string, isJson: boolean = false): Promise<string> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
    }
  };

  if (isJson) {
    requestBody.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMessage = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errText);
      errMessage = parsed.error?.message || errMessage;
    } catch {}
    throw new Error(`Gemini API Error: ${errMessage}`);
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Gemini API returned an empty response');
  }

  return candidateText;
}

// REST call helper for multi-turn chat
async function callGeminiChatAPI(apiKey: string, contents: any[]): Promise<string> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMessage = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errText);
      errMessage = parsed.error?.message || errMessage;
    } catch {}
    throw new Error(`Gemini API Error: ${errMessage}`);
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Gemini API returned an empty response');
  }

  return candidateText;
}

// 캐릭터 상세 생성
export async function generateCharacterDetails(
  userInput: UserCharacterInput, 
  language: 'ko' | 'en'
): Promise<Omit<GeneratedCharacter, 'image' | 'id' | 'victoryImages' | 'victoryPoints' | 'unlockedTraits' | 'unlockedPassiveSkills' | 'unlockedSpecialSkills' | 'stats' | 'bonusStats' | 'postRecruitmentChatHistory' | 'resonanceLevel' | 'resonanceExp' | 'unlockedResonancePassives' | 'status' | 'cooldownUntil'>> {
  
  const { apiKey, enabled } = getGeminiConfig();

  if (!enabled || !apiKey) {
    // FALLBACK: Local Forge (Offline template-based)
    const character = generateLocalFullCharacter(userInput, language);
    const selectedImg = selectLocalPortrait(userInput);
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
      imageKey: `local-portrait-${crypto.randomUUID()}`,
      wins: 0,
      losses: 0,
      traits: character.traits,
      passiveSkill: character.passiveSkill,
      specialSkill: character.specialSkill,
      resonancePassive: character.resonancePassive,
      combatLines: character.combatLines,
      image: selectedImg, // Set local portrait path
    } as any;
  }

  // AI FORGE (Real Gemini 2.5 Flash API)
  const prompt = `You are a professional TRPG master and fantasy writer.
Create a detailed character sheet based on the user's input:
- Name: ${userInput.name || 'Random'}
- Race: ${userInput.race || 'Random'}
- Backstory: ${userInput.backstory || 'Random'}
- Appearance: ${userInput.appearance || 'Random'}
- Combat Style: ${userInput.combatStyle || 'Random'}
- Personality: ${userInput.personality || 'Random'}

Please output a JSON object matching the following structure:
{
  "name": "Character's Name",
  "race": "Character's Race (e.g. Human, Elf, Dwarf, Orc, etc.)",
  "backstory": "Character's rich backstory in 2-3 sentences.",
  "appearance": "Character's appearance description in 1-2 sentences.",
  "combatStyle": "Character's fighting style in 1-2 sentences.",
  "personality": "Character's personality description in 1-2 sentences.",
  "personalityAnecdoteTitle": "A dramatic title for a personality anecdote",
  "personalityAnecdote": "A short, vivid story of 2-3 sentences demonstrating their personality.",
  "combatAnecdoteTitle": "A dramatic title for a combat anecdote",
  "combatAnecdote": "A short, vivid story of 2-3 sentences showing their legendary combat moment.",
  "traits": [
    {
      "name": "Trait Name",
      "description": "Increases one stat and decreases another.",
      "modifications": [
        { "stat": "Attack", "value": 1 },
        { "stat": "Defense", "value": -1 }
      ]
    }
  ],
  "passiveSkill": {
    "name": "Passive Skill Name",
    "description": "A descriptive effect sentence.",
    "condition": {
      "type": "HP_BELOW_THRESHOLD",
      "threshold": 0.5
    },
    "effect": {
      "type": "STAT_MODIFICATION",
      "modification": { "stat": "Attack", "value": 2 }
    }
  },
  "specialSkill": {
    "name": "Special Skill Name",
    "description": "Flavor text describing the skill.",
    "effectDescription": "Game mechanical explanation.",
    "effect": {
      "type": "DAMAGE_BOOST",
      "value": 15
    },
    "activation": {
      "timing": "ON_TURN_START",
      "condition": {
        "type": "MANA_ABOVE_THRESHOLD",
        "threshold": 3
      }
    }
  },
  "resonancePassive": {
    "name": "Bond/Resonance Skill Name",
    "description": "Effect when maximum affinity is reached.",
    "effect": {
      "type": "START_OF_BATTLE_GUARD",
      "value": 20
    }
  },
  "combatLines": {
    "onAttackHit": ["3 short cool battle quotes when hitting an enemy"],
    "onDodge": ["3 short cool battle quotes when dodging an attack"],
    "onVictory": ["3 short cool battle quotes when winning the battle"]
  }
}

Constraint Details:
1. Available Stats for modifications: 'Vitality', 'Attack', 'Defense', 'Speed', 'Precision', 'Agility', 'Mana'.
2. In traits modifications, one stat MUST increase (+1 or +2) and another stat MUST decrease (-1 or -2) to keep balance.
3. Available Passive Skill Condition types: 'HP_ABOVE_THRESHOLD', 'HP_BELOW_THRESHOLD', 'ENEMY_HP_ABOVE_THRESHOLD', 'ENEMY_HP_BELOW_THRESHOLD', 'ENEMY_HAS_STATUS_EFFECT', 'SELF_HAS_STATUS_EFFECT', 'MANA_ABOVE_THRESHOLD', 'MANA_BELOW_THRESHOLD', 'ALWAYS_ACTIVE'.
4. Available Passive Skill Effect types:
   - STAT_MODIFICATION: modification is a stat increase.
   - APPLY_STATUS_EFFECT_ON_HIT: chance is 0 to 1, effect contains type ('POISON' | 'STUN' | 'BURN' | 'SLOW' | 'VULNERABLE' | 'BLIND'), duration, potency.
5. Available Special Skill Effect types:
   - DAMAGE_BOOST (value is number, e.g. 15)
   - ACCURACY_BOOST (value is number, e.g. 10)
   - HEAL (value is StatGrade, e.g. 'C')
   - VAMPIRIC_STRIKE (value is decimal, e.g. 0.5)
   - MANA_SIPHON (value is number, e.g. 1)
   - GAIN_GUARD (value is number, e.g. 20)
   - CLEANSE (value is number, e.g. 0)
   - MANA_RESTORE (value is number, e.g. 3)
   - GUARD_BREAK (value is number, e.g. 15)
   - APPLY_STATUS_EFFECT (effect has type, duration, potency)
6. Available Special Skill Condition types: 'HP_BELOW_THRESHOLD', 'MANA_ABOVE_THRESHOLD', 'MANA_BELOW_THRESHOLD', 'SELF_HAS_STATUS_EFFECT'.
7. Available Resonance Passive Effect types: 'START_OF_BATTLE_GUARD', 'BATTLE_START_MANA'.
8. Language output MUST be in ${language === 'ko' ? 'Korean' : 'English'}.
`;

  const jsonStr = await callGeminiAPI(apiKey, prompt, true);
  const parsed = JSON.parse(jsonStr);

  return {
    name: parsed.name || userInput.name || 'Unnamed hero',
    race: parsed.race || userInput.race || 'Unknown',
    backstory: parsed.backstory || '',
    appearance: parsed.appearance || '',
    combatStyle: parsed.combatStyle || '',
    personality: parsed.personality || '',
    personalityAnecdote: parsed.personalityAnecdote || '',
    personalityAnecdoteTitle: parsed.personalityAnecdoteTitle || '',
    combatAnecdote: parsed.combatAnecdote || '',
    combatAnecdoteTitle: parsed.combatAnecdoteTitle || '',
    imageKey: '',
    wins: 0,
    losses: 0,
    traits: parsed.traits || generateTraits(language),
    passiveSkill: parsed.passiveSkill || generatePassiveSkill(language),
    specialSkill: parsed.specialSkill || generateSpecialSkill(language),
    resonancePassive: parsed.resonancePassive || null,
    combatLines: parsed.combatLines || { onAttackHit: ['Ha!'], onDodge: ['Missed!'], onVictory: ['Victory is mine!'] },
  };
}

// 이미지 생성 - AI 모드에서는 Gemini 이미지 생성 모델 사용, 폴백은 로컬 PNG
export async function generateCharacterImage(characterDetails: any): Promise<string> {
  // 이미 이미지가 있으면 그대로 반환 (로컬 모드)
  if (characterDetails.image) return characterDetails.image;

  const { apiKey, enabled } = getGeminiConfig();

  if (enabled && apiKey) {
    try {
      const imagePrompt = [
        `Fantasy TRPG character portrait, high quality digital art, detailed illustration.`,
        `Character: ${characterDetails.name}, ${characterDetails.race}.`,
        `Appearance: ${characterDetails.appearance || 'mysterious warrior'}`,
        `Combat style: ${characterDetails.combatStyle || 'skilled fighter'}`,
        `Style: dramatic fantasy portrait, rich colors, detailed armor/costume, dark atmospheric background.`,
        `Single character, upper body portrait, facing slightly to the side.`,
        `No text, no watermark.`
      ].join(' ');

      const model = 'gemini-2.5-flash-image';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (err) {
      console.warn('Gemini 이미지 생성 실패, 로컬 초상화로 폴백합니다:', err);
    }
  }

  // 폴백: 로컬 PNG 선택
  return selectLocalPortrait({
    name: characterDetails.name,
    race: characterDetails.race,
    backstory: characterDetails.backstory,
    appearance: characterDetails.appearance,
    combatStyle: characterDetails.combatStyle,
  });
}

// 배틀 이미지 생성 - AI 없이 빈 문자열 반환
export async function generateBattleImage(victor: GeneratedCharacter, defeated: GeneratedCharacter): Promise<string> {
  return '';
}

// --- ASCENSION SYSTEM (승천 - 새 능력 해금) ---

// 새 특성 생성
export async function generateNewTrait(character: GeneratedCharacter, language: 'ko' | 'en'): Promise<Trait> {
  const { apiKey, enabled } = getGeminiConfig();

  // API 키만 있으면 AI 생성 (enabled 토글은 캐릭터 창조 시에만 적용)
  if (!apiKey) {
    // FALLBACK: Local offline generation
    const existingKeys = new Set(character.unlockedTraits.map(t => 
      t.modifications.map(m => `${m.stat}:${m.value}`).join('|')
    ));
    
    let attempts = 0;
    while (attempts < 10) {
      const newTraits = generateTraits(language);
      const newTrait = newTraits[0];
      const newKey = newTrait.modifications.map(m => `${m.stat}:${m.value}`).join('|');
      if (!existingKeys.has(newKey)) return newTrait;
      attempts++;
    }
    return generateTraits(language)[0];
  }

  // AI Generation
  const prompt = `You are a TRPG game designer.
The character is named ${character.name}, a ${character.race}.
Their backstory: ${character.backstory}
Their existing traits: ${character.unlockedTraits.map(t => `${t.name}: ${t.description}`).join(', ')}

Please generate a thematic NEW Trait for this character that fits their lore.
Output a JSON object matching this structure:
{
  "name": "Trait Name",
  "description": "Increases one stat and decreases another.",
  "modifications": [
    { "stat": "Attack", "value": 1 },
    { "stat": "Defense", "value": -1 }
  ]
}

Constraints:
1. Available Stats: 'Vitality', 'Attack', 'Defense', 'Speed', 'Precision', 'Agility', 'Mana'.
2. One stat MUST increase (+1 or +2) and another stat MUST decrease (-1 or -2).
3. The language of name and description MUST be ${language === 'ko' ? 'Korean' : 'English'}.
`;

  const jsonStr = await callGeminiAPI(apiKey, prompt, true);
  return JSON.parse(jsonStr) as Trait;
}

// 새 패시브 스킬 생성
export async function generateNewPassiveSkill(character: GeneratedCharacter, language: 'ko' | 'en'): Promise<PassiveSkill> {
  const { apiKey, enabled } = getGeminiConfig();

  // API 키만 있으면 AI 생성 (enabled 토글은 캐릭터 창조 시에만 적용)
  if (!apiKey) {
    // FALLBACK: Local offline generation
    const existingNames = new Set(character.unlockedPassiveSkills.map(p => p.name));
    let attempts = 0;
    while (attempts < 10) {
      const newPassive = generatePassiveSkill(language);
      if (!existingNames.has(newPassive.name)) return newPassive;
      attempts++;
    }
    return generatePassiveSkill(language);
  }

  // AI Generation
  const prompt = `You are a TRPG game designer.
The character is named ${character.name}, a ${character.race}.
Their backstory: ${character.backstory}
Their existing passive skills: ${character.unlockedPassiveSkills.map(p => `${p.name}: ${p.description}`).join(', ')}

Please generate a thematic NEW Passive Skill for this character that fits their lore.
Output a JSON object matching this structure:
{
  "name": "Passive Skill Name",
  "description": "A descriptive effect sentence.",
  "condition": {
    "type": "HP_BELOW_THRESHOLD",
    "threshold": 0.5
  },
  "effect": {
    "type": "STAT_MODIFICATION",
    "modification": { "stat": "Attack", "value": 2 }
  }
}

Constraints:
1. Available Stats: 'Vitality', 'Attack', 'Defense', 'Speed', 'Precision', 'Agility', 'Mana'.
2. Available Condition types: 'HP_ABOVE_THRESHOLD', 'HP_BELOW_THRESHOLD', 'ENEMY_HP_ABOVE_THRESHOLD', 'ENEMY_HP_BELOW_THRESHOLD', 'ENEMY_HAS_STATUS_EFFECT', 'SELF_HAS_STATUS_EFFECT', 'MANA_ABOVE_THRESHOLD', 'MANA_BELOW_THRESHOLD', 'ALWAYS_ACTIVE'.
3. Available Effect types:
   - STAT_MODIFICATION (modification: { stat: StatName, value: number })
   - APPLY_STATUS_EFFECT_ON_HIT (chance: 0-1, effect: { type: StatusEffectType, duration: number, potency: number })
4. StatusEffectType is one of 'POISON', 'STUN', 'BURN', 'SLOW', 'VULNERABLE', 'BLIND'.
5. The language of name and description MUST be ${language === 'ko' ? 'Korean' : 'English'}.
`;

  const jsonStr = await callGeminiAPI(apiKey, prompt, true);
  return JSON.parse(jsonStr) as PassiveSkill;
}

// 새 액티브 스킬 생성
export async function generateNewSpecialSkill(character: GeneratedCharacter, language: 'ko' | 'en'): Promise<SpecialSkill> {
  const { apiKey, enabled } = getGeminiConfig();

  // API 키만 있으면 AI 생성 (enabled 토글은 캐릭터 창조 시에만 적용)
  if (!apiKey) {
    // FALLBACK: Local offline generation
    const existingNames = new Set(character.unlockedSpecialSkills.map(s => s.name));
    let attempts = 0;
    while (attempts < 10) {
      const newSkill = generateSpecialSkill(language);
      if (!existingNames.has(newSkill.name)) return newSkill;
      attempts++;
    }
    return generateSpecialSkill(language);
  }

  // AI Generation
  const prompt = `You are a TRPG game designer.
The character is named ${character.name}, a ${character.race}.
Their backstory: ${character.backstory}
Their existing special skills: ${character.unlockedSpecialSkills.map(s => `${s.name}: ${s.description}`).join(', ')}

Please generate a thematic NEW Special Active Skill for this character that fits their lore.
Output a JSON object matching this structure:
{
  "name": "Special Skill Name",
  "description": "Flavor text describing the skill.",
  "effectDescription": "Game mechanical explanation.",
  "effect": {
    "type": "DAMAGE_BOOST",
    "value": 15
  },
  "activation": {
    "timing": "ON_TURN_START",
    "condition": {
      "type": "MANA_ABOVE_THRESHOLD",
      "threshold": 3
    }
  }
}

Constraints:
1. Available Stats: 'Vitality', 'Attack', 'Defense', 'Speed', 'Precision', 'Agility', 'Mana'.
2. Available Effect types:
   - DAMAGE_BOOST (value is number, e.g. 15)
   - ACCURACY_BOOST (value is number, e.g. 10)
   - HEAL (value is StatGrade 'C' | 'B' | 'A' | 'S' etc.)
   - VAMPIRIC_STRIKE (value is decimal, e.g. 0.5)
   - MANA_SIPHON (value is number, e.g. 1)
   - GAIN_GUARD (value is number, e.g. 20)
   - CLEANSE (value is number, e.g. 0)
   - MANA_RESTORE (value is number, e.g. 3)
   - GUARD_BREAK (value is number, e.g. 15)
   - APPLY_STATUS_EFFECT (effect has type: StatusEffectType, duration: number, potency: number)
3. Available Condition types: 'HP_BELOW_THRESHOLD', 'MANA_ABOVE_THRESHOLD', 'MANA_BELOW_THRESHOLD', 'SELF_HAS_STATUS_EFFECT'.
4. Available Timing types: 'ON_TURN_START', 'AFTER_HIT_SUCCESS'.
5. StatusEffectType is one of 'POISON', 'STUN', 'BURN', 'SLOW', 'VULNERABLE', 'BLIND'.
6. The language of name and description MUST be ${language === 'ko' ? 'Korean' : 'English'}.
`;

  const jsonStr = await callGeminiAPI(apiKey, prompt, true);
  return JSON.parse(jsonStr) as SpecialSkill;
}

// --- CONVERSATION SYSTEM (AI-Based multi-turn chat fallback to templates) ---

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

export async function generatePostRecruitmentChatResponse(
  character: GeneratedCharacter, 
  history: ChatMessage[], 
  newMessage: string
): Promise<string> {
  
  const { apiKey, enabled } = getGeminiConfig();

  // 대화는 API 키만 있으면 AI 모드로 동작 (창조 활성화 여부와 무관)
  if (!apiKey) {
    // FALLBACK: Local Template Responses
    const responses = CHAT_RESPONSES_KO;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const personalizedResponses = [
      `${randomResponse}`,
      `${character.name}입니다. ${randomResponse}`,
    ];
    return personalizedResponses[Math.floor(Math.random() * personalizedResponses.length)];
  }

  // AI Response
  const systemPrompt = `You are a character in a TRPG game.
Your sheet info:
Name: ${character.name}
Race: ${character.race}
Backstory: ${character.backstory}
Appearance: ${character.appearance}
Combat Style: ${character.combatStyle}
Personality: ${character.personality}

The user talking to you is your 'Creator' who summoned/crafted you.
Respond in character, maintaining your personality, tone, and backstory.
Answer in the same language as the user's message (usually Korean or English).
Keep your response short (1-2 sentences) and conversational.`;

  // Build Gemini contents format
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }]
    },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: msg.parts.map(p => ({ text: p.text }))
    })),
    {
      role: 'user',
      parts: [{ text: newMessage }]
    }
  ];

  try {
    const textResponse = await callGeminiChatAPI(apiKey, contents);
    return textResponse.trim();
  } catch (err) {
    console.error("Gemini chat API failed, falling back to templates:", err);
    // Simple fallback if API limit/error
    return `${character.name}입니다. 창조주님, 마나의 파동에 작은 교란이 있는 것 같습니다.`;
  }
}