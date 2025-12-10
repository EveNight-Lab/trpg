/**
 * Ability Generator - AI 없이 특성/스킬을 로직으로 생성
 */

import { 
  Trait, PassiveSkill, SpecialSkill, ResonancePassive,
  StatName, StatGrade, StatusEffectType,
  TraitConditionType, SkillConditionType
} from '../types';

// ==================== UTILITIES ====================

const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (options: number[]): number => randomPick(options);

const ALL_STATS: StatName[] = ['Vitality', 'Attack', 'Defense', 'Speed', 'Precision', 'Agility', 'Mana'];
const ALL_STATUS_EFFECTS: StatusEffectType[] = ['POISON', 'STUN', 'BURN', 'SLOW', 'VULNERABLE', 'BLIND'];

// ==================== TRAIT TEMPLATES ====================

interface TraitTemplate {
  nameKo: string;
  nameEn: string;
  descPatternKo: string;
  descPatternEn: string;
}

// 능력치별 이름 풀 (올리는 능력치 기준)
const TRAIT_NAMES: Record<StatName, TraitTemplate[]> = {
  Vitality: [
    { nameKo: "거인의 혈맥", nameEn: "Giant's Bloodline", descPatternKo: "거인의 피가 흐르며 {up}, 대신 {down}.", descPatternEn: "Giant blood flows through veins, granting {up}, but {down}." },
    { nameKo: "불굴의 생명력", nameEn: "Unyielding Vitality", descPatternKo: "끈질긴 생명력으로 {up}, 하지만 {down}.", descPatternEn: "Tenacious life force grants {up}, however {down}." },
    { nameKo: "강철 체질", nameEn: "Iron Constitution", descPatternKo: "강철 같은 체질이 {up}, 그 대가로 {down}.", descPatternEn: "An iron constitution provides {up}, at the cost of {down}." },
    { nameKo: "야수의 심장", nameEn: "Beast's Heart", descPatternKo: "야생 동물의 심장이 {up}, 반면 {down}.", descPatternEn: "A beast's heart grants {up}, while {down}." },
  ],
  Attack: [
    { nameKo: "파괴의 본능", nameEn: "Destructive Instinct", descPatternKo: "파괴적 본능으로 {up}, 그러나 {down}.", descPatternEn: "Destructive instincts grant {up}, but {down}." },
    { nameKo: "맹렬한 일격", nameEn: "Fierce Strike", descPatternKo: "맹렬한 공격으로 {up}, 대신 {down}.", descPatternEn: "Fierce attacks provide {up}, however {down}." },
    { nameKo: "광전사의 분노", nameEn: "Berserker's Fury", descPatternKo: "광전사의 분노가 {up}, 하지만 {down}.", descPatternEn: "Berserker fury grants {up}, at the cost of {down}." },
    { nameKo: "유리 대포", nameEn: "Glass Cannon", descPatternKo: "모든 것을 공격에 쏟아 {up}, 결과적으로 {down}.", descPatternEn: "Pouring everything into offense grants {up}, resulting in {down}." },
  ],
  Defense: [
    { nameKo: "철벽의 자세", nameEn: "Iron Wall Stance", descPatternKo: "철옹성 같은 자세로 {up}, 대신 {down}.", descPatternEn: "An impenetrable stance grants {up}, but {down}." },
    { nameKo: "바위 갑피", nameEn: "Stone Carapace", descPatternKo: "바위처럼 단단한 갑피가 {up}, 그러나 {down}.", descPatternEn: "A rock-hard carapace provides {up}, however {down}." },
    { nameKo: "수호자의 맹세", nameEn: "Guardian's Oath", descPatternKo: "수호자의 맹세가 {up}, 반면 {down}.", descPatternEn: "A guardian's oath grants {up}, while {down}." },
    { nameKo: "거북 전법", nameEn: "Turtle Tactics", descPatternKo: "거북이처럼 방어에 집중하여 {up}, 결과적으로 {down}.", descPatternEn: "Focusing on defense like a turtle grants {up}, resulting in {down}." },
  ],
  Speed: [
    { nameKo: "질풍의 발", nameEn: "Windwalker", descPatternKo: "바람처럼 빠른 발놀림으로 {up}, 하지만 {down}.", descPatternEn: "Wind-like footwork grants {up}, but {down}." },
    { nameKo: "번개 반사신경", nameEn: "Lightning Reflexes", descPatternKo: "번개 같은 반사신경이 {up}, 대신 {down}.", descPatternEn: "Lightning reflexes provide {up}, however {down}." },
    { nameKo: "신속 시전", nameEn: "Swift Casting", descPatternKo: "빠른 시전 속도로 {up}, 그러나 {down}.", descPatternEn: "Rapid casting grants {up}, at the cost of {down}." },
    { nameKo: "쾌속 전투술", nameEn: "Rapid Combat", descPatternKo: "빠른 전투 스타일이 {up}, 반면 {down}.", descPatternEn: "A rapid combat style grants {up}, while {down}." },
  ],
  Precision: [
    { nameKo: "매의 눈", nameEn: "Hawk's Eye", descPatternKo: "매처럼 날카로운 눈으로 {up}, 하지만 {down}.", descPatternEn: "Hawk-like sharp eyes grant {up}, but {down}." },
    { nameKo: "침착한 조준", nameEn: "Calm Aim", descPatternKo: "침착한 조준으로 {up}, 대신 {down}.", descPatternEn: "Calm aiming provides {up}, however {down}." },
    { nameKo: "저격수의 집중", nameEn: "Sniper's Focus", descPatternKo: "저격수의 집중력이 {up}, 그러나 {down}.", descPatternEn: "A sniper's focus grants {up}, at the cost of {down}." },
    { nameKo: "완벽주의", nameEn: "Perfectionist", descPatternKo: "완벽을 추구하는 성격이 {up}, 반면 {down}.", descPatternEn: "Perfectionist nature grants {up}, while {down}." },
  ],
  Agility: [
    { nameKo: "곡예사의 몸놀림", nameEn: "Acrobat's Grace", descPatternKo: "곡예사 같은 몸놀림으로 {up}, 대신 {down}.", descPatternEn: "Acrobatic grace grants {up}, but {down}." },
    { nameKo: "그림자 걸음", nameEn: "Shadow Step", descPatternKo: "그림자처럼 움직여 {up}, 하지만 {down}.", descPatternEn: "Moving like a shadow grants {up}, however {down}." },
    { nameKo: "뱀의 유연함", nameEn: "Serpent's Flexibility", descPatternKo: "뱀처럼 유연한 몸이 {up}, 그러나 {down}.", descPatternEn: "Serpentine flexibility provides {up}, at the cost of {down}." },
    { nameKo: "회피 본능", nameEn: "Evasion Instinct", descPatternKo: "본능적인 회피 능력이 {up}, 반면 {down}.", descPatternEn: "Instinctive evasion grants {up}, while {down}." },
  ],
  Mana: [
    { nameKo: "비전 과부하", nameEn: "Arcane Overload", descPatternKo: "마법 에너지 과부하로 {up}, 대신 {down}.", descPatternEn: "Arcane energy overload grants {up}, but {down}." },
    { nameKo: "마력 친화", nameEn: "Mana Affinity", descPatternKo: "타고난 마력 친화력이 {up}, 하지만 {down}.", descPatternEn: "Innate mana affinity provides {up}, however {down}." },
    { nameKo: "영혼의 샘", nameEn: "Soul Wellspring", descPatternKo: "깊은 영혼의 샘이 {up}, 그러나 {down}.", descPatternEn: "A deep soul wellspring grants {up}, at the cost of {down}." },
    { nameKo: "마법 각성", nameEn: "Magical Awakening", descPatternKo: "마법적 각성이 {up}, 반면 {down}.", descPatternEn: "Magical awakening grants {up}, while {down}." },
  ],
};

const STAT_BOOST_DESC_KO: Record<StatName, string> = {
  Vitality: "강인한 생명력을 얻고",
  Attack: "강력한 공격력을 얻고",
  Defense: "견고한 방어력을 얻고",
  Speed: "빠른 속도를 얻고",
  Precision: "뛰어난 정확도를 얻고",
  Agility: "높은 민첩성을 얻고",
  Mana: "풍부한 마나를 얻고",
};

const STAT_BOOST_DESC_EN: Record<StatName, string> = {
  Vitality: "gains enhanced vitality",
  Attack: "gains powerful attack",
  Defense: "gains solid defense",
  Speed: "gains swift speed",
  Precision: "gains keen precision",
  Agility: "gains high agility",
  Mana: "gains abundant mana",
};

const STAT_PENALTY_DESC_KO: Record<StatName, string> = {
  Vitality: "생명력이 약해진다",
  Attack: "공격력이 떨어진다",
  Defense: "방어력이 낮아진다",
  Speed: "속도가 느려진다",
  Precision: "정확도가 떨어진다",
  Agility: "민첩성이 줄어든다",
  Mana: "마나가 줄어든다",
};

const STAT_PENALTY_DESC_EN: Record<StatName, string> = {
  Vitality: "vitality is weakened",
  Attack: "attack power is reduced",
  Defense: "defense is lowered",
  Speed: "speed is slowed",
  Precision: "precision is reduced",
  Agility: "agility is diminished",
  Mana: "mana is reduced",
};

// ==================== PASSIVE SKILL TEMPLATES ====================

interface PassiveTemplate {
  nameKo: string;
  nameEn: string;
}

const PASSIVE_CONDITION_NAMES: Record<TraitConditionType, PassiveTemplate[]> = {
  HP_BELOW_THRESHOLD: [
    { nameKo: "최후의 저항", nameEn: "Last Stand" },
    { nameKo: "역경의 힘", nameEn: "Adversity's Strength" },
    { nameKo: "불굴의 의지", nameEn: "Indomitable Will" },
    { nameKo: "사선에서의 각성", nameEn: "Brink Awakening" },
    { nameKo: "죽음의 문턱", nameEn: "Death's Door" },
    { nameKo: "절체절명", nameEn: "Dire Straits" },
    { nameKo: "생존 본능", nameEn: "Survival Instinct" },
  ],
  HP_ABOVE_THRESHOLD: [
    { nameKo: "완전한 집중", nameEn: "Perfect Focus" },
    { nameKo: "건강한 활력", nameEn: "Healthy Vigor" },
    { nameKo: "전성기의 힘", nameEn: "Prime Power" },
    { nameKo: "만전의 자세", nameEn: "Peak Condition" },
    { nameKo: "충만한 자신감", nameEn: "Full Confidence" },
    { nameKo: "압도적 기세", nameEn: "Overwhelming Presence" },
  ],
  ENEMY_HP_BELOW_THRESHOLD: [
    { nameKo: "마무리 일격", nameEn: "Finishing Blow" },
    { nameKo: "포식자의 본능", nameEn: "Predator's Instinct" },
    { nameKo: "약점 간파", nameEn: "Weakness Exploit" },
    { nameKo: "사냥꾼의 감각", nameEn: "Hunter's Sense" },
    { nameKo: "피 냄새", nameEn: "Blood Scent" },
    { nameKo: "최후의 일격", nameEn: "Coup de Grace" },
    { nameKo: "사냥 본능", nameEn: "Hunting Instinct" },
  ],
  ENEMY_HP_ABOVE_THRESHOLD: [
    { nameKo: "도전자의 기백", nameEn: "Challenger's Spirit" },
    { nameKo: "강적 앞의 집중", nameEn: "Focus vs Strong" },
    { nameKo: "거인 사냥꾼", nameEn: "Giant Slayer" },
    { nameKo: "언더독", nameEn: "Underdog" },
    { nameKo: "불굴의 투지", nameEn: "Unyielding Spirit" },
  ],
  ENEMY_HAS_STATUS_EFFECT: [
    { nameKo: "약점 공략", nameEn: "Exploit Weakness" },
    { nameKo: "기회주의자", nameEn: "Opportunist" },
    { nameKo: "잔인한 일격", nameEn: "Cruel Strike" },
    { nameKo: "고통 증폭", nameEn: "Pain Amplifier" },
    { nameKo: "학대자", nameEn: "Tormentor" },
    { nameKo: "무자비", nameEn: "Merciless" },
  ],
  SELF_HAS_STATUS_EFFECT: [
    { nameKo: "고통의 힘", nameEn: "Strength from Pain" },
    { nameKo: "역경 극복", nameEn: "Overcome Adversity" },
    { nameKo: "고통 전환", nameEn: "Pain Conversion" },
    { nameKo: "분노의 화신", nameEn: "Avatar of Rage" },
    { nameKo: "역경 속의 성장", nameEn: "Growth in Adversity" },
  ],
  MANA_ABOVE_THRESHOLD: [
    { nameKo: "마력 충만", nameEn: "Mana Surge" },
    { nameKo: "비전의 힘", nameEn: "Arcane Might" },
    { nameKo: "에너지 과잉", nameEn: "Energy Overflow" },
    { nameKo: "마력 폭발", nameEn: "Mana Explosion" },
    { nameKo: "충전 완료", nameEn: "Fully Charged" },
    { nameKo: "마법 포화", nameEn: "Magic Saturation" },
  ],
  MANA_BELOW_THRESHOLD: [
    { nameKo: "절박한 시전", nameEn: "Desperate Casting" },
    { nameKo: "마지막 주문", nameEn: "Final Spell" },
    { nameKo: "잔존 마력", nameEn: "Residual Mana" },
    { nameKo: "공허한 힘", nameEn: "Void Power" },
    { nameKo: "극한의 집중", nameEn: "Extreme Focus" },
  ],
  ALWAYS_ACTIVE: [
    { nameKo: "타고난 재능", nameEn: "Natural Talent" },
    { nameKo: "선천적 능력", nameEn: "Innate Ability" },
    { nameKo: "본능의 힘", nameEn: "Instinctive Power" },
    { nameKo: "자연의 축복", nameEn: "Nature's Blessing" },
    { nameKo: "영혼의 가호", nameEn: "Soul's Protection" },
    { nameKo: "혈통의 힘", nameEn: "Bloodline Power" },
    { nameKo: "내면의 힘", nameEn: "Inner Strength" },
  ],
};

const PASSIVE_EFFECT_NAMES_STATUS: Record<StatusEffectType, PassiveTemplate[]> = {
  POISON: [
    { nameKo: "독의 손길", nameEn: "Venomous Touch" },
    { nameKo: "맹독 주입", nameEn: "Venom Injection" },
    { nameKo: "독사의 송곳니", nameEn: "Viper's Fang" },
    { nameKo: "부식의 손길", nameEn: "Corrosive Touch" },
  ],
  STUN: [
    { nameKo: "충격파", nameEn: "Shockwave" },
    { nameKo: "마비 일격", nameEn: "Paralyzing Strike" },
    { nameKo: "천둥의 일격", nameEn: "Thunder Strike" },
    { nameKo: "기절 타격", nameEn: "Stunning Impact" },
  ],
  BURN: [
    { nameKo: "불꽃 접촉", nameEn: "Flame Touch" },
    { nameKo: "작열", nameEn: "Scorching" },
    { nameKo: "업화의 손길", nameEn: "Hellfire Touch" },
    { nameKo: "점화", nameEn: "Ignition" },
  ],
  SLOW: [
    { nameKo: "빙결 접촉", nameEn: "Freezing Touch" },
    { nameKo: "속박", nameEn: "Binding" },
    { nameKo: "냉기의 손길", nameEn: "Frost Touch" },
    { nameKo: "정체의 저주", nameEn: "Curse of Stagnation" },
  ],
  VULNERABLE: [
    { nameKo: "갑옷 파괴", nameEn: "Armor Break" },
    { nameKo: "약점 노출", nameEn: "Expose Weakness" },
    { nameKo: "방어 무력화", nameEn: "Defense Nullifier" },
    { nameKo: "균열 일격", nameEn: "Fracturing Strike" },
  ],
  BLIND: [
    { nameKo: "눈부신 일격", nameEn: "Blinding Strike" },
    { nameKo: "시야 차단", nameEn: "Vision Block" },
    { nameKo: "섬광 공격", nameEn: "Flash Attack" },
    { nameKo: "안개의 손길", nameEn: "Mist Touch" },
  ],
};

// ==================== ACTIVE SKILL TEMPLATES ====================

interface ActiveTemplate {
  nameKo: string;
  nameEn: string;
  effectDescKo: string;
  effectDescEn: string;
}

const ACTIVE_SKILL_TEMPLATES: Record<string, ActiveTemplate[]> = {
  ACCURACY_BOOST: [
    { nameKo: "집중 조준", nameEn: "Focused Aim", effectDescKo: "정확도 +{value} 등급", effectDescEn: "+{value} Precision grade" },
    { nameKo: "매의 눈", nameEn: "Hawk Eye", effectDescKo: "정확도 +{value} 등급", effectDescEn: "+{value} Precision grade" },
    { nameKo: "정밀 타격", nameEn: "Precision Strike", effectDescKo: "정확도 +{value} 등급", effectDescEn: "+{value} Precision grade" },
    { nameKo: "필중", nameEn: "Sure Shot", effectDescKo: "정확도 +{value} 등급", effectDescEn: "+{value} Precision grade" },
    { nameKo: "저격수의 눈", nameEn: "Sniper's Eye", effectDescKo: "정확도 +{value} 등급", effectDescEn: "+{value} Precision grade" },
  ],
  DAMAGE_BOOST: [
    { nameKo: "파괴적 일격", nameEn: "Devastating Strike", effectDescKo: "공격력 +{value} 등급", effectDescEn: "+{value} Attack grade" },
    { nameKo: "분노의 힘", nameEn: "Fury's Might", effectDescKo: "공격력 +{value} 등급", effectDescEn: "+{value} Attack grade" },
    { nameKo: "강타", nameEn: "Heavy Blow", effectDescKo: "공격력 +{value} 등급", effectDescEn: "+{value} Attack grade" },
    { nameKo: "폭발적 힘", nameEn: "Explosive Power", effectDescKo: "공격력 +{value} 등급", effectDescEn: "+{value} Attack grade" },
    { nameKo: "분쇄", nameEn: "Crush", effectDescKo: "공격력 +{value} 등급", effectDescEn: "+{value} Attack grade" },
    { nameKo: "광전사의 분노", nameEn: "Berserker's Rage", effectDescKo: "공격력 +{value} 등급", effectDescEn: "+{value} Attack grade" },
  ],
  HEAL: [
    { nameKo: "재생의 바람", nameEn: "Regenerating Wind", effectDescKo: "{value}등급 회복", effectDescEn: "{value} grade heal" },
    { nameKo: "치유의 빛", nameEn: "Healing Light", effectDescKo: "{value}등급 회복", effectDescEn: "{value} grade heal" },
    { nameKo: "생명의 숨결", nameEn: "Breath of Life", effectDescKo: "{value}등급 회복", effectDescEn: "{value} grade heal" },
    { nameKo: "자연의 치유", nameEn: "Nature's Healing", effectDescKo: "{value}등급 회복", effectDescEn: "{value} grade heal" },
    { nameKo: "회복 주문", nameEn: "Restoration Spell", effectDescKo: "{value}등급 회복", effectDescEn: "{value} grade heal" },
    { nameKo: "생명력 집중", nameEn: "Vital Focus", effectDescKo: "{value}등급 회복", effectDescEn: "{value} grade heal" },
  ],
  VAMPIRIC_STRIKE: [
    { nameKo: "흡혈 일격", nameEn: "Vampiric Strike", effectDescKo: "피해량의 {value}% 흡수", effectDescEn: "Absorb {value}% of damage" },
    { nameKo: "생명력 흡수", nameEn: "Life Drain", effectDescKo: "피해량의 {value}% 흡수", effectDescEn: "Absorb {value}% of damage" },
    { nameKo: "영혼 흡수", nameEn: "Soul Siphon", effectDescKo: "피해량의 {value}% 흡수", effectDescEn: "Absorb {value}% of damage" },
    { nameKo: "피의 갈증", nameEn: "Blood Thirst", effectDescKo: "피해량의 {value}% 흡수", effectDescEn: "Absorb {value}% of damage" },
    { nameKo: "생명 착취", nameEn: "Life Leech", effectDescKo: "피해량의 {value}% 흡수", effectDescEn: "Absorb {value}% of damage" },
  ],
  MANA_SIPHON: [
    { nameKo: "마나 약탈", nameEn: "Mana Siphon", effectDescKo: "마나 {value} 흡수", effectDescEn: "Drain {value} mana" },
    { nameKo: "비전 흡수", nameEn: "Arcane Drain", effectDescKo: "마나 {value} 흡수", effectDescEn: "Drain {value} mana" },
    { nameKo: "마력 흡수", nameEn: "Magic Absorption", effectDescKo: "마나 {value} 흡수", effectDescEn: "Drain {value} mana" },
    { nameKo: "정신 침식", nameEn: "Mind Erosion", effectDescKo: "마나 {value} 흡수", effectDescEn: "Drain {value} mana" },
  ],
  GAIN_GUARD: [
    { nameKo: "방어 태세", nameEn: "Defensive Stance", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
    { nameKo: "보호막 생성", nameEn: "Shield Generation", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
    { nameKo: "철벽 방어", nameEn: "Iron Defense", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
    { nameKo: "마법 방벽", nameEn: "Magic Barrier", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
    { nameKo: "수호의 결계", nameEn: "Guardian Ward", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
    { nameKo: "강철 의지", nameEn: "Iron Will", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
    { nameKo: "불굴의 방패", nameEn: "Unyielding Shield", effectDescKo: "가드 {value} 획득", effectDescEn: "Gain {value} Guard" },
  ],
  APPLY_STATUS_POISON: [
    { nameKo: "독사 일격", nameEn: "Viper Strike", effectDescKo: "독 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Poison ({dur}t, {pot}dmg)" },
    { nameKo: "맹독 주입", nameEn: "Venom Injection", effectDescKo: "독 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Poison ({dur}t, {pot}dmg)" },
    { nameKo: "독의 칼날", nameEn: "Venomous Blade", effectDescKo: "독 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Poison ({dur}t, {pot}dmg)" },
    { nameKo: "부식의 일격", nameEn: "Corrosive Strike", effectDescKo: "독 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Poison ({dur}t, {pot}dmg)" },
  ],
  APPLY_STATUS_BURN: [
    { nameKo: "업화", nameEn: "Inferno", effectDescKo: "화상 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Burn ({dur}t, {pot}dmg)" },
    { nameKo: "불꽃 점화", nameEn: "Ignite", effectDescKo: "화상 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Burn ({dur}t, {pot}dmg)" },
    { nameKo: "화염 일격", nameEn: "Flame Strike", effectDescKo: "화상 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Burn ({dur}t, {pot}dmg)" },
    { nameKo: "불의 숨결", nameEn: "Fire Breath", effectDescKo: "화상 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Burn ({dur}t, {pot}dmg)" },
    { nameKo: "지옥불", nameEn: "Hellfire", effectDescKo: "화상 부여 ({dur}턴, {pot}피해)", effectDescEn: "Apply Burn ({dur}t, {pot}dmg)" },
  ],
  APPLY_STATUS_STUN: [
    { nameKo: "기절 타격", nameEn: "Stunning Blow", effectDescKo: "기절 부여 ({dur}턴)", effectDescEn: "Apply Stun ({dur}t)" },
    { nameKo: "충격파", nameEn: "Shockwave", effectDescKo: "기절 부여 ({dur}턴)", effectDescEn: "Apply Stun ({dur}t)" },
    { nameKo: "낙뢰", nameEn: "Thunderbolt", effectDescKo: "기절 부여 ({dur}턴)", effectDescEn: "Apply Stun ({dur}t)" },
    { nameKo: "두개골 강타", nameEn: "Skull Bash", effectDescKo: "기절 부여 ({dur}턴)", effectDescEn: "Apply Stun ({dur}t)" },
    { nameKo: "마비의 손길", nameEn: "Paralyzing Touch", effectDescKo: "기절 부여 ({dur}턴)", effectDescEn: "Apply Stun ({dur}t)" },
  ],
  APPLY_STATUS_SLOW: [
    { nameKo: "빙결", nameEn: "Freeze", effectDescKo: "둔화 부여 ({dur}턴, 속도-{pot})", effectDescEn: "Apply Slow ({dur}t, Speed-{pot})" },
    { nameKo: "냉기 폭발", nameEn: "Frost Blast", effectDescKo: "둔화 부여 ({dur}턴, 속도-{pot})", effectDescEn: "Apply Slow ({dur}t, Speed-{pot})" },
    { nameKo: "얼음 창", nameEn: "Ice Spear", effectDescKo: "둔화 부여 ({dur}턴, 속도-{pot})", effectDescEn: "Apply Slow ({dur}t, Speed-{pot})" },
    { nameKo: "동결의 손길", nameEn: "Freezing Grasp", effectDescKo: "둔화 부여 ({dur}턴, 속도-{pot})", effectDescEn: "Apply Slow ({dur}t, Speed-{pot})" },
    { nameKo: "서리 사슬", nameEn: "Frost Chains", effectDescKo: "둔화 부여 ({dur}턴, 속도-{pot})", effectDescEn: "Apply Slow ({dur}t, Speed-{pot})" },
  ],
  APPLY_STATUS_VULNERABLE: [
    { nameKo: "갑옷 파괴", nameEn: "Armor Break", effectDescKo: "취약 부여 ({dur}턴, 방어-{pot})", effectDescEn: "Apply Vulnerable ({dur}t, Def-{pot})" },
    { nameKo: "약점 노출", nameEn: "Expose", effectDescKo: "취약 부여 ({dur}턴, 방어-{pot})", effectDescEn: "Apply Vulnerable ({dur}t, Def-{pot})" },
    { nameKo: "방어 붕괴", nameEn: "Defense Crush", effectDescKo: "취약 부여 ({dur}턴, 방어-{pot})", effectDescEn: "Apply Vulnerable ({dur}t, Def-{pot})" },
    { nameKo: "균열 일격", nameEn: "Shattering Strike", effectDescKo: "취약 부여 ({dur}턴, 방어-{pot})", effectDescEn: "Apply Vulnerable ({dur}t, Def-{pot})" },
    { nameKo: "약화의 저주", nameEn: "Curse of Weakness", effectDescKo: "취약 부여 ({dur}턴, 방어-{pot})", effectDescEn: "Apply Vulnerable ({dur}t, Def-{pot})" },
  ],
  APPLY_STATUS_BLIND: [
    { nameKo: "눈멀게 하기", nameEn: "Blinding Flash", effectDescKo: "실명 부여 ({dur}턴, 정확-{pot})", effectDescEn: "Apply Blind ({dur}t, Prec-{pot})" },
    { nameKo: "섬광", nameEn: "Flash", effectDescKo: "실명 부여 ({dur}턴, 정확-{pot})", effectDescEn: "Apply Blind ({dur}t, Prec-{pot})" },
    { nameKo: "암흑 베일", nameEn: "Dark Veil", effectDescKo: "실명 부여 ({dur}턴, 정확-{pot})", effectDescEn: "Apply Blind ({dur}t, Prec-{pot})" },
    { nameKo: "모래 뿌리기", nameEn: "Sand Throw", effectDescKo: "실명 부여 ({dur}턴, 정확-{pot})", effectDescEn: "Apply Blind ({dur}t, Prec-{pot})" },
    { nameKo: "환영의 안개", nameEn: "Phantom Mist", effectDescKo: "실명 부여 ({dur}턴, 정확-{pot})", effectDescEn: "Apply Blind ({dur}t, Prec-{pot})" },
  ],
  // NEW EFFECTS
  CLEANSE: [
    { nameKo: "정화", nameEn: "Purify", effectDescKo: "상태이상 {value}개 제거", effectDescEn: "Remove {value} status effect(s)" },
    { nameKo: "해독", nameEn: "Cleanse", effectDescKo: "상태이상 {value}개 제거", effectDescEn: "Remove {value} status effect(s)" },
    { nameKo: "정신 정화", nameEn: "Mind Purge", effectDescKo: "상태이상 {value}개 제거", effectDescEn: "Remove {value} status effect(s)" },
    { nameKo: "축복의 빛", nameEn: "Blessed Light", effectDescKo: "상태이상 {value}개 제거", effectDescEn: "Remove {value} status effect(s)" },
  ],
  MANA_RESTORE: [
    { nameKo: "마나 충전", nameEn: "Mana Charge", effectDescKo: "마나 {value} 회복", effectDescEn: "Restore {value} mana" },
    { nameKo: "집중", nameEn: "Focus", effectDescKo: "마나 {value} 회복", effectDescEn: "Restore {value} mana" },
    { nameKo: "명상", nameEn: "Meditate", effectDescKo: "마나 {value} 회복", effectDescEn: "Restore {value} mana" },
    { nameKo: "영적 재충전", nameEn: "Spiritual Recharge", effectDescKo: "마나 {value} 회복", effectDescEn: "Restore {value} mana" },
  ],
  GUARD_BREAK: [
    { nameKo: "방패 파쇄", nameEn: "Shield Shatter", effectDescKo: "적 가드 {value} 파괴", effectDescEn: "Destroy {value} enemy guard" },
    { nameKo: "관통 일격", nameEn: "Piercing Strike", effectDescKo: "적 가드 {value} 파괴", effectDescEn: "Destroy {value} enemy guard" },
    { nameKo: "분쇄 타격", nameEn: "Crushing Blow", effectDescKo: "적 가드 {value} 파괴", effectDescEn: "Destroy {value} enemy guard" },
    { nameKo: "방어 무력화", nameEn: "Nullify Defense", effectDescKo: "적 가드 {value} 파괴", effectDescEn: "Destroy {value} enemy guard" },
  ],
};

// ==================== RESONANCE PASSIVE TEMPLATES ====================

const RESONANCE_TEMPLATES: Record<string, { nameKo: string; nameEn: string; descKo: string; descEn: string }[]> = {
  START_OF_BATTLE_GUARD: [
    { nameKo: "창조주의 가호", nameEn: "Creator's Blessing", descKo: "전투 시작 시 가드 {value}를 얻습니다.", descEn: "Gain {value} Guard at battle start." },
    { nameKo: "수호의 유대", nameEn: "Bond of Protection", descKo: "창조주와의 유대가 가드 {value}를 부여합니다.", descEn: "Bond with creator grants {value} Guard." },
  ],
  BATTLE_START_MANA: [
    { nameKo: "비전의 연결", nameEn: "Arcane Connection", descKo: "전투 시작 시 마나 {value}를 얻습니다.", descEn: "Gain {value} Mana at battle start." },
    { nameKo: "마력의 유대", nameEn: "Mana Bond", descKo: "창조주와의 유대가 마나 {value}를 부여합니다.", descEn: "Bond with creator grants {value} Mana." },
  ],
};

// ==================== GENERATORS ====================

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

// ==================== NARRATIVE TEMPLATES (서사 생성) ====================

interface NarrativeInput {
  name?: string;
  race?: string;
  backstory?: string;
  appearance?: string;
  combatStyle?: string;
  personality?: string;
}

const RACE_POOL_KO = ['인간', '엘프', '드워프', '하프링', '오크', '티플링', '드래곤본', '노움'];
const RACE_POOL_EN = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome'];

const NAME_PREFIXES_KO = ['용맹한', '그림자', '은빛', '붉은', '검은', '푸른', '황금', '철의', '폭풍의', '달빛'];
const NAME_SUFFIXES_KO = ['카엘', '리온', '아란', '세르', '드락', '미라', '엘라', '쏜', '레이', '벡스'];
const NAME_PREFIXES_EN = ['Brave', 'Shadow', 'Silver', 'Red', 'Black', 'Blue', 'Golden', 'Iron', 'Storm', 'Moon'];
const NAME_SUFFIXES_EN = ['kael', 'rion', 'aran', 'ser', 'drak', 'mira', 'ella', 'thorn', 'ray', 'vex'];

const BACKSTORY_TEMPLATES_KO = [
  "{name}은(는) {origin}에서 태어나 {event}를 겪은 후, {goal}을(를) 위해 모험을 떠났습니다.",
  "어린 시절 {event}를 목격한 {name}은(는) {goal}을(를) 맹세하고 {origin}을(를) 떠났습니다.",
  "{origin} 출신의 {name}은(는) {event} 이후 삶의 의미를 찾아 방랑하게 되었습니다.",
];

const BACKSTORY_TEMPLATES_EN = [
  "{name} was born in {origin} and after {event}, set out on an adventure to {goal}.",
  "After witnessing {event} as a child, {name} swore to {goal} and left {origin}.",
  "Hailing from {origin}, {name} began wandering in search of meaning after {event}.",
];

const ORIGINS_KO = ['작은 마을', '번화한 도시', '깊은 숲', '산악 요새', '해안 마을', '사막 오아시스', '지하 동굴'];
const ORIGINS_EN = ['a small village', 'a bustling city', 'the deep forest', 'a mountain fortress', 'a coastal town', 'a desert oasis', 'underground caverns'];

const EVENTS_KO = ['가족을 잃는 비극', '신비로운 힘의 각성', '배신당한 경험', '전쟁의 참화', '스승과의 만남', '저주에 걸림'];
const EVENTS_EN = ['losing their family', 'awakening mysterious powers', 'being betrayed', 'the horrors of war', 'meeting a mentor', 'being cursed'];

const GOALS_KO = ['진정한 힘을 찾기', '잃어버린 것을 되찾기', '세상을 구하기', '복수를 완수하기', '자신의 운명을 알기', '평화를 가져오기'];
const GOALS_EN = ['find true power', 'reclaim what was lost', 'save the world', 'complete their revenge', 'discover their destiny', 'bring peace'];

const APPEARANCE_TEMPLATES_KO = [
  "{height}의 {build} 체형으로, {feature1}과(와) {feature2}가 특징입니다.",
  "{build} 체형에 {feature1}를 가진 {height}. {feature2}가 인상적입니다.",
];

const APPEARANCE_TEMPLATES_EN = [
  "A {height} figure with a {build} build, notable for {feature1} and {feature2}.",
  "{height} with a {build} frame, bearing {feature1}. {feature2} stands out.",
];

const HEIGHTS_KO = ['장신', '평균 키', '단신', '거구', '날씬한 체구'];
const HEIGHTS_EN = ['tall', 'average height', 'short', 'imposing', 'slender'];

const BUILDS_KO = ['근육질', '날렵한', '건장한', '호리호리한', '다부진'];
const BUILDS_EN = ['muscular', 'agile', 'sturdy', 'lean', 'compact'];

const FEATURES_KO = ['날카로운 눈매', '흉터 자국', '특이한 문신', '은빛 머리카락', '붉은 눈동자', '뾰족한 귀', '두꺼운 갑옷', '낡은 망토'];
const FEATURES_EN = ['sharp eyes', 'scarred features', 'unusual tattoos', 'silver hair', 'red eyes', 'pointed ears', 'heavy armor', 'a worn cloak'];

const COMBAT_STYLES_KO = [
  "주로 {weapon}을(를) 사용하며, {tactic} 전술을 선호합니다.",
  "{tactic}에 능하며, {weapon}을(를) 자유자재로 다룹니다.",
];

const COMBAT_STYLES_EN = [
  "Primarily wields {weapon}, preferring {tactic} tactics.",
  "Excels at {tactic}, handling {weapon} with mastery.",
];

const WEAPONS_KO = ['장검', '쌍검', '대검', '활', '지팡이', '도끼', '창', '단검', '마법'];
const WEAPONS_EN = ['a longsword', 'dual blades', 'a greatsword', 'a bow', 'a staff', 'an axe', 'a spear', 'daggers', 'magic'];

const TACTICS_KO = ['정면 돌파', '기습과 암살', '원거리 저격', '방어와 반격', '마법 공세', '교란과 혼란'];
const TACTICS_EN = ['frontal assault', 'ambush and assassination', 'ranged sniping', 'defense and counter', 'magical offense', 'disruption and chaos'];

const PERSONALITIES_KO = [
  "{trait1}하지만 {trait2}한 면도 있습니다. {quirk}",
  "{trait1}한 성격으로, 종종 {quirk} {trait2}한 모습을 보이기도 합니다.",
];

const PERSONALITIES_EN = [
  "Generally {trait1}, but also has a {trait2} side. {quirk}",
  "Known for being {trait1}, though often shows {trait2} tendencies. {quirk}",
];

const TRAITS1_KO = ['냉철', '정의로운', '호탕', '신중', '호기심 많은', '과묵'];
const TRAITS1_EN = ['calm and calculated', 'righteous', 'boisterous', 'cautious', 'curious', 'taciturn'];

const TRAITS2_KO = ['따뜻', '잔인', '유머러스', '감성적', '무모', '충성스러운'];
const TRAITS2_EN = ['warm', 'ruthless', 'humorous', 'emotional', 'reckless', 'loyal'];

const QUIRKS_KO = ['독특한 취미가 있으며,', '과거에 대해 말하기 꺼리며,', '동료에게는 다정하며,', '약자를 보면 못 지나치며,'];
const QUIRKS_EN = ['Has an unusual hobby.', 'Reluctant to speak of the past.', 'Gentle with companions.', 'Cannot ignore the weak.'];

const ANECDOTE_TEMPLATES_KO = [
  "한 번은 {situation}에서 {action}하여 {result}한 적이 있습니다.",
  "{situation} 때, {name}은(는) {action}했습니다. {result}",
];

const ANECDOTE_TEMPLATES_EN = [
  "Once, in {situation}, they {action}, resulting in {result}.",
  "During {situation}, {name} {action}. {result}",
];

const SITUATIONS_KO = ['위기 상황', '술집에서의 시비', '몬스터와의 조우', '마을 축제', '험난한 여정 중'];
const SITUATIONS_EN = ['a crisis', 'a tavern brawl', 'an encounter with monsters', 'a village festival', 'a perilous journey'];

const ACTIONS_KO = ['혼자서 맞서', '기지를 발휘해', '동료를 구하기 위해 뛰어들어', '예상치 못한 행동으로'];
const ACTIONS_EN = ['stood alone against the threat', 'used quick thinking', 'dove in to save a companion', 'acted unexpectedly'];

const RESULTS_KO = ['모두를 놀라게 했습니다', '전설이 되었습니다', '깊은 인상을 남겼습니다', '큰 교훈을 얻었습니다'];
const RESULTS_EN = ['surprising everyone', 'becoming a legend', 'leaving a lasting impression', 'learning a valuable lesson'];

const ANECDOTE_TITLES_KO = ['그날의 기억', '전해지는 이야기', '잊지 못할 순간', '숨겨진 일화', '알려지지 않은 과거'];
const ANECDOTE_TITLES_EN = ['A Memory of That Day', 'A Tale Often Told', 'An Unforgettable Moment', 'A Hidden Story', 'The Unknown Past'];

/**
 * 서사 요소 생성 (AI 없이 템플릿 기반)
 */
export function generateNarrative(input: NarrativeInput, language: 'ko' | 'en') {
  const isKo = language === 'ko';
  
  // 이름 생성
  const name = input.name || (isKo 
    ? `${randomPick(NAME_PREFIXES_KO)} ${randomPick(NAME_SUFFIXES_KO)}`
    : `${randomPick(NAME_PREFIXES_EN)}${randomPick(NAME_SUFFIXES_EN)}`
  );
  
  // 종족
  const race = input.race || randomPick(isKo ? RACE_POOL_KO : RACE_POOL_EN);
  
  // 배경 이야기
  const backstory = input.backstory || (isKo 
    ? randomPick(BACKSTORY_TEMPLATES_KO)
        .replace('{name}', name)
        .replace('{origin}', randomPick(ORIGINS_KO))
        .replace('{event}', randomPick(EVENTS_KO))
        .replace('{goal}', randomPick(GOALS_KO))
    : randomPick(BACKSTORY_TEMPLATES_EN)
        .replace('{name}', name)
        .replace('{origin}', randomPick(ORIGINS_EN))
        .replace('{event}', randomPick(EVENTS_EN))
        .replace('{goal}', randomPick(GOALS_EN))
  );
  
  // 외형
  const appearance = input.appearance || (isKo
    ? randomPick(APPEARANCE_TEMPLATES_KO)
        .replace('{height}', randomPick(HEIGHTS_KO))
        .replace('{build}', randomPick(BUILDS_KO))
        .replace('{feature1}', randomPick(FEATURES_KO))
        .replace('{feature2}', randomPick(FEATURES_KO.filter(f => f !== randomPick(FEATURES_KO))))
    : randomPick(APPEARANCE_TEMPLATES_EN)
        .replace('{height}', randomPick(HEIGHTS_EN))
        .replace('{build}', randomPick(BUILDS_EN))
        .replace('{feature1}', randomPick(FEATURES_EN))
        .replace('{feature2}', randomPick(FEATURES_EN))
  );
  
  // 전투 스타일
  const combatStyle = input.combatStyle || (isKo
    ? randomPick(COMBAT_STYLES_KO)
        .replace('{weapon}', randomPick(WEAPONS_KO))
        .replace('{tactic}', randomPick(TACTICS_KO))
    : randomPick(COMBAT_STYLES_EN)
        .replace('{weapon}', randomPick(WEAPONS_EN))
        .replace('{tactic}', randomPick(TACTICS_EN))
  );
  
  // 성격
  const personality = input.personality || (isKo
    ? randomPick(PERSONALITIES_KO)
        .replace('{trait1}', randomPick(TRAITS1_KO))
        .replace('{trait2}', randomPick(TRAITS2_KO))
        .replace('{quirk}', randomPick(QUIRKS_KO))
    : randomPick(PERSONALITIES_EN)
        .replace('{trait1}', randomPick(TRAITS1_EN))
        .replace('{trait2}', randomPick(TRAITS2_EN))
        .replace('{quirk}', randomPick(QUIRKS_EN))
  );
  
  // 성격 일화
  const personalityAnecdote = isKo
    ? randomPick(ANECDOTE_TEMPLATES_KO)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_KO))
        .replace('{action}', randomPick(ACTIONS_KO))
        .replace('{result}', randomPick(RESULTS_KO))
    : randomPick(ANECDOTE_TEMPLATES_EN)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_EN))
        .replace('{action}', randomPick(ACTIONS_EN))
        .replace('{result}', randomPick(RESULTS_EN));
  
  const personalityAnecdoteTitle = randomPick(isKo ? ANECDOTE_TITLES_KO : ANECDOTE_TITLES_EN);
  
  // 전투 일화
  const combatAnecdote = isKo
    ? randomPick(ANECDOTE_TEMPLATES_KO)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_KO))
        .replace('{action}', randomPick(ACTIONS_KO))
        .replace('{result}', randomPick(RESULTS_KO))
    : randomPick(ANECDOTE_TEMPLATES_EN)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_EN))
        .replace('{action}', randomPick(ACTIONS_EN))
        .replace('{result}', randomPick(RESULTS_EN));
  
  const combatAnecdoteTitle = randomPick(isKo ? ANECDOTE_TITLES_KO : ANECDOTE_TITLES_EN);
  
  return {
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
  };
}

/**
 * 완전한 캐릭터 생성 (AI 없이 모든 것을 로직으로)
 */
export function generateFullCharacter(input: NarrativeInput, language: 'ko' | 'en') {
  const narrative = generateNarrative(input, language);
  const abilities = generateAllAbilities(language);
  
  return {
    ...narrative,
    ...abilities,
    imageKey: '',
    image: '',
    wins: 0,
    losses: 0,
  };
}

