export interface UserCharacterInput {
  name: string;
  race: string;
  backstory: string;
  appearance: string;
  combatStyle: string;
  personality: string;
}

export type StatGrade = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
export type StatName = 'Vitality' | 'Attack' | 'Defense' | 'Speed' | 'Precision' | 'Agility' | 'Mana';

export interface CharacterStats {
  [key: string]: StatGrade;
  Vitality: StatGrade;
  Attack: StatGrade;
  Defense: StatGrade;
  Speed: StatGrade;
  Precision: StatGrade;
  Agility: StatGrade;
  Mana: StatGrade;
}

export interface BonusStats {
    Vitality?: number;
    Attack?: number;
    Defense?: number;
    Speed?: number;
    Precision?: number;

    Agility?: number;
    Mana?: number;
}


export interface AccuracyBoostEffect {
  type: 'ACCURACY_BOOST';
  value: number; // bonus value
}
export interface DamageBoostEffect {
  type: 'DAMAGE_BOOST';
  value: number; // bonus value
}
export interface HealEffect {
  type: 'HEAL';
  value: StatGrade; 
}
export interface VampiricStrikeEffect {
  type: 'VAMPIRIC_STRIKE';
  value: number; // e.g., 0.5 for 50%
}
export interface ManaSiphonEffect {
  type: 'MANA_SIPHON';
  value: number; // e.g., 1
}
export interface GainGuardEffect {
    type: 'GAIN_GUARD';
    value: number; // The amount of Guard to generate
}

// NEW EFFECTS
export interface CleanseEffect {
    type: 'CLEANSE';
    value: number; // number of status effects to remove (0 = all)
}

export interface ManaRestoreEffect {
    type: 'MANA_RESTORE';
    value: number; // amount of mana to restore
}

export interface GuardBreakEffect {
    type: 'GUARD_BREAK';
    value: number; // amount of enemy guard to destroy
}

export type StatusEffectType = 'POISON' | 'STUN' | 'BURN' | 'SLOW' | 'VULNERABLE' | 'BLIND';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // in turns
  potency: number; // e.g., 3 for a damage value, -2 for a debuff
}

export interface ApplyStatusEffect {
  type: 'APPLY_STATUS_EFFECT';
  effect: StatusEffect;
}

export type SkillEffect = AccuracyBoostEffect | DamageBoostEffect | HealEffect | VampiricStrikeEffect | ManaSiphonEffect | ApplyStatusEffect | GainGuardEffect | CleanseEffect | ManaRestoreEffect | GuardBreakEffect;

export type SkillConditionType = 
    | 'HP_BELOW_THRESHOLD' 
    | 'MANA_ABOVE_THRESHOLD' 
    | 'MANA_BELOW_THRESHOLD'
    | 'SELF_HAS_STATUS_EFFECT';

export interface SkillCondition {
    type: SkillConditionType;
    threshold?: number; // e.g., 0.5 for 50% HP, or 3 for mana count
    statusType?: StatusEffectType;
}

export interface SkillActivation {
  timing: 'ON_TURN_START' | 'AFTER_HIT_SUCCESS';
  condition?: SkillCondition;
}

export interface SpecialSkill {
  name: string;
  description: string;
  effectDescription: string; // A human-readable description of the skill's effect
  effect: SkillEffect; // A structured object for game mechanics
  activation: SkillActivation; // Defines when and how the skill can be used
}

export interface CombatLines {
  onAttackHit: string[];
  onDodge: string[];
  onVictory: string[];
}


// --- NEW ABILITY SYSTEM (GRADE-BASED) ---

// Stat Modification object used by Traits
export interface StatModification {
  stat: StatName;
  value: number; // number of grades to increase/decrease
}

// 1. Core Traits: Always-on stat trade-offs
export interface Trait {
  name: string;
  description: string;
  modifications: [StatModification, StatModification]; // Exactly one positive, one negative
}


// 2. Passive Skill: Conditional abilities
export type TraitConditionType = 
  'HP_ABOVE_THRESHOLD' | 
  'HP_BELOW_THRESHOLD' |
  'ENEMY_HP_ABOVE_THRESHOLD' |
  'ENEMY_HP_BELOW_THRESHOLD' |
  'ENEMY_HAS_STATUS_EFFECT' |
  'SELF_HAS_STATUS_EFFECT' |
  'MANA_ABOVE_THRESHOLD' |
  'MANA_BELOW_THRESHOLD' |
  'ALWAYS_ACTIVE';

export interface TraitCondition {
    type: TraitConditionType;
    threshold?: number; // e.g., 0.5 for 50% HP threshold, or 3 for mana count
    statusType?: StatusEffectType;
}

export interface StatModificationEffect {
    type: 'STAT_MODIFICATION';
    modification: StatModification;
}

export interface ApplyStatusOnHitEffect {
    type: 'APPLY_STATUS_EFFECT_ON_HIT';
    chance: number; // e.g., 0.25 for 25%
    effect: StatusEffect;
}

export type TraitEffect = StatModificationEffect | ApplyStatusOnHitEffect;

export interface PassiveSkill {
  name: string;
  description: string;
  condition: TraitCondition;
  effect: TraitEffect;
}

// 3. Resonance Passive Skill: Unique bond-based abilities
export type ResonanceEffectType = 'START_OF_BATTLE_GUARD' | 'BATTLE_START_MANA';
export interface ResonanceEffect {
    type: ResonanceEffectType;
    value: number; // e.g., amount of guard, amount of mana
}
export interface ResonancePassive {
    name: string;
    description: string;
    effect: ResonanceEffect;
}


export interface VictoryImage {
  imageKey: string; // A unique key for storing the image in IndexedDB
  image: string; // Base64 encoded image of the battle, loaded at runtime
  opponentName: string;
}

// Chat history type
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Main Character structure
export interface GeneratedCharacter {
  id: string; // Unique identifier for each character
  imageKey: string; // A unique key for storing the image in IndexedDB
  name: string;
  race: string;
  backstory: string;
  appearance: string;
  combatStyle: string;
  personality: string;
  personalityAnecdote: string;
  personalityAnecdoteTitle: string;
  combatAnecdote: string;
  combatAnecdoteTitle: string;
  traits: Trait[]; // 3 Core Traits (trade-offs) - EQUIPPED
  passiveSkill: PassiveSkill; // 1 Conditional Passive Skill - EQUIPPED
  stats: CharacterStats; // Base stats before traits (Grades)
  bonusStats: BonusStats; // For SS+ or E- modifications
  image: string; // Base64 encoded image, loaded from IndexedDB at runtime
  specialSkill: SpecialSkill; // 1 Active Skill - EQUIPPED
  combatLines: CombatLines;
  wins: number;
  losses: number;
  victoryImages: VictoryImage[];
  
  // --- ASCENSION SYSTEM FIELDS ---
  victoryPoints: number;
  unlockedTraits: Trait[];
  unlockedPassiveSkills: PassiveSkill[];
  unlockedSpecialSkills: SpecialSkill[];

  // --- RECRUITMENT & CONVERSATION SYSTEM FIELDS ---
  status: 'UNRECRUITED' | 'RECRUITED';
  cooldownUntil: number | null; // Timestamp for when the cooldown ends
  postRecruitmentChatHistory: ChatMessage[];

  // --- RESONANCE (BONDING) SYSTEM FIELDS ---
  resonanceLevel: number;
  resonanceExp: number;
  resonancePassive: ResonancePassive | null; // The EQUIPPED resonance passive
  unlockedResonancePassives: ResonancePassive[]; // Pool of available resonance passives
}

// Type used within the battle engine to track active effects
export interface ActiveStatusEffect {
    id: string;
    type: StatusEffectType;
    remainingDuration: number;
    potency: number;
}