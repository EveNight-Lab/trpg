import React, { useState } from 'react';
import { GeneratedCharacter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getImageUrl } from '../utils/imageUtils';

interface BattleMementosModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: GeneratedCharacter;
}

const BattleMementosModal: React.FC<BattleMementosModalProps> = ({ isOpen, onClose, character }) => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const hasMementos = character.victoryImages && character.victoryImages.length > 0;

  const LightboxView: React.FC = () => (
    <div 
      className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 animate-fade-in-fast p-4"
      onClick={() => setSelectedImage(null)}
    >
      <img 
        src={getImageUrl(selectedImage)} 
        alt="Enlarged battle memento"
        className="max-w-full max-h-full object-contain rounded-lg"
      />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in-fast" onClick={onClose}>
        <div 
          className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 border border-slate-700 flex flex-col max-h-[80vh]" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex-shrink-0">
              <h3 className="text-xl font-bold text-white mb-4">{t('battleMementos')}</h3>
              <hr className="border-slate-700 mb-4"/>
          </div>
          
          <div className="overflow-y-auto pr-2 -mr-2 space-y-3 flex-grow">
            {hasMementos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {character.victoryImages.map((victory, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-square rounded-lg overflow-hidden ring-1 ring-slate-700 cursor-pointer"
                    onClick={() => setSelectedImage(victory.image)}
                  >
                    <img src={getImageUrl(victory.image)} alt={`Victory against ${victory.opponentName}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white font-bold truncate">{t('victoryAgainst', { opponentName: victory.opponentName })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400 text-center py-8">{t('mementosEmptyMessage')}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="py-2 px-4 border border-slate-600 rounded-md text-sm font-medium text-slate-200 bg-transparent hover:bg-slate-700"
            >
              {t('cancelButton')}
            </button>
          </div>
        </div>
      </div>
      {selectedImage && <LightboxView />}
    </>
  );
};

export default BattleMementosModal;