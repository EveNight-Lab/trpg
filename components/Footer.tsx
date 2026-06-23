import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/60 py-8 px-4 font-body text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
          <span>© {new Date().getFullYear()} Creator's Nexus. All rights reserved.</span>
          <span className="hidden md:inline text-slate-800">|</span>
          <span className="flex items-center gap-1.5 text-amber-500/70 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 inline-block animate-pulse"></span>
            본 프로젝트는 Evenight Lab 소속입니다.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="mailto:evenight331@gmail.com" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>evenight331@gmail.com</span>
          </a>
          <a href="https://lab.evenight.dev" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500/80 to-yellow-600/80 flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3 text-black fill-current font-bold" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span>Evenight Lab Hub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
