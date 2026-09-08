import React from 'react';
import { X, Trash2, ArrowUpRight, Copy, Clock, ImageDown, FileSpreadsheet } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
  onCopyText: (text: string, label: string) => void;
  onExportPng?: () => void;
  onExportCsv?: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
  onCopyText,
  onExportPng,
  onExportCsv,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#14171B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <h3
              id="history-modal-title"
              className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Tidigare beräkningar
            </h3>
            <span className="text-xs text-neutral-400 font-mono">({history.length})</span>
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

        {/* List content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 overscroll-contain">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Inga tidigare beräkningar sparade ännu.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-white dark:hover:bg-neutral-900 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    className="text-left flex-1 min-w-0 group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 flex-wrap">
                      <span>{item.startIsNow ? 'Nu' : item.startDate}</span>
                      <span className="text-neutral-400">→</span>
                      <span>{item.endIsNow ? 'Nu' : item.endDate}</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 sm:line-clamp-1">
                      {item.summary}
                    </p>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onCopyText(item.summary, 'Resultat kopierat')}
                      className="btn-liquid-glass w-8 h-8 rounded-lg shadow-2xs"
                      title="Kopiera sammanfattning"
                      aria-label="Kopiera sammanfattning"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistory(item.id)}
                      className="btn-liquid-glass w-8 h-8 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 shadow-2xs"
                      title="Ta bort från historik"
                      aria-label="Ta bort från historik"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="btn-liquid-glass w-8 h-8 rounded-lg shadow-2xs"
                      title="Öppna beräkning"
                      aria-label="Öppna beräkning"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 font-mono pt-1 border-t border-neutral-200/50 dark:border-neutral-800/50">
                  <span>{item.timezone}</span>
                  <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {history.length > 0 && onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                className="btn-liquid-glass text-xs font-semibold flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl shadow-2xs"
                title="Exportera beräkningshistorik och statistik till CSV-kalkylark"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
                <span>CSV</span>
              </button>
            )}

            {history.length > 0 && onExportPng && (
              <button
                type="button"
                onClick={onExportPng}
                className="btn-liquid-glass text-xs font-semibold flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl shadow-2xs"
                title="Exportera beräkningshistorik till PNG-bild"
              >
                <ImageDown className="w-3.5 h-3.5 text-neutral-500" />
                <span>PNG</span>
              </button>
            )}

            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="btn-liquid-danger text-xs font-medium flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Rensa</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass min-h-[36px] px-4 py-1.5 text-xs font-semibold rounded-xl ml-auto"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};
