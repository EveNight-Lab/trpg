import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Define googletag on the window object for TypeScript
declare global {
  interface Window {
    googletag: any;
  }
}

interface InterstitialAdModalProps {
  onClose: () => void;
}

const AD_SLOT_ID = 'gpt-interstitial-ad-slot';
const AD_UNIT_PATH = '/6355419/Travel/Europe'; // Google's test ad unit
const AD_SIZE: [number, number] = [300, 250];
const SKIP_TIMER_SECONDS = 5;

const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [canSkip, setCanSkip] = useState(false);
  const [countdown, setCountdown] = useState(SKIP_TIMER_SECONDS);
  const adSlotRef = useRef<any>(null);
  
  // Effect for the countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [countdown]);

  // Effect for setting up and destroying the GPT ad slot
  useEffect(() => {
    window.googletag.cmd.push(() => {
      const adSlot = window.googletag.defineSlot(AD_UNIT_PATH, AD_SIZE, AD_SLOT_ID).addService(window.googletag.pubads());
      adSlotRef.current = adSlot;

      // Event listener to close modal if ad fails to render
      window.googletag.pubads().addEventListener('slotRenderEnded', (event: any) => {
        if (event.slot === adSlotRef.current && event.isEmpty) {
          console.warn('Ad slot was empty. Closing modal.');
          onClose();
        }
      });
      
      window.googletag.enableServices();
      window.googletag.display(AD_SLOT_ID);
      window.googletag.pubads().refresh([adSlot]);
    });

    // Cleanup function to destroy the slot when the component unmounts
    return () => {
      if (adSlotRef.current) {
        window.googletag.cmd.push(() => {
          window.googletag.destroySlots([adSlotRef.current]);
        });
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50 animate-fade-in-fast backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="w-full text-center p-4 absolute top-0">
        <h3 className="text-2xl font-bold text-yellow-300 font-cinzel">{t('adModalTitle')}</h3>
      </div>

      {/* Ad container */}
      <div className="flex justify-center items-center">
        <div id={AD_SLOT_ID} style={{ width: `${AD_SIZE[0]}px`, height: `${AD_SIZE[1]}px` }}></div>
      </div>
      
      <div className="w-full text-center p-4 absolute bottom-0">
        <button
          onClick={onClose}
          disabled={!canSkip}
          className="py-2 px-6 border border-slate-600 rounded-full text-sm font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {canSkip ? t('skipAd') : t('skipAdIn', { seconds: String(countdown) })}
        </button>
      </div>
    </div>
  );
};

export default InterstitialAdModal;
