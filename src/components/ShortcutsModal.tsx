import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Växla slutdatum till "Nu" (Live counter)' },
    { key: 'S', desc: 'Växla plats (swap) på start- och slutdatum' },
    { key: 'C', desc: 'Kopiera fullständigt beräkningsresultat' },
    { key: 'E', desc: 'Exportera data & statistik (PNG / CSV)' },
    { key: 'R', desc: 'Återställ beräkningen till standardvärden' },
    { key: '?', desc: 'Visa denna översikt med kortkommandon' },
    { key: 'Esc', desc: 'Stäng öppna dialogrutor och paneler' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#14171B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden modal-dialog-animate flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-neutral-500" />
            <h3
              id="shortcuts-modal-title"
              className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Kortkommandon
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass w-8 h-8 rounded-xl shrink-0"
            aria-label="Stäng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto overscroll-contain flex-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
            Tryck på tangenterna direkt i webbläsaren (inaktiverat när du skriver i formulärfält).
          </p>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {shortcuts.map((s) => (
              <div key={s.key} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-neutral-700 dark:text-neutral-300">{s.desc}</span>
                <kbd className="px-2.5 py-1 text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/90 dark:border-neutral-700 rounded-lg shadow-2xs shrink-0">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex justify-end bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass min-h-[36px] px-5 py-1.5 text-xs font-semibold rounded-xl"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};
