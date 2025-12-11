import React, { useState, useEffect } from 'react';
import { GeneratedCharacter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CharacterGalleryProps {
    characters: GeneratedCharacter[];
    onStartBattle: (char1: GeneratedCharacter, char2: GeneratedCharacter) => void;
    onNavigateToForm: () => void;
    onViewCharacter: (character: GeneratedCharacter) => void;
    onStartRecruitment: (character: GeneratedCharacter) => void;
}

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C13.1 2 14 2.9 14 4V5H16C16.5 5 17 5.4 17.1 5.9L18 8H19C20.1 8 21 8.9 21 10C21 11.1 20.1 12 19 12H18V14C18 17.3 15.3 20 12 20C8.7 20 6 17.3 6 14V12H5C3.9 12 3 11.1 3 10C3 8.9 3.9 8 5 8H6L6.9 5.9C7 5.4 7.5 5 8 5H10V4C10 2.9 10.9 2 12 2M8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14V7H8V14M12 22C10.3 22 9 21.5 9 21H15C15 21.5 13.7 22 12 22Z"/>
    </svg>
);

const CountdownTimer: React.FC<{ expiryTimestamp: number }> = ({ expiryTimestamp }) => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(expiryTimestamp - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = expiryTimestamp - Date.now();
            if (newTimeLeft <= 0) {
                clearInterval(timer);
                setTimeLeft(0);
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTimestamp]);

    if (timeLeft <= 0) {
        return <>{t('attemptRecruitmentButton')}</>;
    }

    const minutes = Math.floor((timeLeft / 1000) / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return <>{t('cooldownActiveButton', { time: `${minutes}:${seconds.toString().padStart(2, '0')}` })}</>;
};

const CharacterCard: React.FC<{
    character: GeneratedCharacter;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onViewCharacter: (character: GeneratedCharacter) => void;
    onStartRecruitment: (character: GeneratedCharacter) => void;
    index: number;
}> = React.memo(({ character, isSelected, onSelect, onViewCharacter, onStartRecruitment, index }) => {
    const { t } = useLanguage();
    
    const isRecruited = character.status === 'RECRUITED';
    const cooldownActive = character.cooldownUntil !== null && character.cooldownUntil > Date.now();

    const handleCardClick = () => {
        if (isRecruited) {
            onViewCharacter(character);
        } else if (!cooldownActive) {
            onStartRecruitment(character);
        }
    };

    return (
        <div 
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
        >
            <div className={`group relative transition-all duration-500 ${isSelected ? '-translate-y-2' : 'hover:-translate-y-2'}`}>
                {/* Glow effect */}
                <div className={`absolute -inset-1 rounded-2xl transition-all duration-500 blur-lg ${
                    isSelected 
                        ? 'bg-gradient-to-br from-amber-500/50 via-violet-500/50 to-cyan-500/50 opacity-100' 
                        : 'bg-gradient-to-br from-violet-600/30 to-indigo-600/30 opacity-0 group-hover:opacity-70'
                }`}></div>
                
                {/* Card */}
                <div className={`relative card-premium rounded-xl overflow-hidden transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-amber-500/70' : ''
                }`}>
                    {/* Image container */}
                    <div onClick={handleCardClick} className="cursor-pointer relative aspect-square overflow-hidden">
                        {character.image ? (
                            <img 
                                src={`data:image/jpeg;base64,${character.image}`} 
                                alt={character.name} 
                                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${!isRecruited ? 'blur-md grayscale' : ''}`} 
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <span className="text-5xl font-display text-slate-600">{character.name.charAt(0)}</span>
                            </div>
                        )}
                        
                        {/* Overlay for unrecruited */}
                        {!isRecruited && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="text-center">
                                    <span className="text-6xl font-display text-slate-400 block">?</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider mt-2">Unknown</span>
                                </div>
                             </div>
                        )}

                        {/* Trophy badge */}
                        {isRecruited && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-amber-500/30">
                                <TrophyIcon className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-white text-sm">{character.wins}</span>
                    </div>
                        )}
                        
                        {/* Selected indicator */}
                        {isSelected && (
                            <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50"></div>
                        )}
                        
                        {/* Name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                            <h3 className="font-heading text-lg font-semibold text-white truncate">{character.name}</h3>
                            <p className="text-xs text-slate-400 font-body">{character.race}</p>
                        </div>
                    </div>
                    
                    {/* Action button */}
                    <div className="p-3 bg-black/30">
                     {isRecruited ? (
                        <button
                            onClick={() => onSelect(character.id)}
                                className={`w-full text-sm font-semibold py-2.5 px-3 rounded-lg transition-all duration-300 ${
                                    isSelected 
                                        ? 'btn-gold' 
                                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-violet-500/30'
                                }`}
                        >
                            {isSelected ? t('selectedButton') : t('selectButton')}
                        </button>
                    ) : (
                         <button
                            onClick={() => onStartRecruitment(character)}
                            disabled={cooldownActive}
                                className="w-full text-sm font-semibold py-2.5 px-3 rounded-lg transition-all duration-300 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed"
                        >
                            {cooldownActive ? <CountdownTimer expiryTimestamp={character.cooldownUntil!} /> : t('attemptRecruitmentButton')}
                        </button>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
});


const CharacterGallery: React.FC<CharacterGalleryProps> = ({ characters, onStartBattle, onNavigateToForm, onViewCharacter, onStartRecruitment }) => {
    const { t } = useLanguage();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectCharacter = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(selectedId => selectedId !== id);
            }
            if (prev.length < 2) {
                return [...prev, id];
            }
            return [prev[0], id];
        });
    };

    const handleStartBattleClick = () => {
        if (selectedIds.length === 2) {
            const char1 = characters.find(c => c.id === selectedIds[0]);
            const char2 = characters.find(c => c.id === selectedIds[1]);
            if (char1 && char2) {
                onStartBattle(char1, char2);
            }
        }
    };
    
    const unrecruitedChars = characters.filter(c => c.status === 'UNRECRUITED');
    const recruitedChars = characters.filter(c => c.status === 'RECRUITED');

    if (characters.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/20">
                    <span className="text-4xl">✦</span>
                </div>
                <h2 className="font-display text-3xl font-bold mb-4 gradient-text">{t('myCharactersTitle')}</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">{t('galleryEmptyMessage')}</p>
                <button onClick={onNavigateToForm} className="btn-premium px-8 py-3 rounded-xl font-semibold">
                    {t('backToForgeButton')}
                </button>
            </div>
        );
    }

    const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
        <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wider gradient-text mb-2">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
            <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/50"></div>
                <div className="text-amber-500/50">✦</div>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/50"></div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-16">
            {/* Unrecruited Characters */}
            {unrecruitedChars.length > 0 && (
                <section>
                    <SectionHeader 
                        title={t('unrecruitedCreationsTitle')} 
                        subtitle={t('unrecruitedCreationsSubtitle')} 
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {unrecruitedChars.map((char, index) => (
                            <CharacterCard 
                                key={char.id} 
                                character={char}
                                isSelected={false}
                                onSelect={() => {}}
                                onViewCharacter={onViewCharacter}
                                onStartRecruitment={onStartRecruitment}
                                index={index}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Recruited Characters */}
            <section>
                <SectionHeader 
                    title={t('myCharactersTitle')} 
                    subtitle={t('selectTwoMessage')} 
                />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10">
                    {recruitedChars.map((char, index) => (
                        <CharacterCard 
                            key={char.id} 
                            character={char}
                            isSelected={selectedIds.includes(char.id)}
                            onSelect={handleSelectCharacter}
                            onViewCharacter={onViewCharacter}
                            onStartRecruitment={onStartRecruitment}
                            index={index}
                        />
                    ))}
                </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
                 <button
                    onClick={onNavigateToForm}
                    className="px-8 py-3 rounded-xl font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300"
                >
                    {t('backToForgeButton')}
                </button>
                <button
                    onClick={handleStartBattleClick}
                    disabled={selectedIds.length !== 2}
                    className="btn-premium px-8 py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-300"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 6l6-3 3 3-3 6-3-3"/>
                            <path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/>
                        </svg>
                    {t('startBattleButton')}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default CharacterGallery;
