import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/40 dark:bg-[#0D0F12]/40 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] mt-10 sm:mt-14 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 text-center sm:text-left">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Dina datum sparas endast lokalt i din webbläsare.</span>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs flex-wrap">
          <button
            type="button"
            onClick={onOpenAbout}
            className="py-1 px-1.5 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Integritet & Om
          </button>
          <span>·</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 px-1.5 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
