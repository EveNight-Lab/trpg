import React, { useState, useEffect, useRef } from 'react';
import { GeneratedCharacter, Trait, PassiveSkill, SpecialSkill, StatName } from '../../types';
import { useLanguage, TranslationKeys } from '../../contexts/LanguageContext';
import { formatCondition } from '../../utils/i18nUtils';

const EquipSkillModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (equippedAbilities: any) => void;
  character: GeneratedCharacter;
  abilityType: 'trait' | 'passive' | 'special' | null;
}> = ({ isOpen, onClose, onConfirm, character, abilityType }) => {
  const { t } = useLanguage();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const hasInitialized = useRef(false);
  const statLabels: { [key in StatName]: TranslationKeys } = {
    Vitality: 'Vitality', Attack: 'Attack', Defense: 'Defense', Speed: 'Speed',
    Precision: 'Precision', Agility: 'Agility', Mana: 'Mana',
  };

  useEffect(() => {
    if (isOpen) {
      // This logic now uses a ref flag to ensure it ONLY initializes state once
      // when the modal opens, preventing parent re-renders from resetting the user's choice.
      if (!hasInitialized.current) {
        if (abilityType === 'trait') {
          setSelectedNames(character.traits.map(t => t.name));
        } else if (abilityType === 'passive') {
          setSelectedNames(character.passiveSkill ? [character.passiveSkill.name] : []);
        } else if (abilityType === 'special') {
          setSelectedNames(character.specialSkill ? [character.specialSkill.name] : []);
        }
        hasInitialized.current = true;
      }
    } else {
      // Reset the flag when the modal is closed, so it re-initializes next time.
      hasInitialized.current = false;
    }
  }, [isOpen, abilityType, character]);

  if (!isOpen || !abilityType) return null;

  const getTitleAndItems = () => {
    switch (abilityType) {
      case 'trait': return { title: t('equipTraits'), items: character.unlockedTraits, limit: 3 };
      case 'passive': return { title: t('equipPassive'), items: character.unlockedPassiveSkills, limit: 1 };
      case 'special': return { title: t('equipActive'), items: character.unlockedSpecialSkills, limit: 1 };
      default: return { title: '', items: [], limit: 0 };
    }
  };

  const { title, items, limit } = getTitleAndItems();

  const handleSelect = (item: Trait | PassiveSkill | SpecialSkill) => {
    const itemName = item.name;
    if (abilityType === 'trait') {
      setSelectedNames(prev => {
        if (prev.includes(itemName)) {
          return prev.filter(name => name !== itemName);
        }
        if (prev.length < limit) {
          return [...prev, itemName];
        }
        return prev; // Do nothing if limit is reached
      });
    } else {
      setSelectedNames([itemName]);
    }
  };
  
  const handleConfirmClick = () => {
    if (abilityType === 'trait') {
      const equippedTraits = items.filter(item => selectedNames.includes(item.name)) as Trait[];
      onConfirm(equippedTraits);
    } else {
      const equippedAbility = items.find(item => selectedNames.includes(item.name));
      onConfirm(equippedAbility);
    }
  };
  
  const renderItemDetails = (item: any) => {
    switch (abilityType) {
      case 'trait':
        const trait = item as Trait;
        const modUp = trait.modifications.find(m => m.value > 0);
        const modDown = trait.modifications.find(m => m.value < 0);
        return (
          <div className="font-mono">
            {modUp && <span className="text-green-400">{`${t(statLabels[modUp.stat])} ▲${Math.abs(modUp.value)}`}</span>}
            {modDown && <span className="text-red-400 ml-2">{`${t(statLabels[modDown.stat])} ▼${Math.abs(modDown.value)}`}</span>}
          </div>
        );
      case 'passive':
        const pSkill = item as PassiveSkill;
        return <div className="font-mono text-cyan-300">{`${t('skillConditionShort')}: ${formatCondition(pSkill.condition, t)}`}</div>;
      case 'special':
        const sSkill = item as SpecialSkill;
        return (
          <div className="space-y-1">
            <div className="font-mono text-yellow-300">{`${t('skillEffect')}: ${sSkill.effectDescription}`}</div>
            {sSkill.activation.condition && (
              <div className="font-mono text-cyan-300">{`${t('skillConditionShort')}: ${formatCondition(sSkill.activation.condition, t)}`}</div>
            )}
          </div>
        );
      default: return null;
    }
  };

  const renderItem = (item: Trait | PassiveSkill | SpecialSkill, index: number) => {
    const isSelected = selectedNames.includes(item.name);
    const isDisabled = !isSelected && selectedNames.length >= limit;

    return (
      <div
        key={`${item.name}-${index}`}
        onClick={() => !isDisabled && handleSelect(item)}
        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
          isSelected ? 'border-indigo-500 bg-indigo-900/50' : 'border-slate-700 bg-slate-800 hover:border-slate-500'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex justify-between items-start">
            <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{item.name}</h4>
            {isSelected && <span className="text-xs font-bold text-indigo-300 bg-indigo-800/50 px-2 py-1 rounded flex-shrink-0">{t('equipped')}</span>}
        </div>
        <p className="text-xs text-slate-400 mt-1 italic">"{item.description}"</p>
        <div className="text-xs text-slate-300 mt-2 border-t border-slate-700/50 pt-2">
          {renderItemDetails(item)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 border border-slate-700 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                {abilityType === 'trait' && <p className="text-sm text-slate-400">{t('selectUpTo', {count: String(limit)})}</p>}
            </div>
            <hr className="border-slate-700 mb-4"/>
        </div>
        
        <div className="overflow-y-auto pr-2 -mr-2 space-y-3 flex-grow">
            {(items as (Trait | PassiveSkill | SpecialSkill)[]).map(renderItem)}
        </div>

        <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-slate-600 rounded-md text-sm font-medium text-slate-200 bg-transparent hover:bg-slate-700"
          >
            {t('cancelButton')}
          </button>
          <button
            onClick={handleConfirmClick}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t('confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipSkillModal;