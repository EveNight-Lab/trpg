import { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import { GeneratedCharacter, ActiveStatusEffect, StatusEffectType, ApplyStatusEffect, CharacterStats, StatModificationEffect, ApplyStatusOnHitEffect, StatGrade, BonusStats, StatName, TraitCondition, SkillCondition } from '../types';
import { getFinalCharacterStats, gradeToValue, rollGrade } from '../utils/diceUtils';
import { TranslationKeys, useLanguage } from '../contexts/LanguageContext';

// --- TYPES AND INTERFACES ---

interface FighterState {
    base: GeneratedCharacter;
    currentHp: number;
    gauge: number;
    mana: number;
    guard: number;
    statusEffects: ActiveStatusEffect[];
    effectiveStats: {
        stats: CharacterStats;
        bonusStats: BonusStats;
    };
}

export interface RollInfo {
    label: StatName;
    grade: StatGrade;
    bonus: number;
}

interface RollPayload {
    attackerId: string;
    defenderId: string;
}

export interface HitCheckRequest {
    attacker: RollInfo;
    defender: RollInfo;
    payload: RollPayload;
}

export interface DamageRollRequest {
    attacker: RollInfo;
    defender: RollInfo;
    payload: RollPayload;
}

export interface ActiveSkill {
    skillName: string;
    characterId: string;
}

export interface ActivePassive {
    key: number;
    skillName: string;
    effectText: string;
    characterId: string;
}

export interface ActiveDialogue {
    characterId: string;
    text: string;
}

type BattleEventType = 'SUCCESS' | 'FAILURE' | 'DAMAGE' | 'HEAL' | 'INFO';
export interface BattleEvent {
    key: number;
    text: string;
    type: BattleEventType;
    characterId?: string;
}

interface WinnerInfo {
    base: GeneratedCharacter;
    logMessage: string;
}

export type AnimationType = 'APPROACH' | 'RETURN' | 'HIT_IMPACT' | 'MISS_SEQUENCE';
export interface AnimationTrigger {
    key: number;
    type: AnimationType;
    attackerId: string;
    defenderId: string;
}

// --- BATTLE ENGINE CORE ---

const BATTLE_TICK_MS = 100;
const GAUGE_THRESHOLD = 100;
const FRENZY_TURN = 10;
const ANIMATION_DURATIONS = {
    APPROACH: 800,
    RETURN: 600,
    HIT_IMPACT: 500,
    MISS_SEQUENCE: 800,
    POPUP: 1500,
};


// --- STATE MANAGEMENT (FINITE STATE MACHINE) ---

type BattlePhase =
    | 'IDLE'
    | 'TURN_START'
    | 'AWAITING_HIT_CHECK'
    | 'ANIMATING_MISS'
    | 'ANIMATING_APPROACH'
    | 'AWAITING_DAMAGE_ROLL'
    | 'ANIMATING_IMPACT'
    | 'ANIMATING_RETURN'
    | 'TURN_END'
    | 'ENDED';

interface TurnContext {
    attackerId: string;
    defenderId: string;
    vampiricStrike: number;
    statusOnHit: ApplyStatusEffect | null;
    damageBonus: number;
    accuracyBonus: number;
}

interface BattleState {
    fighters: [FighterState, FighterState];
    log: string[];
    winner: WinnerInfo | null;
    phase: BattlePhase;
    turnCount: number;
    isFrenzy: boolean;
    turnContext: TurnContext | null;
    
    // UI-facing state
    hitCheckRequest: HitCheckRequest | null;
    damageRollRequest: DamageRollRequest | null;
    activeSkill: ActiveSkill | null;
    activePassive: ActivePassive | null;
    activeDialogue: ActiveDialogue | null;
    battleEvent: BattleEvent | null;
    animationTrigger: AnimationTrigger | null;

    // Counters for unique keys
    eventKey: number;
    animKey: number;
    passiveKey: number;
}

type BattleAction =
    | { type: 'BATTLE_TICK' }
    | { type: 'PROCESS_TURN_START' }
    | { type: 'RESOLVE_HIT_CHECK', didHit: boolean }
    | { type: 'RESOLVE_DAMAGE_ROLL', attackerRoll: number, defenderRoll: number }
    | { type: 'ANIMATION_COMPLETE' }
    | { type: 'CLEAR_UI_POPUP', popupType: 'skill' | 'passive' | 'dialogue' | 'event' }
    | { type: 'FINALIZE_TURN' };

const initializeFighterState = (char: GeneratedCharacter): FighterState => {
    // The 'char' object passed in already has its final stats calculated. Use them directly.
    const maxHp = gradeToValue(char.stats.Vitality, char.bonusStats.Vitality || 0, 'Vitality');
    const maxMana = gradeToValue(char.stats.Mana, char.bonusStats.Mana || 0, 'Mana');
    return {
        base: char,
        currentHp: maxHp,
        gauge: 0,
        mana: maxMana,
        guard: 0,
        statusEffects: [],
        // Use the pre-calculated effective stats directly. They will be updated turn-by-turn later.
        effectiveStats: { stats: char.stats, bonusStats: char.bonusStats }
    };
};

const getRandomLine = (lines: string[] | undefined) => {
    if (!lines || lines.length === 0) return "";
    return lines[Math.floor(Math.random() * lines.length)];
}

const getEffectiveStats = (fighter: FighterState, opponent: FighterState, turnCount: number): { stats: CharacterStats, bonusStats: BonusStats } => {
    let effectiveBonus: BonusStats = { ...(fighter.base.bonusStats || {}) };
    const maxHp = gradeToValue(fighter.base.stats.Vitality, fighter.base.bonusStats.Vitality || 0, 'Vitality');
    const opponentMaxHp = gradeToValue(opponent.base.stats.Vitality, opponent.base.bonusStats.Vitality || 0, 'Vitality');

    const checkCondition = (condition: TraitCondition) => {
        if (!condition) return false;
        switch (condition.type) {
            case 'ALWAYS_ACTIVE': return true;
            case 'HP_ABOVE_THRESHOLD': return fighter.currentHp / maxHp >= condition.threshold!;
            case 'HP_BELOW_THRESHOLD': return fighter.currentHp / maxHp <= condition.threshold!;
            case 'ENEMY_HP_BELOW_THRESHOLD': return opponent.currentHp / opponentMaxHp <= condition.threshold!;
            case 'ENEMY_HP_ABOVE_THRESHOLD': return opponent.currentHp / opponentMaxHp >= condition.threshold!;
            case 'ENEMY_HAS_STATUS_EFFECT': return opponent.statusEffects.length > 0;
            case 'SELF_HAS_STATUS_EFFECT': 
                return condition.statusType 
                    ? fighter.statusEffects.some(e => e.type === condition.statusType) 
                    : fighter.statusEffects.length > 0;
            case 'MANA_ABOVE_THRESHOLD': return fighter.mana >= condition.threshold!;
            case 'MANA_BELOW_THRESHOLD': return fighter.mana <= condition.threshold!;
            default: return false;
        }
    };
    
    if (fighter.base.passiveSkill?.effect?.type === 'STAT_MODIFICATION' && checkCondition(fighter.base.passiveSkill.condition)) {
        const mod = (fighter.base.passiveSkill.effect as StatModificationEffect).modification;
        effectiveBonus[mod.stat] = (effectiveBonus[mod.stat] || 0) + mod.value;
    }
    

    fighter.statusEffects.forEach(effect => {
        switch(effect.type) {
            case 'BLIND': effectiveBonus.Precision = (effectiveBonus.Precision || 0) + effect.potency; break;
            case 'SLOW': effectiveBonus.Speed = (effectiveBonus.Speed || 0) + effect.potency; break;
            case 'VULNERABLE': effectiveBonus.Defense = (effectiveBonus.Defense || 0) + effect.potency; break;
        }
    });
    
    if (turnCount >= FRENZY_TURN) {
        const turnsInFrenzy = turnCount - FRENZY_TURN + 1;
        effectiveBonus.Attack = (effectiveBonus.Attack || 0) + turnsInFrenzy;
        effectiveBonus.Precision = (effectiveBonus.Precision || 0) + turnsInFrenzy;
        effectiveBonus.Defense = (effectiveBonus.Defense || 0) - turnsInFrenzy;
        effectiveBonus.Agility = (effectiveBonus.Agility || 0) - turnsInFrenzy;
    }

    return { stats: fighter.base.stats, bonusStats: effectiveBonus };
};

const checkActiveSkillCondition = (attacker: FighterState, condition?: SkillCondition) => {
    if (!condition) return true; // No condition means it can always be activated
    const maxHp = gradeToValue(attacker.base.stats.Vitality, attacker.base.bonusStats.Vitality || 0, 'Vitality');
    switch (condition.type) {
        case 'HP_BELOW_THRESHOLD': return attacker.currentHp / maxHp <= condition.threshold!;
        case 'MANA_ABOVE_THRESHOLD': return attacker.mana >= condition.threshold!;
        case 'MANA_BELOW_THRESHOLD': return attacker.mana <= condition.threshold!;
        case 'SELF_HAS_STATUS_EFFECT': 
            return condition.statusType 
                ? attacker.statusEffects.some(e => e.type === condition.statusType) 
                : attacker.statusEffects.length > 0;
        default: return false;
    }
};


const battleReducer = (state: BattleState, action: BattleAction, t: (key: TranslationKeys, placeholders?: Record<string, string>) => string): BattleState => {
    switch (action.type) {
        case 'BATTLE_TICK': {
            if (state.phase !== 'IDLE') return state;

            const [f1, f2] = state.fighters;
            const speed1 = gradeToValue(f1.effectiveStats.stats.Speed, f1.effectiveStats.bonusStats.Speed || 0, 'Speed');
            const speed2 = gradeToValue(f2.effectiveStats.stats.Speed, f2.effectiveStats.bonusStats.Speed || 0, 'Speed');
            const newFighters: [FighterState, FighterState] = [
                { ...f1, gauge: f1.gauge + speed1 },
                { ...f2, gauge: f2.gauge + speed2 }
            ];

            const readyFighter = newFighters.find(f => f.gauge >= GAUGE_THRESHOLD);
            if (readyFighter) {
                const attackerId = readyFighter.base.id;
                const defenderId = attackerId === f1.base.id ? f2.base.id : f1.base.id;
                
                const turnContext: TurnContext = { attackerId, defenderId, vampiricStrike: 0, statusOnHit: null, damageBonus: 0, accuracyBonus: 0 };
                return {
                    ...state,
                    phase: 'TURN_START',
                    fighters: newFighters.map(f => f.base.id === attackerId ? { ...f, gauge: f.gauge - GAUGE_THRESHOLD } : f) as [FighterState, FighterState],
                    turnContext,
                };
            }
            return { ...state, fighters: newFighters };
        }

        case 'PROCESS_TURN_START': {
                if (state.phase !== 'TURN_START') return state;
                let { log, turnCount, isFrenzy } = { ...state };
                let fighters = JSON.parse(JSON.stringify(state.fighters)) as [FighterState, FighterState];
                let turnContext = { ...state.turnContext! };
                let activeSkill: ActiveSkill | null = null;

                let attacker = fighters.find(f => f.base.id === turnContext!.attackerId)!;
                const defender = fighters.find(f => f.base.id === turnContext!.defenderId)!;
                
                log.push(t('turnMessage', { characterName: attacker.base.name }));
                turnCount += 1;
                if (turnCount === FRENZY_TURN) {
                    isFrenzy = true;
                    log.push(`- ${t('frenzyMessage')} -`);
                }

                // Guard Decay
                if (attacker.guard > 0) {
                    attacker.guard = Math.floor(attacker.guard / 2);
                    log.push(t('guardWeakensMessage', { characterName: attacker.base.name }));
                }
                
                // Update effective stats at turn start
                fighters = fighters.map(f => ({
                    ...f,
                    effectiveStats: getEffectiveStats(f, f.base.id === attacker.base.id ? defender : attacker, turnCount)
                })) as [FighterState, FighterState];
                attacker = fighters.find(f => f.base.id === turnContext!.attackerId)!;

                let isStunned = false;
                attacker.statusEffects = attacker.statusEffects
                    .map(effect => ({ ...effect, remainingDuration: effect.remainingDuration - 1 }))
                    .filter(effect => {
                        if (effect.remainingDuration <= 0) {
                            log.push(t('statusExpiredMessage', { characterName: attacker.base.name, statusType: t(effect.type as TranslationKeys)}));
                            return false;
                        }
                        if (effect.type === 'STUN') isStunned = true;
                        if (['POISON', 'BURN'].includes(effect.type)) {
                            const damage = effect.potency;
                            attacker.currentHp = Math.max(0, attacker.currentHp - damage);
                            log.push(t('statusDamageMessage', { characterName: attacker.base.name, statusType: t(effect.type as TranslationKeys), damage: String(damage) }));
                        }
                        return true;
                    });

                if (attacker.currentHp <= 0) {
                    const winner = defender;
                    const logMessage = getRandomLine(winner.base.combatLines.onVictory) || t('victoryMessage', { winnerName: winner.base.name });
                    return {
                        ...state,
                        log: [...log, `- ${logMessage}`],
                        winner: { base: winner.base, logMessage },
                        phase: 'ENDED',
                        fighters: fighters,
                        turnCount,
                        isFrenzy,
                    };
                }

                if (isStunned) {
                    return {
                        ...state,
                        log: [...log, t('statusStunnedMessage', { characterName: attacker.base.name })],
                        phase: 'TURN_END',
                        fighters: fighters,
                        turnCount,
                        isFrenzy,
                    };
                }
                
                const specialSkill = attacker.base.specialSkill;
                if (specialSkill && specialSkill.activation.timing === 'ON_TURN_START' && attacker.mana > 0 && checkActiveSkillCondition(attacker, specialSkill.activation.condition)) {
                    attacker.mana -= 1;
                    activeSkill = { skillName: specialSkill.name, characterId: attacker.base.id };
                    log.push(t('skillUsedMessage', { characterName: attacker.base.name, skillName: specialSkill.name }));

                    const effect = specialSkill.effect;
                    switch (effect.type) {
                        case 'DAMAGE_BOOST': turnContext.damageBonus += effect.value; break;
                        case 'ACCURACY_BOOST': turnContext.accuracyBonus += effect.value; break;
                        case 'VAMPIRIC_STRIKE': turnContext.vampiricStrike = effect.value; break;
                        case 'GAIN_GUARD': 
                            attacker.guard += effect.value;
                            log.push(t('guardGainedMessage', { characterName: attacker.base.name, amount: String(effect.value) }));
                            break;
                        case 'MANA_SIPHON':
                            const manaSiphoned = Math.min(defender.mana, effect.value);
                            attacker.mana = Math.min(gradeToValue(attacker.base.stats.Mana, attacker.base.bonusStats.Mana || 0, 'Mana'), attacker.mana + manaSiphoned);
                            defender.mana -= manaSiphoned;
                            log.push(t('manaSiphonedMessage', { characterName: attacker.base.name, amount: String(manaSiphoned) }));
                            break;
                        case 'HEAL':
                            const healAmount = rollGrade(effect.value, 0, 'Vitality');
                            const maxHp = gradeToValue(attacker.base.stats.Vitality, attacker.base.bonusStats.Vitality || 0, 'Vitality');
                            attacker.currentHp = Math.min(maxHp, attacker.currentHp + healAmount);
                            log.push(t('healMessage', { characterName: attacker.base.name, healAmount: String(healAmount) }));
                            break;
                        case 'APPLY_STATUS_EFFECT': turnContext.statusOnHit = effect; break;
                        // NEW EFFECTS
                        case 'CLEANSE': {
                            const numToRemove = effect.value === 0 ? attacker.statusEffects.length : Math.min(effect.value, attacker.statusEffects.length);
                            if (numToRemove > 0) {
                                attacker.statusEffects = attacker.statusEffects.slice(numToRemove);
                                log.push(t('cleanseMessage', { characterName: attacker.base.name, amount: String(numToRemove) }));
                            }
                            break;
                        }
                        case 'MANA_RESTORE': {
                            const maxMana = gradeToValue(attacker.base.stats.Mana, attacker.base.bonusStats.Mana || 0, 'Mana');
                            const restored = Math.min(effect.value, maxMana - attacker.mana);
                            attacker.mana += restored;
                            log.push(t('manaRestoredMessage', { characterName: attacker.base.name, amount: String(restored) }));
                            break;
                        }
                        case 'GUARD_BREAK': {
                            const destroyed = Math.min(effect.value, defender.guard);
                            defender.guard -= destroyed;
                            if (destroyed > 0) {
                                log.push(t('guardBreakMessage', { characterName: attacker.base.name, amount: String(destroyed) }));
                            }
                            break;
                        }
                    }
                }

                const attackerStats = attacker.effectiveStats;
                const defenderStats = defender.effectiveStats;
                
                return {
                    ...state,
                    phase: 'AWAITING_HIT_CHECK',
                    log, turnCount, isFrenzy, fighters, turnContext, activeSkill,
                    hitCheckRequest: {
                        attacker: { label: 'Precision', grade: attackerStats.stats.Precision, bonus: (attackerStats.bonusStats.Precision || 0) + turnContext.accuracyBonus },
                        defender: { label: 'Agility', grade: defenderStats.stats.Agility, bonus: defenderStats.bonusStats.Agility || 0 },
                        payload: { attackerId: attacker.base.id, defenderId: defender.base.id }
                    }
                };
        }

        case 'RESOLVE_HIT_CHECK': {
            if (state.phase !== 'AWAITING_HIT_CHECK') return state;
            const { turnContext } = state;
            let fighters = JSON.parse(JSON.stringify(state.fighters));
            let attacker = fighters.find((f: FighterState) => f.base.id === turnContext!.attackerId)!;
            
            let localTurnContext = { ...turnContext! };
            let activeSkill = state.activeSkill;
            let nextLog = [...state.log];

            if (action.didHit) {
                const specialSkill = attacker.base.specialSkill;
                if (specialSkill && specialSkill.activation.timing === 'AFTER_HIT_SUCCESS' && attacker.mana > 0 && checkActiveSkillCondition(attacker, specialSkill.activation.condition)) {
                    attacker.mana -= 1;
                    activeSkill = { skillName: specialSkill.name, characterId: attacker.base.id };
                    nextLog.push(t('skillUsedMessage', { characterName: attacker.base.name, skillName: specialSkill.name }));
                    if (specialSkill.effect.type === 'APPLY_STATUS_EFFECT') {
                        localTurnContext.statusOnHit = specialSkill.effect;
                    }
                }

                const passive = attacker.base.passiveSkill;
                if (passive && passive.effect.type === 'APPLY_STATUS_EFFECT_ON_HIT') {
                    if (Math.random() < passive.effect.chance) {
                        localTurnContext.statusOnHit = { type: 'APPLY_STATUS_EFFECT', effect: passive.effect.effect };
                        nextLog.push(t('traitActivatedMessage', { characterName: attacker.base.name, traitName: passive.name }));
                    }
                }

                const line = getRandomLine(attacker.base.combatLines.onAttackHit);
                return {
                    ...state,
                    phase: 'ANIMATING_APPROACH',
                    log: [...nextLog, t('attackSuccess')],
                    turnContext: localTurnContext,
                    fighters: fighters,
                    activeSkill: activeSkill,
                    hitCheckRequest: null,
                    animKey: state.animKey + 1,
                    animationTrigger: { key: state.animKey + 1, type: 'APPROACH', attackerId: turnContext!.attackerId, defenderId: turnContext!.defenderId },
                    activeDialogue: line ? { characterId: turnContext!.attackerId, text: line } : null,
                };
            } else {
                 const line = getRandomLine(fighters.find((f: FighterState) => f.base.id === turnContext!.defenderId)!.base.combatLines.onDodge);
                return {
                    ...state,
                    phase: 'ANIMATING_MISS',
                    log: [...nextLog, t('attackFailure')],
                    hitCheckRequest: null,
                    animKey: state.animKey + 1,
                    animationTrigger: { key: state.animKey + 1, type: 'MISS_SEQUENCE', attackerId: turnContext!.attackerId, defenderId: turnContext!.defenderId },
                    activeDialogue: line ? { characterId: turnContext!.defenderId, text: line } : null,
                };
            }
        }

        case 'RESOLVE_DAMAGE_ROLL': {
            if (state.phase !== 'AWAITING_DAMAGE_ROLL') return state;
            const { turnContext } = state;
            const { attackerRoll, defenderRoll } = action;
            let fighters = JSON.parse(JSON.stringify(state.fighters));
            let attacker = fighters.find((f: FighterState) => f.base.id === turnContext!.attackerId)!;
            let defender = fighters.find((f: FighterState) => f.base.id === turnContext!.defenderId)!;
            let newLog = [...state.log];
            let damageToHp = 0;
            let finalBattleEvent: BattleEvent | null = null;

            if (defenderRoll >= attackerRoll) {
                // Blocked
                const defStats = defender.effectiveStats;
                const guardGained = Math.floor(gradeToValue(defStats.stats.Defense, defStats.bonusStats.Defense || 0, 'Defense') / 2);
                defender.guard += guardGained;
                newLog.push(t('guardGainedMessage', { characterName: defender.base.name, amount: String(guardGained)}));
                finalBattleEvent = { key: state.eventKey + 1, text: t('damageBlocked'), type: 'SUCCESS', characterId: defender.base.id };
            } else {
                // Hit
                const damage = attackerRoll - defenderRoll;
                const damageAbsorbedByGuard = Math.min(damage, defender.guard);
                if (damageAbsorbedByGuard > 0) {
                    defender.guard -= damageAbsorbedByGuard;
                    newLog.push(t('guardAbsorbedMessage', { absorbed: String(damageAbsorbedByGuard)}));
                }
                
                damageToHp = damage - damageAbsorbedByGuard;
                defender.currentHp = Math.max(0, defender.currentHp - damageToHp);
                newLog.push(t('damageDealt', { damage: String(damageToHp) }));
                finalBattleEvent = { key: state.eventKey + 1, text: `-${damageToHp}`, type: 'DAMAGE', characterId: defender.base.id };
                
                if (turnContext!.vampiricStrike > 0) {
                    const heal = Math.floor(damageToHp * turnContext!.vampiricStrike);
                    const maxHp = gradeToValue(attacker.base.stats.Vitality, attacker.base.bonusStats.Vitality || 0, 'Vitality');
                    attacker.currentHp = Math.min(maxHp, attacker.currentHp + heal);
                    newLog.push(t('healMessage', { characterName: attacker.base.name, healAmount: String(heal) }));
                }

                if (turnContext!.statusOnHit) {
                    const effectToApply = turnContext!.statusOnHit.effect;
                    const existingEffect = defender.statusEffects.find((e: ActiveStatusEffect) => e.type === effectToApply.type);
                    if (existingEffect) {
                        existingEffect.remainingDuration = effectToApply.duration;
                        newLog.push(t('statusRefreshedMessage', { targetName: defender.base.name, statusType: t(effectToApply.type as TranslationKeys) }));
                    } else {
                        defender.statusEffects.push({
                            ...effectToApply,
                            id: crypto.randomUUID(),
                            remainingDuration: effectToApply.duration,
                        });
                        newLog.push(t('statusAppliedMessage', { targetName: defender.base.name, statusType: t(effectToApply.type as TranslationKeys) }));
                    }
                }
            }
            
            let winner: WinnerInfo | null = state.winner;
            if (defender.currentHp <= 0) {
                winner = { base: attacker.base, logMessage: getRandomLine(attacker.base.combatLines.onVictory) || t('victoryMessage', { winnerName: attacker.base.name }) };
                newLog.push(`- ${winner.logMessage}`);
            }

            return {
                ...state,
                phase: 'ANIMATING_IMPACT',
                log: newLog,
                fighters: fighters,
                damageRollRequest: null,
                eventKey: state.eventKey + 1,
                battleEvent: finalBattleEvent,
                animKey: state.animKey + 1,
                animationTrigger: { key: state.animKey + 1, type: 'HIT_IMPACT', attackerId: turnContext!.attackerId, defenderId: turnContext!.defenderId },
                winner
            };
        }

        case 'ANIMATION_COMPLETE': {
            switch (state.phase) {
                case 'ANIMATING_MISS':
                    return { ...state, phase: 'TURN_END', hitCheckRequest: null, animationTrigger: null };
                case 'ANIMATING_APPROACH': {
                    const { turnContext } = state;
                    const attacker = state.fighters.find(f => f.base.id === turnContext!.attackerId)!;
                    const defender = state.fighters.find(f => f.base.id === turnContext!.defenderId)!;
                    const attackerStats = attacker.effectiveStats;
                    const defenderStats = defender.effectiveStats;
                    return {
                        ...state,
                        phase: 'AWAITING_DAMAGE_ROLL',
                        hitCheckRequest: null,
                        damageRollRequest: {
                            attacker: { label: 'Attack', grade: attackerStats.stats.Attack, bonus: (attackerStats.bonusStats.Attack || 0) + turnContext!.damageBonus },
                            defender: { label: 'Defense', grade: defenderStats.stats.Defense, bonus: defenderStats.bonusStats.Defense || 0 },
                            payload: { attackerId: attacker.base.id, defenderId: defender.base.id }
                        }
                    };
                }
                case 'ANIMATING_IMPACT': {
                    return {
                        ...state,
                        phase: 'ANIMATING_RETURN',
                        animationTrigger: { ...state.animationTrigger!, key: state.animKey + 1, type: 'RETURN' }
                    };
                }
                case 'ANIMATING_RETURN':
                    return { ...state, phase: 'TURN_END', animationTrigger: null };
                default:
                    return state;
            }
        }
        
        case 'FINALIZE_TURN': {
            if (state.phase !== 'TURN_END') return state;
            if (state.winner) {
                return { ...state, phase: 'ENDED', turnContext: null };
            }
            return {
                ...state,
                phase: 'IDLE',
                turnContext: null,
                animationTrigger: null,
            };
        }

        case 'CLEAR_UI_POPUP': {
            switch(action.popupType) {
                case 'skill': return { ...state, activeSkill: null };
                case 'passive': return { ...state, activePassive: null };
                case 'dialogue': return { ...state, activeDialogue: null };
                case 'event': return { ...state, battleEvent: null };
                default: return state;
            }
        }
        default:
            return state;
    }
};

export const useBattleEngine = (combatant1: GeneratedCharacter, combatant2: GeneratedCharacter) => {
    const { t } = useLanguage();
    
    const initialState: BattleState = {
        fighters: [initializeFighterState(combatant1), initializeFighterState(combatant2)],
        log: [t('battleBeginsMessage', { char1: combatant1.name, char2: combatant2.name })],
        winner: null,
        phase: 'IDLE',
        turnCount: 0,
        isFrenzy: false,
        turnContext: null,
        hitCheckRequest: null,
        damageRollRequest: null,
        activeSkill: null,
        activePassive: null,
        activeDialogue: null,
        battleEvent: null,
        animationTrigger: null,
        eventKey: 0,
        animKey: 0,
        passiveKey: 0,
    };
    
    const [state, dispatch] = useReducer((s: BattleState, a: BattleAction) => battleReducer(s, a, t), initialState);

    // Main tick loop
    useEffect(() => {
        if (state.phase !== 'IDLE' || state.winner) return;
        const tickInterval = setInterval(() => dispatch({ type: 'BATTLE_TICK' }), BATTLE_TICK_MS);
        return () => clearInterval(tickInterval);
    }, [state.phase, state.winner]);

    // State machine transitions
    useEffect(() => {
        if (state.phase === 'TURN_START') {
            const timer = setTimeout(() => dispatch({ type: 'PROCESS_TURN_START' }), 10);
            return () => clearTimeout(timer);
        } else if (['ANIMATING_MISS', 'ANIMATING_APPROACH', 'ANIMATING_IMPACT', 'ANIMATING_RETURN'].includes(state.phase)) {
            const duration = state.phase === 'ANIMATING_MISS' ? ANIMATION_DURATIONS.MISS_SEQUENCE
                           : state.phase === 'ANIMATING_APPROACH' ? ANIMATION_DURATIONS.APPROACH
                           : state.phase === 'ANIMATING_RETURN' ? ANIMATION_DURATIONS.RETURN
                           : ANIMATION_DURATIONS.HIT_IMPACT;
            const timer = setTimeout(() => dispatch({ type: 'ANIMATION_COMPLETE' }), duration);
            return () => clearTimeout(timer);
        } else if (state.phase === 'TURN_END') {
            const timer = setTimeout(() => dispatch({ type: 'FINALIZE_TURN' }), 500);
            return () => clearTimeout(timer);
        }

    }, [state.phase]);

     // UI Popup clearer
    useEffect(() => {
        if (state.activeSkill) {
            const timer = setTimeout(() => dispatch({ type: 'CLEAR_UI_POPUP', popupType: 'skill'}), ANIMATION_DURATIONS.POPUP);
            return () => clearTimeout(timer);
        }
        if (state.activePassive) {
            const timer = setTimeout(() => dispatch({ type: 'CLEAR_UI_POPUP', popupType: 'passive'}), ANIMATION_DURATIONS.POPUP);
            return () => clearTimeout(timer);
        }
        if (state.activeDialogue) {
            const timer = setTimeout(() => dispatch({ type: 'CLEAR_UI_POPUP', popupType: 'dialogue'}), ANIMATION_DURATIONS.POPUP);
            return () => clearTimeout(timer);
        }
        if (state.battleEvent) {
            const timer = setTimeout(() => dispatch({ type: 'CLEAR_UI_POPUP', popupType: 'event'}), ANIMATION_DURATIONS.POPUP);
            return () => clearTimeout(timer);
        }
    }, [state.activeSkill, state.activePassive, state.activeDialogue, state.battleEvent]);

    const resolveHitCheck = useCallback((attackerRoll: number, defenderRoll: number) => {
        dispatch({ type: 'RESOLVE_HIT_CHECK', didHit: attackerRoll > defenderRoll });
    }, []);

    const resolveDamageRoll = useCallback((attackerRoll: number, defenderRoll: number) => {
        dispatch({ type: 'RESOLVE_DAMAGE_ROLL', attackerRoll, defenderRoll });
    }, []);
    
    const currentAttackerId = state.turnContext?.attackerId || null;

    return useMemo(() => ({
        fighters: state.fighters,
        log: state.log,
        winner: state.winner,
        hitCheckRequest: state.hitCheckRequest,
        damageRollRequest: state.damageRollRequest,
        activeSkill: state.activeSkill,
        activePassive: state.activePassive,
        activeDialogue: state.activeDialogue,
        currentAttackerId: currentAttackerId,
        battleEvent: state.battleEvent,
        animationTrigger: state.animationTrigger,
        isFrenzy: state.isFrenzy,
        turnCount: state.turnCount, // 추가: 고유 키 생성용
        resolveHitCheck,
        resolveDamageRoll,
    }), [state, resolveHitCheck, resolveDamageRoll, currentAttackerId]);
};