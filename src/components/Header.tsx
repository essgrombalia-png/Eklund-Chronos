import React from 'react';
import logo3D from '../assets/images/chronos_3d_logo_1788860962599.jpg';
import {
  History,
  Bookmark,
  Share2,
  Sun,
  Moon,
  Monitor,
  Command,
  Info,
  ImageDown,
} from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onOpenFavorites: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
  onShare: () => void;
  theme: 'light' | 'dark' | 'system';
  onCycleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onOpenFavorites,
  onOpenExport,
  onOpenShortcuts,
  onOpenAbout,
  onShare,
  theme,
  onCycleTheme,
}) => {
  return (
    <header className="w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-[#0D0F12]/85 backdrop-blur-md sticky top-0 z-30 transition-colors shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-15 flex items-center justify-between gap-2">
        {/* Logo & Product identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm shadow-black/15 ring-1 ring-black/10 dark:ring-white/15 bg-neutral-900 group">
            <img
              src={logo3D}
              alt="Eklund Chronos 3D Logo"
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Eklund Chronos
              </span>
              <span className="hidden xs:inline-block text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-400 font-medium border border-neutral-200/60 dark:border-neutral-700/50">
                Precision
              </span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* History */}
          <button
            id="btn-header-history"
            onClick={onOpenHistory}
            className="btn-liquid-glass gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-0 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl"
            title="Historik"
            aria-label="Öppna historik"
          >
            <History className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden md:inline">Historik</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-bold rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 tabular-nums shadow-2xs">
                {historyCount}
              </span>
            )}
          </button>

          {/* Favorites */}
          <button
            id="btn-header-favorites"
            onClick={onOpenFavorites}
            className="btn-liquid-glass gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-0 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl"
            title="Favoriter"
            aria-label="Öppna sparade favoriter"
          >
            <Bookmark className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden md:inline">Favoriter</span>
          </button>

          {/* Export PNG & CSV */}
          <button
            id="btn-header-export"
            onClick={onOpenExport}
            className="btn-liquid-glass gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-0 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl"
            title="Exportera till PNG eller CSV"
            aria-label="Exportera resultat och data"
          >
            <ImageDown className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden sm:inline">Exportera</span>
          </button>

          {/* Share */}
          <button
            id="btn-header-share"
            onClick={onShare}
            className="btn-liquid-glass gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-0 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl"
            title="Dela beräkning som URL"
            aria-label="Dela aktuell länk"
          >
            <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden sm:inline">Dela</span>
          </button>

          <div className="w-[1px] h-4 bg-neutral-200/80 dark:bg-neutral-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* Shortcuts info - hidden on narrow mobile, visible on tablet/desktop */}
          <button
            id="btn-header-shortcuts"
            onClick={onOpenShortcuts}
            className="hidden sm:inline-flex btn-liquid-glass min-h-[36px] min-w-[36px] p-2 rounded-xl"
            title="Kortkommandon (?)"
            aria-label="Visa kortkommandon"
          >
            <Command className="w-3.5 h-3.5" />
          </button>

          {/* About / Info */}
          <button
            id="btn-header-about"
            onClick={onOpenAbout}
            className="btn-liquid-glass min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-[36px] p-2 rounded-xl"
            title="Om Chronos"
            aria-label="Om appen"
          >
            <Info className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Theme toggle - prominent and easy to tap on all devices */}
          <button
            id="btn-header-theme"
            onClick={onCycleTheme}
            className="btn-liquid-glass min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-[36px] p-2 rounded-xl"
            title={`Tema: ${theme === 'light' ? 'Ljust' : theme === 'dark' ? 'Mörkt' : 'System'}`}
            aria-label="Växla tema"
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-sky-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
