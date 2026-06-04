import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
  onNavigate: (view: 'form' | 'gallery') => void;
}

const GoldenDivider: React.FC = () => (
  <div className="flex items-center justify-center gap-4 my-8">
    <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-500/50"></div>
    <div className="text-amber-500/70 text-xl">✦</div>
    <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-500/50"></div>
  </div>
);

const NavCard: React.FC<{
  title: string;
  subtitle: string;
  onClick: () => void;
  icon: React.ReactNode;
  gradient: string;
  delay: string;
}> = ({ title, subtitle, onClick, icon, gradient, delay }) => (
  <button 
    onClick={onClick}
    className="group relative w-full max-w-sm animate-fade-in-up opacity-0"
    style={{ animationDelay: delay, animationFillMode: 'forwards' }}
  >
    {/* Outer glow */}
    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500`}></div>
    
    {/* Card */}
    <div className="relative card-premium rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-opacity-50">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
      
      {/* Content */}
      <div className="p-8 sm:p-10">
        {/* Icon container */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 blur-md transition-opacity`}></div>
          <div className="relative w-full h-full rounded-full border border-white/10 flex items-center justify-center bg-black/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
        </div>
        
        {/* Text */}
        <h2 className="font-display text-2xl sm:text-3xl text-white mb-2 tracking-wider group-hover:text-gold transition-colors duration-300">
          {title}
        </h2>
        <p className="font-body text-slate-400 text-sm sm:text-base leading-relaxed group-hover:text-slate-300 transition-colors">
          {subtitle}
        </p>
        
        {/* Bottom ornament */}
        <div className="mt-6 flex justify-center gap-1">
          <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-amber-500/70 transition-colors"></span>
          <span className="w-6 h-1 rounded-full bg-white/20 group-hover:bg-amber-500/50 transition-colors"></span>
          <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-amber-500/70 transition-colors"></span>
        </div>
      </div>
    </div>
  </button>
);

// Icons
const ForgeIcon: React.FC = () => (
  <svg className="w-12 h-12 text-violet-400 group-hover:text-amber-400 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const GalaxyIcon: React.FC = () => (
  <svg className="w-12 h-12 text-blue-400 group-hover:text-amber-400 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20" strokeDasharray="3 3"/>
    <path d="M12 5a7 7 0 0 1 0 14 7 7 0 0 1 0-14" strokeDasharray="2 2"/>
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      {/* Header Section */}
      <header className="text-center mb-12 sm:mb-16 animate-fade-in">
        {/* Crown ornament */}
        <div className="flex justify-center mb-6">
          <div className="text-amber-500/60 text-3xl tracking-[0.5em]">☆ ✦ ☆</div>
        </div>
        
        {/* Main title */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[0.15em] uppercase mb-4">
          <span className="gradient-text">{t('appTitle')}</span>
        </h1>
        
        {/* Subtitle */}
        <p className="font-heading text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto italic">
          {t('appSubtitle')}
        </p>
        
        <GoldenDivider />
      </header>
      
      {/* Navigation Cards */}
      <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 w-full max-w-3xl justify-center items-center">
        <NavCard
          title={t('landingCreateTitle')}
          subtitle={t('landingCreateSubtitle')}
          onClick={() => onNavigate('form')}
          icon={<ForgeIcon />}
          gradient="from-violet-600 via-purple-600 to-indigo-600"
          delay="0.2s"
        />
        
        <NavCard
          title={t('landingGalleryTitle')}
          subtitle={t('landingGallerySubtitle')}
          onClick={() => onNavigate('gallery')}
          icon={<GalaxyIcon />}
          gradient="from-blue-600 via-indigo-600 to-violet-600"
          delay="0.4s"
        />
      </div>
      
      {/* Footer ornament */}
      <div className="mt-16 animate-fade-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-slate-700"></div>
          <span className="text-xs tracking-widest uppercase">Est. MMXXIV</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-slate-700"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
