import { GeneratedCharacter, CharacterStats, StatGrade, ResonancePassive, Trait, PassiveSkill, SpecialSkill } from '../types';

const BASE_STATS: CharacterStats = {
  Vitality: 'C', Attack: 'C', Defense: 'C', Speed: 'C', Precision: 'C', Agility: 'C', Mana: 'C',
};

// ==================== HELPER FUNCTIONS ====================

const createCharacter = (
  id: string,
  name: string,
  race: string,
  backstory: string,
  appearance: string,
  combatStyle: string,
  personality: string,
  personalityAnecdote: string,
  personalityAnecdoteTitle: string,
  combatAnecdote: string,
  combatAnecdoteTitle: string,
  traits: Trait[],
  passiveSkill: PassiveSkill,
  specialSkill: SpecialSkill,
  combatLines: GeneratedCharacter['combatLines'],
  resonancePassive: ResonancePassive,
  status: 'RECRUITED' | 'UNRECRUITED' = 'UNRECRUITED'
): GeneratedCharacter => ({
  id: `default-char-${id}`,
  imageKey: `default-char-${id}-portrait`,
  name,
  race,
  backstory,
  appearance,
  combatStyle,
  personality,
  personalityAnecdote,
  personalityAnecdoteTitle,
  combatAnecdote,
  combatAnecdoteTitle,
  traits,
  passiveSkill,
  stats: BASE_STATS,
  bonusStats: {},
  image: '',
  specialSkill,
  combatLines,
  wins: 0,
  losses: 0,
  victoryImages: [],
  victoryPoints: 5,
  unlockedTraits: traits,
  unlockedPassiveSkills: [passiveSkill],
  unlockedSpecialSkills: [specialSkill],
  status,
  cooldownUntil: null,
  postRecruitmentChatHistory: [],
  resonanceLevel: 0,
  resonanceExp: 0,
  resonancePassive: null,
  unlockedResonancePassives: [resonancePassive],
});

// ==================== CHARACTER 1: KAELEN (Tank Knight) ====================

const KAELEN_TRAITS: Trait[] = [
    {
        name: "거인의 혈맥",
        description: "거인의 피가 섞여 초인적인 생명력을 얻었지만, 거대한 몸은 둔할 수밖에 없습니다.",
    modifications: [{ stat: "Vitality", value: 3 }, { stat: "Agility", value: -2 }]
    },
    {
        name: "철벽의 자세",
        description: "수년간의 훈련으로 속도를 희생하여 철옹성 같은 방어 자세를 완성했습니다.",
    modifications: [{ stat: "Defense", value: 2 }, { stat: "Speed", value: -1 }]
    },
    {
        name: "묵직한 강타",
        description: "정확성보다는 한 방의 파괴력에 모든 것을 겁니다.",
    modifications: [{ stat: "Attack", value: 2 }, { stat: "Precision", value: -1 }]
    }
];

const KAELEN_PASSIVE: PassiveSkill = {
    name: "최후의 저항",
    description: "궁지에 몰려 패배가 임박했을 때, 그의 투지는 가장 밝게 타오르며 필사적인 힘을 부여합니다.",
    condition: { type: "HP_BELOW_THRESHOLD", threshold: 0.3 },
    effect: { type: "STAT_MODIFICATION", modification: { stat: "Attack", value: 2 } }
};

const KAELEN_SPECIAL: SpecialSkill = {
  name: '재기의 바람',
  description: '의지를 집중하여, 카엘렌은 깊은 체력의 예비를 불러내 상처를 회복합니다.',
  effectDescription: '체력이 50% 미만일 때 B등급 생명력 기반으로 회복합니다.',
  effect: { type: 'HEAL', value: 'B' },
  activation: { timing: 'ON_TURN_START', condition: { type: 'HP_BELOW_THRESHOLD', threshold: 0.5 } },
};

const KAELEN_RESONANCE: ResonancePassive = {
    name: "창조주의 가호",
    description: "창조주와의 첫 유대의 증표로, 전투 시작 시 작은 보호막을 얻습니다.",
    effect: { type: 'START_OF_BATTLE_GUARD', value: 10 }
};

// ==================== CHARACTER 2: LYRA (Assassin) ====================

const LYRA_TRAITS: Trait[] = [
   {
        name: "유리 대포",
        description: "모든 것을 공격에 쏟아부어, 방어는 거의 신경 쓰지 않습니다.",
    modifications: [{ stat: "Attack", value: 3 }, { stat: "Defense", value: -2 }]
   },
   {
        name: "날랜 발",
        description: "그녀는 천성적으로 빠르지만, 가벼운 체구 때문에 튼튼하지 못합니다.",
    modifications: [{ stat: "Speed", value: 2 }, { stat: "Vitality", value: -1 }]
   },
   {
       name: "곡예사",
       description: "회피에 극도로 집중하여, 조준이 약간 불안정해집니다.",
    modifications: [{ stat: "Agility", value: 2 }, { stat: "Precision", value: -1 }]
   }
];

const LYRA_PASSIVE: PassiveSkill = {
    name: "마무리 일격",
    description: "그녀는 상대의 약점을 파고드는 전문가이며, 가장 취약할 때 치명적인 정밀함으로 공격합니다.",
    condition: { type: "ENEMY_HP_BELOW_THRESHOLD", threshold: 0.4 },
    effect: { type: "STAT_MODIFICATION", modification: { stat: "Precision", value: 2 } }
};

const LYRA_SPECIAL: SpecialSkill = {
  name: '독사 일격',
  description: '라이라는 칼날에 속효성 독을 바르고 급소를 노립니다.',
  effectDescription: '공격 성공 시, 3턴 동안 독을 부여합니다 (턴당 4 피해).',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'POISON', duration: 3, potency: 4 } },
  activation: { timing: 'AFTER_HIT_SUCCESS' },
};

const LYRA_RESONANCE: ResonancePassive = {
    name: "창조주의 손길",
    description: "그녀의 창조주와의 유대는 전투 시작 시 집중할 수 있는 약간의 마나를 부여합니다.",
    effect: { type: 'BATTLE_START_MANA', value: 1 }
};

// ==================== CHARACTER 3: ZEPHYR (Chaos Mage) ====================

const ZEPHYR_TRAITS: Trait[] = [
    {
        name: "비전 과부하",
        description: "막대한 마나를 얻는 대가로 육체의 건강을 희생합니다.",
    modifications: [{ stat: "Mana", value: 3 }, { stat: "Vitality", value: -2 }]
    },
    {
        name: "유리 대포",
        description: "모든 것을 공격에 쏟아부어, 방어는 거의 신경 쓰지 않습니다.",
    modifications: [{ stat: "Attack", value: 2 }, { stat: "Defense", value: -1 }]
    },
    {
        name: "신속 시전",
        description: "빠른 주문 시전은 정신적 부담을 가중시켜 정확도를 떨어뜨립니다.",
    modifications: [{ stat: "Speed", value: 2 }, { stat: "Precision", value: -1 }]
    }
];

const ZEPHYR_PASSIVE: PassiveSkill = {
    name: "불안정한 흐름",
    description: "체력이 낮아지면 내면의 혼돈이 폭발하여 공격에 예측 불가능한 힘을 불어넣습니다.",
    condition: { type: "HP_BELOW_THRESHOLD", threshold: 0.4 },
    effect: { type: "APPLY_STATUS_EFFECT_ON_HIT", chance: 0.33, effect: { type: 'STUN', duration: 1, potency: 0 } }
};

const ZEPHYR_SPECIAL: SpecialSkill = {
  name: '마나 소각',
  description: '제피르는 적에게 혼돈의 인장을 새겨 내면부터 불태웁니다.',
  effectDescription: '화상 부여 (3턴, 5피해)',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'BURN', duration: 3, potency: 5 } },
  activation: { timing: 'ON_TURN_START', condition: { type: 'MANA_ABOVE_THRESHOLD', threshold: 2 } },
};

const ZEPHYR_RESONANCE: ResonancePassive = {
    name: "창조주의 닻",
    description: "창조주와의 유대는 전투 시작 시 그의 혼돈적인 에너지를 안정시키는 데 도움을 줍니다.",
    effect: { type: 'BATTLE_START_MANA', value: 2 }
};

// ==================== CHARACTER 4: THORNE (Berserker) ====================

const THORNE_TRAITS: Trait[] = [
  {
    name: "광전사의 분노",
    description: "분노가 그의 공격을 강화하지만, 적의 공격도 무시할 수 없게 됩니다.",
    modifications: [{ stat: "Attack", value: 3 }, { stat: "Defense", value: -2 }]
  },
  {
    name: "야수의 본능",
    description: "동물적 감각으로 위험을 예측하지만, 정밀한 판단은 어렵습니다.",
    modifications: [{ stat: "Agility", value: 2 }, { stat: "Precision", value: -1 }]
  },
  {
    name: "불굴의 의지",
    description: "끈질긴 생명력을 가졌지만, 그 무게가 속도를 늦춥니다.",
    modifications: [{ stat: "Vitality", value: 2 }, { stat: "Speed", value: -1 }]
  }
];

const THORNE_PASSIVE: PassiveSkill = {
  name: "피의 광란",
  description: "부상을 입을수록 더욱 광폭해져, 공격력이 치솟습니다.",
  condition: { type: "HP_BELOW_THRESHOLD", threshold: 0.5 },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Attack", value: 3 } }
};

const THORNE_SPECIAL: SpecialSkill = {
  name: '피의 포효',
  description: '전장을 울리는 포효로 적의 의지를 꺾습니다.',
  effectDescription: '적에게 취약 상태를 부여합니다 (3턴, 방어력 -2).',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'VULNERABLE', duration: 3, potency: -2 } },
  activation: { timing: 'ON_TURN_START' },
};

const THORNE_RESONANCE: ResonancePassive = {
  name: "야생의 축복",
  description: "자연의 힘이 전투 시작 시 보호막을 부여합니다.",
  effect: { type: 'START_OF_BATTLE_GUARD', value: 8 }
};

// ==================== CHARACTER 5: SERAPHINA (Paladin) ====================

const SERAPHINA_TRAITS: Trait[] = [
  {
    name: "성스러운 수호",
    description: "신성한 힘이 방어를 강화하지만, 속도가 느려집니다.",
    modifications: [{ stat: "Defense", value: 3 }, { stat: "Speed", value: -2 }]
  },
  {
    name: "정의의 일격",
    description: "정의로운 분노가 공격을 강화하지만, 회피가 어려워집니다.",
    modifications: [{ stat: "Attack", value: 2 }, { stat: "Agility", value: -1 }]
  },
  {
    name: "축복받은 체질",
    description: "신의 축복으로 강인한 체력을 가지지만, 마법에 대한 감각이 무뎌집니다.",
    modifications: [{ stat: "Vitality", value: 2 }, { stat: "Mana", value: -1 }]
  }
];

const SERAPHINA_PASSIVE: PassiveSkill = {
  name: "신성한 응보",
  description: "체력이 높을 때 신성한 힘이 정확도를 높여줍니다.",
  condition: { type: "HP_ABOVE_THRESHOLD", threshold: 0.7 },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Precision", value: 2 } }
};

const SERAPHINA_SPECIAL: SpecialSkill = {
  name: '치유의 빛',
  description: '신성한 빛으로 상처를 치유합니다.',
  effectDescription: 'A등급 생명력 기반으로 체력을 회복합니다.',
  effect: { type: 'HEAL', value: 'A' },
  activation: { timing: 'ON_TURN_START', condition: { type: 'HP_BELOW_THRESHOLD', threshold: 0.6 } },
};

const SERAPHINA_RESONANCE: ResonancePassive = {
  name: "신의 가호",
  description: "전투 시작 시 신성한 보호막이 펼쳐집니다.",
  effect: { type: 'START_OF_BATTLE_GUARD', value: 15 }
};

// ==================== CHARACTER 6: VEX (Shadow Dancer) ====================

const VEX_TRAITS: Trait[] = [
  {
    name: "그림자 걸음",
    description: "그림자 속에서 움직여 민첩하지만, 체력이 약합니다.",
    modifications: [{ stat: "Agility", value: 3 }, { stat: "Vitality", value: -2 }]
  },
  {
    name: "암습자의 눈",
    description: "어둠 속에서도 정확하게 노리지만, 방어에는 신경 쓰지 않습니다.",
    modifications: [{ stat: "Precision", value: 2 }, { stat: "Defense", value: -1 }]
  },
  {
    name: "질풍",
    description: "바람처럼 빠르지만, 공격의 무게가 가볍습니다.",
    modifications: [{ stat: "Speed", value: 2 }, { stat: "Attack", value: -1 }]
  }
];

const VEX_PASSIVE: PassiveSkill = {
  name: "급소 강타",
  description: "적이 상태이상에 걸려 있을 때 치명적인 일격을 날립니다.",
  condition: { type: "ENEMY_HAS_STATUS_EFFECT" },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Attack", value: 3 } }
};

const VEX_SPECIAL: SpecialSkill = {
  name: '어둠의 낙인',
  description: '적의 눈을 일시적으로 멀게 합니다.',
  effectDescription: '실명 부여 (2턴, 정확도 -3).',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'BLIND', duration: 2, potency: -3 } },
  activation: { timing: 'AFTER_HIT_SUCCESS' },
};

const VEX_RESONANCE: ResonancePassive = {
  name: "그림자의 축복",
  description: "전투 시작 시 추가 마나를 얻습니다.",
  effect: { type: 'BATTLE_START_MANA', value: 1 }
};

// ==================== CHARACTER 7: GRIMWALD (Necromancer) ====================

const GRIMWALD_TRAITS: Trait[] = [
  {
    name: "망령의 계약",
    description: "죽음의 힘으로 마나가 증폭되지만, 생명력이 약해집니다.",
    modifications: [{ stat: "Mana", value: 3 }, { stat: "Vitality", value: -2 }]
  },
  {
    name: "저주받은 지식",
    description: "금기된 지식이 정밀함을 높이지만, 신체가 쇠약해집니다.",
    modifications: [{ stat: "Precision", value: 2 }, { stat: "Defense", value: -1 }]
  },
  {
    name: "죽음의 손길",
    description: "어둠의 힘이 공격을 강화하지만, 속도가 느려집니다.",
    modifications: [{ stat: "Attack", value: 2 }, { stat: "Speed", value: -1 }]
  }
];

const GRIMWALD_PASSIVE: PassiveSkill = {
  name: "생명 흡수",
  description: "공격 성공 시 일정 확률로 적의 생명력을 흡수합니다.",
  condition: { type: "ALWAYS_ACTIVE" },
  effect: { type: "APPLY_STATUS_EFFECT_ON_HIT", chance: 0.25, effect: { type: 'POISON', duration: 2, potency: 3 } }
};

const GRIMWALD_SPECIAL: SpecialSkill = {
  name: '마나 흡수',
  description: '적의 마법 에너지를 빼앗습니다.',
  effectDescription: '적의 마나 2를 흡수합니다.',
  effect: { type: 'MANA_SIPHON', value: 2 },
  activation: { timing: 'ON_TURN_START' },
};

const GRIMWALD_RESONANCE: ResonancePassive = {
  name: "어둠의 유대",
  description: "전투 시작 시 망령의 힘으로 마나를 얻습니다.",
  effect: { type: 'BATTLE_START_MANA', value: 2 }
};

// ==================== CHARACTER 8: AURORA (Ice Mage) ====================

const AURORA_TRAITS: Trait[] = [
  {
    name: "얼음의 핏줄",
    description: "냉기의 힘으로 마나가 풍부하지만, 속도가 느립니다.",
    modifications: [{ stat: "Mana", value: 2 }, { stat: "Speed", value: -1 }]
  },
  {
    name: "서리 장벽",
    description: "얼음 방어막으로 방어력이 높지만, 공격력이 약합니다.",
    modifications: [{ stat: "Defense", value: 2 }, { stat: "Attack", value: -1 }]
  },
  {
    name: "정밀 시전",
    description: "신중한 마법 시전으로 정확하지만, 민첩함이 떨어집니다.",
    modifications: [{ stat: "Precision", value: 2 }, { stat: "Agility", value: -1 }]
  }
];

const AURORA_PASSIVE: PassiveSkill = {
  name: "동결 장막",
  description: "체력이 높을 때 서리의 보호로 방어력이 증가합니다.",
  condition: { type: "HP_ABOVE_THRESHOLD", threshold: 0.6 },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Defense", value: 2 } }
};

const AURORA_SPECIAL: SpecialSkill = {
  name: '빙결',
  description: '적을 얼어붙게 만들어 둔화시킵니다.',
  effectDescription: '둔화 부여 (3턴, 속도 -3).',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'SLOW', duration: 3, potency: -3 } },
  activation: { timing: 'ON_TURN_START', condition: { type: 'MANA_ABOVE_THRESHOLD', threshold: 1 } },
};

const AURORA_RESONANCE: ResonancePassive = {
  name: "겨울의 축복",
  description: "전투 시작 시 서리 보호막을 얻습니다.",
  effect: { type: 'START_OF_BATTLE_GUARD', value: 12 }
};

// ==================== CHARACTER 9: RAGNAR (Viking Warlord) ====================

const RAGNAR_TRAITS: Trait[] = [
  {
    name: "바이킹의 피",
    description: "북방 전사의 강인한 체력이지만, 마법에 둔감합니다.",
    modifications: [{ stat: "Vitality", value: 3 }, { stat: "Mana", value: -2 }]
  },
  {
    name: "전투 광기",
    description: "싸움에서 더 강해지지만, 정확도가 떨어집니다.",
    modifications: [{ stat: "Attack", value: 2 }, { stat: "Precision", value: -1 }]
  },
  {
    name: "도끼 달인",
    description: "도끼 휘두르는 속도가 빠르지만, 회피에는 서툽니다.",
    modifications: [{ stat: "Speed", value: 2 }, { stat: "Agility", value: -1 }]
  }
];

const RAGNAR_PASSIVE: PassiveSkill = {
  name: "북방의 분노",
  description: "체력이 낮아질수록 바이킹의 분노가 타오릅니다.",
  condition: { type: "HP_BELOW_THRESHOLD", threshold: 0.4 },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Speed", value: 2 } }
};

const RAGNAR_SPECIAL: SpecialSkill = {
  name: '전쟁의 함성',
  description: '전쟁의 함성으로 자신을 보호합니다.',
  effectDescription: '가드 15를 얻습니다.',
  effect: { type: 'GAIN_GUARD', value: 15 },
  activation: { timing: 'ON_TURN_START' },
};

const RAGNAR_RESONANCE: ResonancePassive = {
  name: "오딘의 축복",
  description: "전투 시작 시 전사의 보호막을 얻습니다.",
  effect: { type: 'START_OF_BATTLE_GUARD', value: 10 }
};

// ==================== CHARACTER 10: MIRA (Enchantress) ====================

const MIRA_TRAITS: Trait[] = [
  {
    name: "마법 친화력",
    description: "타고난 마법 감각으로 마나가 풍부하지만, 체력이 약합니다.",
    modifications: [{ stat: "Mana", value: 3 }, { stat: "Vitality", value: -2 }]
  },
  {
    name: "매혹의 눈",
    description: "적을 혼란스럽게 하는 눈빛이지만, 방어에 신경 쓰지 않습니다.",
    modifications: [{ stat: "Precision", value: 2 }, { stat: "Defense", value: -1 }]
  },
  {
    name: "우아한 몸놀림",
    description: "우아하게 피하지만, 공격력이 약합니다.",
    modifications: [{ stat: "Agility", value: 2 }, { stat: "Attack", value: -1 }]
  }
];

const MIRA_PASSIVE: PassiveSkill = {
  name: "마력 증폭",
  description: "마나가 풍부할 때 공격력이 증가합니다.",
  condition: { type: "MANA_ABOVE_THRESHOLD", threshold: 2 },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Attack", value: 2 } }
};

const MIRA_SPECIAL: SpecialSkill = {
  name: '정신 지배',
  description: '적의 정신을 잠시 혼란시킵니다.',
  effectDescription: '기절 부여 (1턴).',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'STUN', duration: 1, potency: 0 } },
  activation: { timing: 'ON_TURN_START', condition: { type: 'MANA_ABOVE_THRESHOLD', threshold: 2 } },
};

const MIRA_RESONANCE: ResonancePassive = {
  name: "비전의 연결",
  description: "전투 시작 시 마법 에너지를 얻습니다.",
  effect: { type: 'BATTLE_START_MANA', value: 2 }
};

// ==================== CHARACTER 11: STONE (Golem Guardian) ====================

const STONE_TRAITS: Trait[] = [
  {
    name: "바위 몸통",
    description: "돌로 된 몸은 믿을 수 없이 단단하지만, 느립니다.",
    modifications: [{ stat: "Defense", value: 3 }, { stat: "Speed", value: -2 }]
  },
  {
    name: "대지의 힘",
    description: "대지의 힘으로 강한 체력을 가지지만, 민첩하지 못합니다.",
    modifications: [{ stat: "Vitality", value: 3 }, { stat: "Agility", value: -2 }]
  },
  {
    name: "묵직한 주먹",
    description: "돌 주먹의 파괴력은 강하지만, 정밀하지 못합니다.",
    modifications: [{ stat: "Attack", value: 2 }, { stat: "Precision", value: -1 }]
  }
];

const STONE_PASSIVE: PassiveSkill = {
  name: "철벽 방어",
  description: "체력이 높을 때 더욱 단단해집니다.",
  condition: { type: "HP_ABOVE_THRESHOLD", threshold: 0.5 },
  effect: { type: "STAT_MODIFICATION", modification: { stat: "Defense", value: 3 } }
};

const STONE_SPECIAL: SpecialSkill = {
  name: '대지의 방벽',
  description: '땅에서 암석을 끌어올려 방어합니다.',
  effectDescription: '가드 20을 얻습니다.',
  effect: { type: 'GAIN_GUARD', value: 20 },
  activation: { timing: 'ON_TURN_START' },
};

const STONE_RESONANCE: ResonancePassive = {
  name: "대지의 축복",
  description: "전투 시작 시 암석 보호막을 얻습니다.",
  effect: { type: 'START_OF_BATTLE_GUARD', value: 20 }
};

// ==================== CHARACTER 12: BLAZE (Fire Elementalist) ====================

const BLAZE_TRAITS: Trait[] = [
  {
    name: "불의 정수",
    description: "화염의 힘으로 공격력이 높지만, 방어가 약합니다.",
    modifications: [{ stat: "Attack", value: 3 }, { stat: "Defense", value: -2 }]
  },
  {
    name: "폭발적 에너지",
    description: "폭발적인 마나지만, 체력이 불안정합니다.",
    modifications: [{ stat: "Mana", value: 2 }, { stat: "Vitality", value: -1 }]
  },
  {
    name: "화염 질주",
    description: "불꽃처럼 빠르지만, 정밀함이 부족합니다.",
    modifications: [{ stat: "Speed", value: 2 }, { stat: "Precision", value: -1 }]
  }
];

const BLAZE_PASSIVE: PassiveSkill = {
  name: "불꽃 연소",
  description: "공격 성공 시 화상을 입힐 확률이 있습니다.",
  condition: { type: "ALWAYS_ACTIVE" },
  effect: { type: "APPLY_STATUS_EFFECT_ON_HIT", chance: 0.3, effect: { type: 'BURN', duration: 2, potency: 4 } }
};

const BLAZE_SPECIAL: SpecialSkill = {
  name: '업화',
  description: '강력한 화염으로 적을 불태웁니다.',
  effectDescription: '화상 부여 (4턴, 6피해).',
  effect: { type: 'APPLY_STATUS_EFFECT', effect: { type: 'BURN', duration: 4, potency: 6 } },
  activation: { timing: 'ON_TURN_START', condition: { type: 'MANA_ABOVE_THRESHOLD', threshold: 1 } },
};

const BLAZE_RESONANCE: ResonancePassive = {
  name: "화염의 핏줄",
  description: "전투 시작 시 불꽃의 힘으로 마나를 얻습니다.",
  effect: { type: 'BATTLE_START_MANA', value: 1 }
};

// ==================== EXPORT ALL CHARACTERS ====================

export const defaultCharacters: GeneratedCharacter[] = [
  createCharacter(
    'kaelen',
    '기사 카엘렌',
    '인간',
    '왕실 근위대 가문에서 태어난 카엘렌은 무고한 이들을 지키기 위해 훈련받았습니다. 끔찍한 용의 공격으로 고향이 폐허가 된 후, 그는 자신을 괴롭히는 단 한 번의 실패를 속죄하기 위해 방패와 검이 필요한 사람들을 도우며 세상을 떠돌고 있습니다.',
    '다부진 턱과 짧게 자른 갈색 머리를 한 키가 크고 어깨가 넓은 남자. 빛나는 강철 판금 갑옷 아래에 파란색 튜닉을 입고 있습니다.',
    '전형적인 검과 방패의 전사. 방패로 적을 제어하며, 날카로운 장검으로 공격합니다.',
    '과묵하고, 명예로우며, 보호 본능이 강합니다.',
    "상단을 호위하던 중, 도적들이 두 배의 보수를 제안했습니다. 카엘렌은 말없이 검을 뽑아 상인의 마차 앞에 섰습니다.",
    "불굴의 방패",
    "오크헤이븐 공성전에서 카엘렌은 단신으로 좁은 다리를 지키며 고블린 부대를 막아냈습니다.",
    "카엘렌의 저항",
    KAELEN_TRAITS,
    KAELEN_PASSIVE,
    KAELEN_SPECIAL,
    { onAttackHit: ["명예를 위해!", "지나갈 수 없다!", "정의는 실현되었다."], onDodge: ["너무 느리군.", "가상한 시도다."], onVictory: ["이제 편히 쉬어라."] },
    KAELEN_RESONANCE,
    'RECRUITED'
  ),
  
  createCharacter(
    'lyra',
    '라이라',
    '인간',
    '도시의 어두운 뒷골목에서 도둑 길드에 의해 자란 고아. 그녀는 부패한 귀족들을 경멸하며 자신의 기술로 부를 "재분배"합니다.',
    '날카로운 이목구비와 까마귀 검은 머리를 한 날렵한 여성. 어두운 가죽 갑옷을 입고 한 쌍의 단검을 허벅지에 차고 있습니다.',
    '속도와 정밀함에 의존하는 신속하고 치명적인 결투가.',
    '냉소적이고 재치 있으며 맹렬하게 독립적입니다.',
    "라이라는 경비병이 길거리 상인을 괴롭히는 것을 보고, 그날 밤 경비병의 돈주머니를 훔쳐 그의 제복을 사원 첨탑에 걸어놓았습니다.",
    "겸손에 대한 교훈",
    "보석만 훔치려 했으나, 주인이 하인을 학대하는 것을 보고 경비원 전체를 무력화시킨 후 떠났습니다.",
    "나이팅게일의 강탈",
    LYRA_TRAITS,
    LYRA_PASSIVE,
    LYRA_SPECIAL,
    { onAttackHit: ["잡았다.", "깊은 상처야.", "아팠을 것 같네."], onDodge: ["빗나갔어.", "따라와 봐."], onVictory: ["또 다른 바보, 또 다른 행운."] },
    LYRA_RESONANCE
  ),
  
  createCharacter(
    'zephyr',
    '제피르',
    '하프 엘프',
    '은빛 첨탑 아카데미의 신동이었던 제피르는 금지된 고서에 손을 댔다가 순수한 혼돈 마법의 존재를 위한 통로가 되었습니다.',
    '가느다란 체구에 거친 은색 머리카락, 보라색 눈. 비전 상징이 수놓인 어둡고 흐르는 로브를 입고 있습니다.',
    '길들여지지 않은 순수한 마법 에너지를 방출합니다.',
    '오만하고 똑똑하지만, 자신이 휘두르는 힘에 대한 뿌리 깊은 두려움을 가지고 있습니다.',
    "한 어린 소녀가 그에게 꽃을 건네주었고, 그 순간 혼돈의 에너지가 잠시 잠잠해졌습니다.",
    "한 송이의 평온",
    "산적들에게 포위되었을 때 힘이 폭주하여 주변을 초토화시켰습니다.",
    "통제되지 않은 폭풍",
    ZEPHYR_TRAITS,
    ZEPHYR_PASSIVE,
    ZEPHYR_SPECIAL,
    { onAttackHit: ["혼돈을 느껴라!", "사라져라!", "이것이 진짜 힘이다!"], onDodge: ["어리석군.", "나를 건드릴 순 없어."], onVictory: ["...이게 내가 원한 건 아니었어."] },
    ZEPHYR_RESONANCE
  ),
  
  createCharacter(
    'thorne',
    '쏜',
    '오크',
    '북방 산맥의 전설적인 광전사. 부족을 전염병으로 잃은 후, 분노만이 그를 살게 합니다.',
    '거대한 체구에 수많은 전투 흉터, 붉은 전쟁 페인트를 한 녹색 피부의 오크.',
    '거대한 전투 도끼를 휘두르며 적진에 돌격하는 광폭한 스타일.',
    '말수가 적고, 분노로 가득 차 있지만, 전우에게는 충성스럽습니다.',
    "한 번은 동료가 부상당하자, 쏜은 홀로 적 30명 속으로 뛰어들어 동료를 구해냈습니다.",
    "피의 형제애",
    "전투 중 적군 장수를 단 세 번의 일격으로 쓰러뜨렸습니다.",
    "세 번의 일격",
    THORNE_TRAITS,
    THORNE_PASSIVE,
    THORNE_SPECIAL,
    { onAttackHit: ["으아아아!", "피다!", "무너져라!"], onDodge: ["느리다!", "찌를 수 없어!"], onVictory: ["...더 강한 적은 없나."] },
    THORNE_RESONANCE
  ),
  
  createCharacter(
    'seraphina',
    '세라피나',
    '천사족',
    '타락한 천사를 쓰러뜨리기 위해 천상계에서 파견된 성기사. 정의와 자비를 추구합니다.',
    '금발의 긴 머리와 빛나는 파란 눈, 등 뒤에 희미하게 빛나는 날개의 형상이 보입니다.',
    '신성한 힘이 담긴 검과 방패로 전투하며, 치유 마법도 사용합니다.',
    '고결하고 자비로우며, 때로는 지나치게 이상주의적입니다.',
    "적군 병사의 목숨을 살려주고, 후에 그가 마을 사람들을 구하는 것을 지켜봤습니다.",
    "자비의 결실",
    "혼자서 악마의 군단을 막아서며 마을 사람들이 피신할 시간을 벌었습니다.",
    "새벽의 수호자",
    SERAPHINA_TRAITS,
    SERAPHINA_PASSIVE,
    SERAPHINA_SPECIAL,
    { onAttackHit: ["빛이 심판한다!", "정의는 실현된다!", "회개하라!"], onDodge: ["빛이 나를 지킨다.", "헛수고다."], onVictory: ["평화가 찾아오기를."] },
    SERAPHINA_RESONANCE
  ),
  
  createCharacter(
    'vex',
    '벡스',
    '다크 엘프',
    '지하 도시에서 암살 기술을 배운 그림자 무용수. 빛을 혐오하고 어둠 속에서만 진정한 힘을 발휘합니다.',
    '은빛 짧은 머리와 붉은 눈, 창백한 피부. 그림자처럼 녹아드는 검은 옷을 입고 있습니다.',
    '그림자 속에서 나타나 순식간에 사라지는 암살 스타일.',
    '냉정하고 계산적이며, 감정을 드러내지 않습니다.',
    "한 번도 의뢰를 실패한 적이 없지만, 어린이를 대상으로 한 의뢰만은 거절합니다.",
    "암살자의 규칙",
    "경비가 삼엄한 성에 침투해 타겟을 제거하고 아무도 모르게 빠져나왔습니다.",
    "보이지 않는 죽음",
    VEX_TRAITS,
    VEX_PASSIVE,
    VEX_SPECIAL,
    { onAttackHit: ["그림자가 삼킨다.", "끝이다.", "조용히..."], onDodge: ["보이지 않는다.", "허공을 벴군."], onVictory: ["의뢰 완료."] },
    VEX_RESONANCE
  ),
  
  createCharacter(
    'grimwald',
    '그림왈드',
    '언데드',
    '한때 위대한 마법사였으나, 금지된 지식을 추구하다 죽음과 계약을 맺어 리치가 되었습니다.',
    '해골 얼굴에 푸른 불꽃이 타오르는 눈구멍, 너덜너덜한 검은 로브.',
    '죽음의 마법과 저주로 적을 약화시키고 생명력을 흡수합니다.',
    '냉소적이고 모든 것을 초월한 듯한 태도를 보이지만, 삶에 대한 그리움이 있습니다.',
    "한 번은 죽어가는 아이를 보고, 자신의 생명력 일부를 바쳐 아이를 살렸습니다.",
    "잊혀진 인간성",
    "적군 전체를 역병의 저주로 무력화시켰습니다.",
    "죽음의 안개",
    GRIMWALD_TRAITS,
    GRIMWALD_PASSIVE,
    GRIMWALD_SPECIAL,
    { onAttackHit: ["죽음을 맛봐라.", "영원히 잠들어라.", "네 생명은 내 것이다."], onDodge: ["헛수고다.", "이미 죽은 자를 어찌 죽이랴."], onVictory: ["...공허하군."] },
    GRIMWALD_RESONANCE
  ),
  
  createCharacter(
    'aurora',
    '오로라',
    '빙결 엘프',
    '영원한 겨울의 왕국에서 온 얼음 마법사. 왕국이 멸망한 후 남은 유일한 생존자입니다.',
    '얼음처럼 투명한 피부와 하얀 머리카락, 눈의 결정체처럼 빛나는 눈.',
    '얼음 마법으로 적을 둔화시키고 방어벽을 만듭니다.',
    '냉정하고 고독하지만, 내면에는 따뜻함이 있습니다.',
    "얼어붙은 호수에서 빠진 아이를 구하며, 처음으로 마법 외의 것으로 누군가를 도왔습니다.",
    "녹는 얼음",
    "적군의 보급로를 얼음 폭풍으로 완전히 차단했습니다.",
    "영원의 겨울",
    AURORA_TRAITS,
    AURORA_PASSIVE,
    AURORA_SPECIAL,
    { onAttackHit: ["얼어붙어라.", "겨울이 왔다.", "추위를 느껴봐."], onDodge: ["바람처럼.", "서리에 스쳐갔을 뿐."], onVictory: ["...조용하군."] },
    AURORA_RESONANCE
  ),
  
  createCharacter(
    'ragnar',
    '라그나르',
    '인간 (바이킹)',
    '북해를 지배하던 전설적인 바이킹 군주. 더 강한 적을 찾아 끝없이 항해합니다.',
    '붉은 수염과 땋은 금발, 전투 흉터로 가득한 거구. 곰가죽 망토를 걸쳤습니다.',
    '쌍도끼를 휘두르며 적진을 유린하는 공격적인 스타일.',
    '호탕하고 전투광이지만, 동료에게는 아버지 같은 존재입니다.',
    "패배한 적에게도 술과 음식을 나눠주며, '좋은 싸움이었다'라고 인사합니다.",
    "전사의 예의",
    "폭풍우 속에서 적선 다섯 척을 홀로 격침시켰습니다.",
    "북해의 폭풍",
    RAGNAR_TRAITS,
    RAGNAR_PASSIVE,
    RAGNAR_SPECIAL,
    { onAttackHit: ["발할라로!", "오딘께 바친다!", "하하하!"], onDodge: ["약하군!", "그게 다냐!"], onVictory: ["좋은 싸움이었다!"] },
    RAGNAR_RESONANCE
  ),
  
  createCharacter(
    'mira',
    '미라',
    '사이렌',
    '바다의 마녀로 알려진 매혹의 마법사. 사람들을 홀리지만, 진정한 사랑을 찾고 있습니다.',
    '바다색 머리카락과 보랏빛 눈, 비늘이 은은히 빛나는 피부. 조개껍데기 장신구를 걸쳤습니다.',
    '매혹 마법과 정신 지배로 적을 혼란시킵니다.',
    '장난스럽고 유혹적이지만, 외로움을 숨기고 있습니다.',
    "한 어부를 사랑했지만, 그의 행복을 위해 기억을 지우고 떠났습니다.",
    "바다의 눈물",
    "적군 함대 전체를 매혹시켜 서로 싸우게 만들었습니다.",
    "세이렌의 노래",
    MIRA_TRAITS,
    MIRA_PASSIVE,
    MIRA_SPECIAL,
    { onAttackHit: ["내 노래를 들어봐~", "예쁘지?", "아파?"], onDodge: ["날 잡을 수 있을까~?", "물처럼 빠져나가지."], onVictory: ["재미있었어~"] },
    MIRA_RESONANCE
  ),
  
  createCharacter(
    'stone',
    '스톤',
    '골렘',
    '고대 마법사가 만든 돌 골렘. 창조자가 죽은 후에도 마지막 명령을 지키고 있습니다.',
    '3미터 높이의 거대한 돌 몸체, 눈에서 푸른 마법 빛이 납니다.',
    '느리지만 강력한 공격과 철벽 방어로 적을 압도합니다.',
    '말이 없고 단순하지만, 약한 자를 보호하려는 본능이 있습니다.',
    "마을에 도적이 습격했을 때, 아이들이 숨을 때까지 문 앞에 서서 모든 공격을 막아냈습니다.",
    "흔들리지 않는 문",
    "성벽을 부수려는 공성 무기들을 혼자서 모두 파괴했습니다.",
    "대지의 분노",
    STONE_TRAITS,
    STONE_PASSIVE,
    STONE_SPECIAL,
    { onAttackHit: ["...부순다.", "...막지 못한다.", "...명령이다."], onDodge: ["...무의미하다.", "...단단하다."], onVictory: ["...명령 완료."] },
    STONE_RESONANCE
  ),
  
  createCharacter(
    'blaze',
    '블레이즈',
    '화염 정령',
    '화산에서 태어난 순수한 불의 정령. 호기심으로 인간 세계에 왔지만, 통제되지 않는 힘이 위험합니다.',
    '인간형 불꽃 형체, 핵심에 빛나는 마그마 심장이 보입니다.',
    '모든 것을 태워버리는 화염 공격.',
    '호기심 많고 순수하지만, 자신의 파괴력을 두려워합니다.',
    "꽃을 보고 아름답다고 했지만, 만지는 순간 태워버렸습니다. 그 후로 아무것도 만지지 않으려 합니다.",
    "만질 수 없는 아름다움",
    "적군의 진영 전체를 화염 폭풍으로 잿더미로 만들었습니다.",
    "업화의 심판",
    BLAZE_TRAITS,
    BLAZE_PASSIVE,
    BLAZE_SPECIAL,
    { onAttackHit: ["타오른다!", "불꽃이다!", "재가 되어라!"], onDodge: ["불꽃은 잡을 수 없어!", "스쳐간다!"], onVictory: ["...미안해, 태워버렸어."] },
    BLAZE_RESONANCE
  ),
];
