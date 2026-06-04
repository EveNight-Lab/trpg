import { GeneratedCharacter, CharacterStats, ResonancePassive, Trait, PassiveSkill, SpecialSkill } from '../types';

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
  image: `/images/${id}.png`, // Auto-inject portrait path from public/images/
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
];
