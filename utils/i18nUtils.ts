import { TranslationKeys } from '../contexts/LanguageContext';

// This function was moved from CharacterSheet.tsx to break a circular dependency
export const formatCondition = (condition: any, t: (key: TranslationKeys, placeholders?: Record<string, string>) => string): string => {
    const statusType = condition.statusType ? t(condition.statusType as TranslationKeys) : '';
    const hasThreshold = condition.threshold !== undefined && condition.threshold !== null;

    switch (condition.type) {
        case 'HP_ABOVE_THRESHOLD': 
            return t('skillCondition_HP_ABOVE', { value: hasThreshold ? String(condition.threshold * 100) : '?' });
        case 'HP_BELOW_THRESHOLD': 
            return t('skillCondition_HP_BELOW', { value: hasThreshold ? String(condition.threshold * 100) : '?' });
        case 'ENEMY_HP_BELOW_THRESHOLD': 
            return t('skillCondition_ENEMY_HP_BELOW', { value: hasThreshold ? String(condition.threshold * 100) : '?' });
        case 'ENEMY_HAS_STATUS_EFFECT': 
            return t('skillCondition_ENEMY_HAS_STATUS');
        case 'SELF_HAS_STATUS_EFFECT': 
            return t('skillCondition_SELF_HAS_STATUS', { status: statusType });
        case 'MANA_ABOVE_THRESHOLD': 
            return t('skillCondition_MANA_ABOVE', { value: hasThreshold ? String(condition.threshold) : '?' });
        case 'MANA_BELOW_THRESHOLD': 
            return t('skillCondition_MANA_BELOW', { value: hasThreshold ? String(condition.threshold) : '?' });
        case 'ALWAYS_ACTIVE': 
            return t('skillCondition_ALWAYS');
        default: 
            return condition.type;
    }
};