/**
 * Ability Generator - AI 없이 특성/스킬을 로직으로 생성
 */

import { 
  Trait, PassiveSkill, SpecialSkill, ResonancePassive,
  StatName, StatGrade, StatusEffectType,
  TraitConditionType, SkillConditionType
} from '../types';

import { randomPick, randomInt, randomFloat } from '../utils/randomUtils';

import {
  ALL_STATS,
  ALL_STATUS_EFFECTS,
  TRAIT_NAMES,
  STAT_BOOST_DESC_KO,
  STAT_BOOST_DESC_EN,
  STAT_PENALTY_DESC_KO,
  STAT_PENALTY_DESC_EN,
  PASSIVE_CONDITION_NAMES,
  PASSIVE_EFFECT_NAMES_STATUS,
  ACTIVE_SKILL_TEMPLATES,
  RESONANCE_TEMPLATES
} from '../data/abilityTemplates';

/**
 * 특성 3개 생성
 */
export function generateTraits(language: 'ko' | 'en'): Trait[] {
  const isKo = language === 'ko';
  const traits: Trait[] = [];
  const usedCombos = new Set<string>();
  
  while (traits.length < 3) {
    // 올릴 능력치와 내릴 능력치 선택 (서로 다르게)
    const statUp = randomPick(ALL_STATS);
    const statDown = randomPick(ALL_STATS.filter(s => s !== statUp));
    const comboKey = `${statUp}-${statDown}`;
    
    // 이미 사용한 조합이면 스킵
    if (usedCombos.has(comboKey)) continue;
    usedCombos.add(comboKey);
    
    // 일반(+2/-1) vs 극단(+3/-2) 랜덤 선택 (극단은 30% 확률)
    const isExtreme = Math.random() < 0.3;
    const upValue = isExtreme ? 3 : 2;
    const downValue = isExtreme ? -2 : -1;
    
    // 템플릿 선택
    const template = randomPick(TRAIT_NAMES[statUp]);
    const name = isKo ? template.nameKo : template.nameEn;
    
    // 설명 생성
    const upDesc = isKo ? STAT_BOOST_DESC_KO[statUp] : STAT_BOOST_DESC_EN[statUp];
    const downDesc = isKo ? STAT_PENALTY_DESC_KO[statDown] : STAT_PENALTY_DESC_EN[statDown];
    const descPattern = isKo ? template.descPatternKo : template.descPatternEn;
    const description = descPattern.replace('{up}', upDesc).replace('{down}', downDesc);
    
    traits.push({
      name,
      description,
      modifications: [
        { stat: statUp, value: upValue },
        { stat: statDown, value: downValue }
      ]
    });
  }
  
  return traits;
}

/**
 * 패시브 스킬 1개 생성
 */
export function generatePassiveSkill(language: 'ko' | 'en'): PassiveSkill {
  const isKo = language === 'ko';
  
  // 조건 타입 선택 (모든 조건 타입 사용, 가중치 적용)
  const conditionTypes: { type: TraitConditionType; weight: number }[] = [
    { type: 'HP_BELOW_THRESHOLD', weight: 15 },
    { type: 'HP_ABOVE_THRESHOLD', weight: 12 },
    { type: 'ENEMY_HP_BELOW_THRESHOLD', weight: 12 },
    { type: 'ENEMY_HP_ABOVE_THRESHOLD', weight: 8 },
    { type: 'ENEMY_HAS_STATUS_EFFECT', weight: 10 },
    { type: 'SELF_HAS_STATUS_EFFECT', weight: 6 },
    { type: 'MANA_ABOVE_THRESHOLD', weight: 10 },
    { type: 'MANA_BELOW_THRESHOLD', weight: 7 },
    { type: 'ALWAYS_ACTIVE', weight: 20 },
  ];
  
  // 가중치 기반 선택
  const totalWeight = conditionTypes.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  let conditionType: TraitConditionType = 'ALWAYS_ACTIVE';
  for (const c of conditionTypes) {
    roll -= c.weight;
    if (roll <= 0) {
      conditionType = c.type;
      break;
    }
  }
  
  // threshold 결정
  let threshold: number | undefined;
  let statusType: StatusEffectType | undefined;
  
  switch (conditionType) {
    case 'HP_BELOW_THRESHOLD':
      threshold = randomFloat([0.25, 0.3, 0.4, 0.5]);
      break;
    case 'HP_ABOVE_THRESHOLD':
      threshold = randomFloat([0.5, 0.6, 0.7, 0.8]);
      break;
    case 'ENEMY_HP_BELOW_THRESHOLD':
      threshold = randomFloat([0.25, 0.3, 0.4, 0.5]);
      break;
    case 'ENEMY_HP_ABOVE_THRESHOLD':
      threshold = randomFloat([0.6, 0.7, 0.8]);
      break;
    case 'MANA_ABOVE_THRESHOLD':
      threshold = randomInt(1, 3);
      break;
    case 'MANA_BELOW_THRESHOLD':
      threshold = randomInt(1, 2);
      break;
    case 'SELF_HAS_STATUS_EFFECT':
      // 50% 확률로 특정 상태이상, 50% 확률로 아무 상태이상
      if (Math.random() < 0.5) {
        statusType = randomPick(ALL_STATUS_EFFECTS);
      }
      break;
  }
  
  // 효과 타입 선택 (STAT_MODIFICATION 65%, STATUS_ON_HIT 35%)
  const isStatMod = Math.random() < 0.65;
  
  let name: string;
  let description: string;
  let effect: PassiveSkill['effect'];
  
  if (isStatMod) {
    // 스탯 수정 효과
    const buffStat = randomPick(ALL_STATS);
    const buffValue = randomInt(1, 3);
    
    const nameTemplate = randomPick(PASSIVE_CONDITION_NAMES[conditionType]);
    name = isKo ? nameTemplate.nameKo : nameTemplate.nameEn;
    
    const statName = isKo ? {
      Vitality: '생명력', Attack: '공격력', Defense: '방어력', Speed: '속도',
      Precision: '정확도', Agility: '민첩', Mana: '마나'
    }[buffStat] : buffStat;
    
    // 조건별 설명 생성
    const conditionDesc = getConditionDescription(conditionType, threshold, statusType, isKo);
    description = isKo 
      ? `${conditionDesc} ${statName}이(가) ${buffValue}등급 상승합니다.`
      : `${conditionDesc} ${buffStat} increases by ${buffValue} grade(s).`;
    
    effect = {
      type: 'STAT_MODIFICATION',
      modification: { stat: buffStat, value: buffValue }
    };
  } else {
    // 상태이상 적용 효과
    const applyStatusType = randomPick(ALL_STATUS_EFFECTS);
    const chance = randomFloat([0.15, 0.2, 0.25, 0.3, 0.35, 0.4]);
    const duration = randomInt(1, 3);
    const potency = applyStatusType === 'STUN' ? 0 : randomInt(2, 6);
    
    const nameTemplate = randomPick(PASSIVE_EFFECT_NAMES_STATUS[applyStatusType]);
    name = isKo ? nameTemplate.nameKo : nameTemplate.nameEn;
    
    const statusName = isKo ? {
      POISON: '독', STUN: '기절', BURN: '화상', SLOW: '둔화', VULNERABLE: '취약', BLIND: '실명'
    }[applyStatusType] : applyStatusType.toLowerCase();
    
    description = isKo
      ? `공격 성공 시 ${Math.round(chance * 100)}% 확률로 ${statusName}을(를) 부여합니다.`
      : `${Math.round(chance * 100)}% chance to apply ${statusName} on hit.`;
    
    effect = {
      type: 'APPLY_STATUS_EFFECT_ON_HIT',
      chance,
      effect: { type: applyStatusType, duration, potency }
    };
  }
  
  return {
    name,
    description,
    condition: { type: conditionType, threshold, statusType },
    effect
  };
}

// 조건 설명 생성 헬퍼
function getConditionDescription(conditionType: TraitConditionType, threshold?: number, statusType?: StatusEffectType, isKo: boolean = true): string {
  const thresholdPercent = threshold ? Math.round(threshold * 100) : 0;
  
  if (isKo) {
    switch (conditionType) {
      case 'HP_BELOW_THRESHOLD': return `HP가 ${thresholdPercent}% 이하일 때`;
      case 'HP_ABOVE_THRESHOLD': return `HP가 ${thresholdPercent}% 이상일 때`;
      case 'ENEMY_HP_BELOW_THRESHOLD': return `적 HP가 ${thresholdPercent}% 이하일 때`;
      case 'ENEMY_HP_ABOVE_THRESHOLD': return `적 HP가 ${thresholdPercent}% 이상일 때`;
      case 'ENEMY_HAS_STATUS_EFFECT': return `적에게 상태이상이 있을 때`;
      case 'SELF_HAS_STATUS_EFFECT': return statusType ? `자신에게 ${statusType}이(가) 있을 때` : `상태이상에 걸려있을 때`;
      case 'MANA_ABOVE_THRESHOLD': return `마나가 ${threshold} 이상일 때`;
      case 'MANA_BELOW_THRESHOLD': return `마나가 ${threshold} 이하일 때`;
      case 'ALWAYS_ACTIVE': return `항상`;
      default: return '';
    }
  } else {
    switch (conditionType) {
      case 'HP_BELOW_THRESHOLD': return `When HP is below ${thresholdPercent}%,`;
      case 'HP_ABOVE_THRESHOLD': return `When HP is above ${thresholdPercent}%,`;
      case 'ENEMY_HP_BELOW_THRESHOLD': return `When enemy HP is below ${thresholdPercent}%,`;
      case 'ENEMY_HP_ABOVE_THRESHOLD': return `When enemy HP is above ${thresholdPercent}%,`;
      case 'ENEMY_HAS_STATUS_EFFECT': return `When enemy has a status effect,`;
      case 'SELF_HAS_STATUS_EFFECT': return statusType ? `When affected by ${statusType},` : `When under any status effect,`;
      case 'MANA_ABOVE_THRESHOLD': return `When mana is ${threshold} or more,`;
      case 'MANA_BELOW_THRESHOLD': return `When mana is ${threshold} or less,`;
      case 'ALWAYS_ACTIVE': return `Always`;
      default: return '';
    }
  }
}

/**
 * 액티브 스킬 1개 생성
 */
export function generateSpecialSkill(language: 'ko' | 'en'): SpecialSkill {
  const isKo = language === 'ko';
  
  // 발동 타이밍 (가중치 적용)
  const timing: 'ON_TURN_START' | 'AFTER_HIT_SUCCESS' = Math.random() < 0.65 ? 'ON_TURN_START' : 'AFTER_HIT_SUCCESS';
  
  // 발동 조건 (60% 확률로 조건 있음)
  let condition: SpecialSkill['activation']['condition'] | undefined;
  if (Math.random() < 0.6) {
    const condTypes: { type: SkillConditionType; weight: number }[] = [
      { type: 'HP_BELOW_THRESHOLD', weight: 25 },
      { type: 'MANA_ABOVE_THRESHOLD', weight: 30 },
      { type: 'MANA_BELOW_THRESHOLD', weight: 15 },
      { type: 'SELF_HAS_STATUS_EFFECT', weight: 10 },
    ];
    
    // 가중치 기반 선택
    const totalWeight = condTypes.reduce((sum, c) => sum + c.weight, 0);
    let roll = Math.random() * totalWeight;
    let condType: SkillConditionType = 'MANA_ABOVE_THRESHOLD';
    for (const c of condTypes) {
      roll -= c.weight;
      if (roll <= 0) {
        condType = c.type;
        break;
      }
    }
    
    switch (condType) {
      case 'HP_BELOW_THRESHOLD':
        condition = { type: condType, threshold: randomFloat([0.3, 0.4, 0.5, 0.6]) };
        break;
      case 'MANA_ABOVE_THRESHOLD':
        condition = { type: condType, threshold: randomInt(1, 3) };
        break;
      case 'MANA_BELOW_THRESHOLD':
        condition = { type: condType, threshold: randomInt(1, 2) };
        break;
      case 'SELF_HAS_STATUS_EFFECT':
        // 50% 확률로 특정 상태이상
        if (Math.random() < 0.5) {
          condition = { type: condType, statusType: randomPick(ALL_STATUS_EFFECTS) };
        } else {
          condition = { type: condType };
        }
        break;
    }
  }
  
  // 효과 타입 선택 (가중치 적용)
  const effectTypes: { type: string; weight: number }[] = [
    { type: 'ACCURACY_BOOST', weight: 10 },
    { type: 'DAMAGE_BOOST', weight: 15 },
    { type: 'HEAL', weight: 12 },
    { type: 'VAMPIRIC_STRIKE', weight: 8 },
    { type: 'MANA_SIPHON', weight: 6 },
    { type: 'GAIN_GUARD', weight: 14 },
    { type: 'APPLY_STATUS', weight: 15 },
    // NEW EFFECTS
    { type: 'CLEANSE', weight: 8 },
    { type: 'MANA_RESTORE', weight: 6 },
    { type: 'GUARD_BREAK', weight: 6 },
  ];
  
  const totalWeight = effectTypes.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  let effectType = 'DAMAGE_BOOST';
  for (const e of effectTypes) {
    roll -= e.weight;
    if (roll <= 0) {
      effectType = e.type;
      break;
    }
  }
  
  let effect: SpecialSkill['effect'];
  let templateKey: string;
  let effectDescParams: Record<string, string | number> = {};
  
  switch (effectType) {
    case 'ACCURACY_BOOST':
      const accVal = randomInt(1, 4);
      effect = { type: 'ACCURACY_BOOST', value: accVal };
      templateKey = 'ACCURACY_BOOST';
      effectDescParams = { value: accVal };
      break;
    case 'DAMAGE_BOOST':
      const dmgVal = randomInt(1, 4);
      effect = { type: 'DAMAGE_BOOST', value: dmgVal };
      templateKey = 'DAMAGE_BOOST';
      effectDescParams = { value: dmgVal };
      break;
    case 'HEAL':
      const healGrade: StatGrade = randomPick(['C', 'B', 'A', 'S']);
      effect = { type: 'HEAL', value: healGrade };
      templateKey = 'HEAL';
      effectDescParams = { value: healGrade };
      break;
    case 'VAMPIRIC_STRIKE':
      const vampVal = randomFloat([0.25, 0.3, 0.35, 0.4, 0.5]);
      effect = { type: 'VAMPIRIC_STRIKE', value: vampVal };
      templateKey = 'VAMPIRIC_STRIKE';
      effectDescParams = { value: Math.round(vampVal * 100) };
      break;
    case 'MANA_SIPHON':
      const siphonVal = randomInt(1, 3);
      effect = { type: 'MANA_SIPHON', value: siphonVal };
      templateKey = 'MANA_SIPHON';
      effectDescParams = { value: siphonVal };
      break;
    case 'GAIN_GUARD':
      const guardVal = randomInt(8, 25);
      effect = { type: 'GAIN_GUARD', value: guardVal };
      templateKey = 'GAIN_GUARD';
      effectDescParams = { value: guardVal };
      break;
    case 'APPLY_STATUS':
      const statusType = randomPick(ALL_STATUS_EFFECTS);
      const duration = randomInt(2, 4);
      const potency = statusType === 'STUN' ? 0 : randomInt(2, 7);
      effect = {
        type: 'APPLY_STATUS_EFFECT',
        effect: { type: statusType, duration, potency }
      };
      templateKey = `APPLY_STATUS_${statusType}`;
      effectDescParams = { dur: duration, pot: Math.abs(potency) };
      break;
    // NEW EFFECTS
    case 'CLEANSE':
      const cleanseVal = randomInt(1, 3); // 1~3개 제거 (0은 전부 제거)
      effect = { type: 'CLEANSE', value: cleanseVal };
      templateKey = 'CLEANSE';
      effectDescParams = { value: cleanseVal === 0 ? '모든' : String(cleanseVal) };
      break;
    case 'MANA_RESTORE':
      const manaVal = randomInt(1, 2);
      effect = { type: 'MANA_RESTORE', value: manaVal };
      templateKey = 'MANA_RESTORE';
      effectDescParams = { value: manaVal };
      break;
    case 'GUARD_BREAK':
    default:
      const guardBreakVal = randomInt(10, 25);
      effect = { type: 'GUARD_BREAK', value: guardBreakVal };
      templateKey = 'GUARD_BREAK';
      effectDescParams = { value: guardBreakVal };
      break;
  }
  
  // 템플릿 선택
  const templates = ACTIVE_SKILL_TEMPLATES[templateKey];
  const template = templates ? randomPick(templates) : ACTIVE_SKILL_TEMPLATES['GAIN_GUARD'][0];
  
  const name = isKo ? template.nameKo : template.nameEn;
  let effectDescription = isKo ? template.effectDescKo : template.effectDescEn;
  
  // effectDescription 파라미터 치환
  for (const [key, val] of Object.entries(effectDescParams)) {
    effectDescription = effectDescription.replace(`{${key}}`, String(val));
  }
  
  // 스킬 설명 생성 (조건 포함)
  let conditionDesc = '';
  if (condition) {
    conditionDesc = getSkillConditionDescription(condition, isKo);
  }
  
  const description = isKo
    ? `마나를 소모하여 ${effectDescription.toLowerCase()}합니다.${conditionDesc ? ` (${conditionDesc})` : ''}`
    : `Consumes mana to ${effectDescription.toLowerCase()}.${conditionDesc ? ` (${conditionDesc})` : ''}`;
  
  return {
    name,
    description,
    effectDescription,
    effect,
    activation: { timing, condition }
  };
}

// 스킬 조건 설명 헬퍼
function getSkillConditionDescription(condition: SpecialSkill['activation']['condition'], isKo: boolean): string {
  if (!condition) return '';
  
  const threshold = condition.threshold;
  const thresholdPercent = typeof threshold === 'number' && threshold <= 1 ? Math.round(threshold * 100) : threshold;
  
  if (isKo) {
    switch (condition.type) {
      case 'HP_BELOW_THRESHOLD': return `HP ${thresholdPercent}% 이하 시`;
      case 'MANA_ABOVE_THRESHOLD': return `마나 ${threshold}+ 시`;
      case 'MANA_BELOW_THRESHOLD': return `마나 ${threshold} 이하 시`;
      case 'SELF_HAS_STATUS_EFFECT': return condition.statusType ? `${condition.statusType} 상태 시` : `상태이상 시`;
      default: return '';
    }
  } else {
    switch (condition.type) {
      case 'HP_BELOW_THRESHOLD': return `HP ≤${thresholdPercent}%`;
      case 'MANA_ABOVE_THRESHOLD': return `Mana ≥${threshold}`;
      case 'MANA_BELOW_THRESHOLD': return `Mana ≤${threshold}`;
      case 'SELF_HAS_STATUS_EFFECT': return condition.statusType ? `When ${condition.statusType}` : `Under status`;
      default: return '';
    }
  }
}

/**
 * 공명 패시브 1개 생성
 */
export function generateResonancePassive(language: 'ko' | 'en'): ResonancePassive {
  const isKo = language === 'ko';
  
  const effectType = Math.random() < 0.5 ? 'START_OF_BATTLE_GUARD' : 'BATTLE_START_MANA';
  const value = effectType === 'START_OF_BATTLE_GUARD' ? randomInt(8, 15) : randomInt(1, 2);
  
  const template = randomPick(RESONANCE_TEMPLATES[effectType]);
  
  return {
    name: isKo ? template.nameKo : template.nameEn,
    description: (isKo ? template.descKo : template.descEn).replace('{value}', String(value)),
    effect: { type: effectType as any, value }
  };
}

/**
 * 전투 대사 생성
 */
export function generateCombatLines(language: 'ko' | 'en'): { onAttackHit: string[]; onDodge: string[]; onVictory: string[] } {
  const isKo = language === 'ko';
  
  const ATTACK_HIT_KO = ["받아라!", "이건 어때!", "끝이다!", "명중!", "거기다!", "피할 수 없다!"];
  const ATTACK_HIT_EN = ["Take this!", "How's this!", "It's over!", "Got you!", "There!", "No escape!"];
  
  const DODGE_KO = ["빗나갔군.", "너무 느려.", "그게 다야?", "읽었다.", "예상대로.", "헛수고다."];
  const DODGE_EN = ["Missed.", "Too slow.", "Is that all?", "Saw it coming.", "As expected.", "Nice try."];
  
  const VICTORY_KO = ["승리다.", "좋은 싸움이었다.", "내가 이겼다.", "이번엔 내 승리.", "끝났군."];
  const VICTORY_EN = ["Victory.", "Good fight.", "I win.", "My victory.", "It's over."];
  
  return {
    onAttackHit: (isKo ? ATTACK_HIT_KO : ATTACK_HIT_EN).sort(() => Math.random() - 0.5).slice(0, 3),
    onDodge: (isKo ? DODGE_KO : DODGE_EN).sort(() => Math.random() - 0.5).slice(0, 2),
    onVictory: (isKo ? VICTORY_KO : VICTORY_EN).sort(() => Math.random() - 0.5).slice(0, 1)
  };
}

/**
 * 모든 능력 한번에 생성 (캐릭터 생성 시 사용)
 */
export function generateAllAbilities(language: 'ko' | 'en') {
  return {
    traits: generateTraits(language),
    passiveSkill: generatePassiveSkill(language),
    specialSkill: generateSpecialSkill(language),
    resonancePassive: generateResonancePassive(language),
    combatLines: generateCombatLines(language),
  };
}
