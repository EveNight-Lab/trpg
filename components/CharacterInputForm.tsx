import React from 'react';
import { UserCharacterInput } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InputFieldProps {
  id: keyof UserCharacterInput;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  isTextArea?: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, placeholder, isTextArea = false, icon }) => (
  <div className="group">
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-violet-400 transition-colors">
      {icon && <span className="text-violet-400/70 group-focus-within:text-violet-400">{icon}</span>}
      {label}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        name={id}
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="premium-input block w-full text-gray-200 placeholder-gray-500 resize-none"
      />
    ) : (
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="premium-input block w-full text-gray-200 placeholder-gray-500"
      />
    )}
  </div>
);

interface CharacterInputFormProps {
  userInput: UserCharacterInput;
  setUserInput: React.Dispatch<React.SetStateAction<UserCharacterInput>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onReturnToLanding: () => void;
}

const CharacterInputForm: React.FC<CharacterInputFormProps> = ({ userInput, setUserInput, onSubmit, isLoading, onReturnToLanding }) => {
  const { t } = useLanguage();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({ ...prev, [name]: value }));
  };

  const icons = {
    name: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    race: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
    appearance: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    personality: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    combatStyle: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    backstory: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card-premium rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <span className="text-amber-500/50 text-sm tracking-[0.3em]">✦ ✦ ✦</span>
          </div>
          <h2 className="font-display text-2xl font-bold gradient-text tracking-wider">{t('landingCreateTitle')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('landingCreateSubtitle')}</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              id="name"
              label={t('nameLabel')}
              value={userInput.name}
              onChange={handleInputChange}
              placeholder={t('namePlaceholder')}
              icon={icons.name}
            />
            <InputField
              id="race"
              label={t('raceLabel')}
              value={userInput.race}
              onChange={handleInputChange}
              placeholder={t('racePlaceholder')}
              icon={icons.race}
            />
          </div>
          
          <InputField
            id="appearance"
            label={t('appearanceLabel')}
            value={userInput.appearance}
            onChange={handleInputChange}
            placeholder={t('appearancePlaceholder')}
            isTextArea
            icon={icons.appearance}
          />
          
          <InputField
            id="personality"
            label={t('personalityLabel')}
            value={userInput.personality}
            onChange={handleInputChange}
            placeholder={t('personalityPlaceholder')}
            isTextArea
            icon={icons.personality}
          />
          
          <InputField
            id="combatStyle"
            label={t('combatStyleLabel')}
            value={userInput.combatStyle}
            onChange={handleInputChange}
            placeholder={t('combatStylePlaceholder')}
            isTextArea
            icon={icons.combatStyle}
          />
          
          <InputField
            id="backstory"
            label={t('backstoryLabel')}
            value={userInput.backstory}
            onChange={handleInputChange}
            placeholder={t('backstoryPlaceholder')}
            isTextArea
            icon={icons.backstory}
          />
          
          {/* Divider */}
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-violet-500/30"></div>
            <div className="text-violet-500/30 text-xs">✦</div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-violet-500/30"></div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onReturnToLanding}
              className="flex-shrink-0 py-3 px-6 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300"
            >
              {t('backToForgeButton')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-grow py-3 px-6 rounded-xl text-sm font-semibold btn-premium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('generatingButton')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {t('generateButton')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterInputForm;
