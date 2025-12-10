import { StatModification, GeneratedCharacter, CharacterStats, StatGrade, StatName, BonusStats, Trait } from "../types";

export const STAT_GRADES: StatGrade[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];

export const GRADE_VALUE_MAP: Record<StatName, Record<StatGrade, number>> = {
    // Rebalanced for more decisive combat. Attack > Defense. Larger gaps.
    Vitality:  { E: 20, D: 28, C: 35, B: 42, A: 50, S: 60, SS: 70 },
    Attack:    { E: 8,  D: 12, C: 17, B: 22, A: 28, S: 35, SS: 42 },
    Defense:   { E: 4,  D: 6,  C: 9,  B: 12, A: 15, S: 19, SS: 23 },
    Speed:     { E: 3,  D: 5,  C: 7,  B: 10, A: 13, S: 16, SS: 20 },
    Precision: { E: 8,  D: 12, C: 17, B: 22, A: 28, S: 35, SS: 42 },
    Agility:   { E: 4,  D: 6,  C: 9,  B: 12, A: 15, S: 19, SS: 23 },
    Mana:      { E: 1,  D: 2,  C: 3,  B: 4,  A: 5,  S: 6,  SS: 7  },
};

/**
 * Provides a consistent hex color code for a given stat grade.
 * @param grade The stat grade ('E' through 'SS').
 * @returns A hex color string.
 */
export const getGradeColorHex = (grade: StatGrade): string => {
    switch (grade) {
        case 'SS': return '#ef4444'; // Red-500
        case 'S':  return '#3b82f6'; // Blue-500
        case 'A':  return '#eab308'; // Yellow-500
        case 'B':  return '#a855f7'; // Purple-500
        case 'C':  return '#22c55e'; // Green-500
        case 'D':  return '#4f46e5'; // Indigo-600
        case 'E':  return '#6b7280'; // Gray-500
        default: return '#94a3b8'; // Slate-400
    }
};


/**
 * Converts a stat grade to its corresponding numerical value.
 * @param grade The stat grade (e.g., 'A').
 * @param bonus An optional bonus value to add to the result.
 * @returns The final numerical value.
 */
export const gradeToValue = (grade: StatGrade, bonus: number = 0, statName: StatName): number => {
    return GRADE_VALUE_MAP[statName][grade] + bonus;
};

/**
 * "Rolls" a grade, returning a random integer between 1 and the grade's value.
 * @param grade The stat grade.
 * @param bonus An optional bonus value to add to the grade's max value.
 * @returns The result of the roll.
 */
export function rollGrade(grade: StatGrade, bonus: number = 0, statName: StatName): number {
    const maxValue = gradeToValue(grade, bonus, statName);
    return Math.floor(Math.random() * maxValue) + 1;
}

/**
 * Applies a StatModification object from a trait to a character's stats and bonusStats.
 * This handles the "limit break" logic for SS and E grades.
 * @param stats The character's current base stats (grades).
 * @param bonusStats The character's current bonus stats.
 * @param mod The StatModification object.
 * @returns An object containing the new stats and bonusStats.
 */
export function applyStatModification(
  stats: CharacterStats, 
  bonusStats: BonusStats, 
  mod: StatModification
): { newStats: CharacterStats; newBonusStats: BonusStats } {
    const { stat, value } = mod;
    const currentGrade = stats[stat];
    const currentIndex = STAT_GRADES.indexOf(currentGrade);
    
    let newIndex = currentIndex + value;

    if (newIndex >= STAT_GRADES.length) {
        // Exceeded SS grade
        const bonus = newIndex - (STAT_GRADES.length - 1);
        newIndex = STAT_GRADES.length - 1;
        bonusStats[stat] = (bonusStats[stat] || 0) + bonus;
    } else if (newIndex < 0) {
        // Went below E grade
        const penalty = newIndex;
        newIndex = 0;
        bonusStats[stat] = (bonusStats[stat] || 0) + penalty;
    }

    stats[stat] = STAT_GRADES[newIndex];

    return { newStats: stats, newBonusStats: bonusStats };
}


/**
 * Calculates the final stats and bonus stats object with all permanent trait modifications applied.
 * @param baseStats The character's base stats (all 'C').
 * @param traits The array of equipped traits.
 * @returns An object with the final stats and bonusStats.
 */
export function getFinalCharacterStats(baseStats: CharacterStats, traits: Trait[]): { finalStats: CharacterStats; finalBonusStats: BonusStats } {
  let finalStats = { ...baseStats };
  let finalBonusStats: BonusStats = {};

  traits.forEach(trait => {
    trait.modifications.forEach(mod => {
      const { newStats, newBonusStats } = applyStatModification(
        { ...finalStats }, 
        { ...finalBonusStats }, 
        mod
      );
      finalStats = newStats;
      finalBonusStats = newBonusStats;
    });
  });

  return { finalStats, finalBonusStats };
}

// Keep parseDiceNotation for data migration from old format
export interface ParsedDice {
    count: number;
    sides: number;
    modifier: number;
}
export function parseDiceNotation(notation: string): ParsedDice {
    const match = notation.match(/(\d+)d(\d+)([\+\-]\d+)?/);
    if (!match) {
        return { count: 1, sides: 6, modifier: 0 };
    }
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    return { count, sides, modifier };
}