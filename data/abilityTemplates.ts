import { StatName, StatusEffectType } from '../types';

export const ALL_STATS: StatName[] = ['Vitality', 'Attack', 'Defense', 'Speed', 'Precision', 'Agility', 'Mana'];
export const ALL_STATUS_EFFECTS: StatusEffectType[] = ['POISON', 'STUN', 'BURN', 'SLOW', 'VULNERABLE', 'BLIND'];

export interface TraitTemplate {
  nameKo: string;
  nameEn: string;
  descPatternKo: string;
  descPatternEn: string;
}

export const TRAIT_NAMES: Record<StatName, TraitTemplate[]> = {
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

export const STAT_BOOST_DESC_KO: Record<StatName, string> = {
  Vitality: "강인한 생명력을 얻고",
  Attack: "강력한 공격력을 얻고",
  Defense: "견고한 방어력을 얻고",
  Speed: "빠른 속도를 얻고",
  Precision: "뛰어난 정확도를 얻고",
  Agility: "높은 민첩성을 얻고",
  Mana: "풍부한 마나를 얻고",
};

export const STAT_BOOST_DESC_EN: Record<StatName, string> = {
  Vitality: "gains enhanced vitality",
  Attack: "gains powerful attack",
  Defense: "gains solid defense",
  Speed: "gains swift speed",
  Precision: "gains keen precision",
  Agility: "gains high agility",
  Mana: "gains abundant mana",
};

export const STAT_PENALTY_DESC_KO: Record<StatName, string> = {
  Vitality: "생명력이 약해진다",
  Attack: "공격력이 떨어진다",
  Defense: "방어력이 낮아진다",
  Speed: "속도가 느려진다",
  Precision: "정확도가 떨어진다",
  Agility: "민첩성이 줄어든다",
  Mana: "마나가 줄어든다",
};

export const STAT_PENALTY_DESC_EN: Record<StatName, string> = {
  Vitality: "vitality is weakened",
  Attack: "attack power is reduced",
  Defense: "defense is lowered",
  Speed: "speed is slowed",
  Precision: "precision is reduced",
  Agility: "agility is diminished",
  Mana: "mana is reduced",
};

export interface PassiveTemplate {
  nameKo: string;
  nameEn: string;
}

export const PASSIVE_CONDITION_NAMES: Record<string, PassiveTemplate[]> = {
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

export const PASSIVE_EFFECT_NAMES_STATUS: Record<StatusEffectType, PassiveTemplate[]> = {
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

export interface ActiveTemplate {
  nameKo: string;
  nameEn: string;
  effectDescKo: string;
  effectDescEn: string;
}

export const ACTIVE_SKILL_TEMPLATES: Record<string, ActiveTemplate[]> = {
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

export const RESONANCE_TEMPLATES: Record<string, { nameKo: string; nameEn: string; descKo: string; descEn: string }[]> = {
  START_OF_BATTLE_GUARD: [
    { nameKo: "창조주의 가호", nameEn: "Creator's Blessing", descKo: "전투 시작 시 가드 {value}를 얻습니다.", descEn: "Gain {value} Guard at battle start." },
    { nameKo: "수호의 유대", nameEn: "Bond of Protection", descKo: "창조주와의 유대가 가드 {value}를 부여합니다.", descEn: "Bond with creator grants {value} Guard." },
  ],
  BATTLE_START_MANA: [
    { nameKo: "비전의 연결", nameEn: "Arcane Connection", descKo: "전투 시작 시 마나 {value}를 얻습니다.", descEn: "Gain {value} Mana at battle start." },
    { nameKo: "마력의 유대", nameEn: "Mana Bond", descKo: "창조주와의 유대가 마나 {value}를 부여합니다.", descEn: "Bond with creator grants {value} Mana." },
  ],
};
