import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface RecruitmentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: 'success' | 'failure' | null;
  characterName: string;
}

const RecruitmentResultModal: React.FC<RecruitmentResultModalProps> = ({ isOpen, onClose, result, characterName }) => {
  const { t } = useLanguage();

  if (!isOpen || !result) {
    return null;
  }

  const isSuccess = result === 'success';
  const title = isSuccess ? t('recruitmentSuccessTitle') : t('recruitmentFailureTitle');
  const message = isSuccess 
    ? t('recruitmentSuccessMessage', { characterName }) 
    : t('recruitmentFailureMessage', { characterName });
  const buttonText = isSuccess ? t('goToSheetButton') : t('returnToGalleryButton');
  const buttonColor = isSuccess ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-600 hover:bg-slate-700';
  const ringColor = isSuccess ? 'ring-green-500' : 'ring-red-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in-fast" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-slate-700 text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
            <svg className={`h-6 w-6 ${isSuccess ? 'text-green-600' : 'text-red-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isSuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                )}
            </svg>
        </div>
        <h3 className="text-xl font-bold text-white mt-4 mb-2">{title}</h3>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${ringColor} focus:ring-offset-slate-800`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentResultModal;