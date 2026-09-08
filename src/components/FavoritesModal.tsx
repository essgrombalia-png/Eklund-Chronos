import React, { useState } from 'react';
import { X, Bookmark, Plus, Trash2, ArrowUpRight, ImageDown } from 'lucide-react';
import { FavoriteItem } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onSelectFavorite: (item: FavoriteItem) => void;
  onDeleteFavorite: (id: string) => void;
  onSaveCurrentAsFavorite: (title: string) => void;
  currentStartFormatted: string;
  currentEndFormatted: string;
  onExportPng?: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectFavorite,
  onDeleteFavorite,
  onSaveCurrentAsFavorite,
  currentStartFormatted,
  currentEndFormatted,
  onExportPng,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onSaveCurrentAsFavorite(newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-modal-title"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#14171B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-neutral-500" />
            <h3
              id="favorites-modal-title"
              className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Sparade favoriter
            </h3>
            <span className="text-xs text-neutral-400 font-mono">({favorites.length})</span>
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

        {/* Add current as favorite prompt */}
        <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 shrink-0">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="btn-liquid-glass w-full flex items-center justify-center gap-2 min-h-[42px] sm:min-h-[38px] py-2 px-3 text-xs font-semibold rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Spara aktuell beräkning som favorit</span>
            </button>
          ) : (
            <form onSubmit={handleSave} className="space-y-2.5">
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Spara: <span className="font-mono text-neutral-800 dark:text-neutral-200">{currentStartFormatted} → {currentEndFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Namn (t.ex. Semester, Projekt)..."
                  className="flex-1 min-h-[40px] sm:min-h-[36px] px-3 py-1.5 text-base sm:text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn-liquid-glass-primary min-h-[40px] sm:min-h-[36px] px-4 py-1.5 text-xs font-semibold rounded-xl shadow-xs shrink-0"
                >
                  Spara
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn-liquid-glass min-h-[40px] sm:min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-xl shrink-0"
                >
                  Avbryt
                </button>
              </div>
            </form>
          )}
        </div>

        {/* List of favorites */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {favorites.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Inga favoriter sparade ännu.
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="group p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-white dark:hover:bg-neutral-900 transition-all flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectFavorite(fav);
                    onClose();
                  }}
                  className="text-left flex-1 min-w-0"
                >
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
                    {fav.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5 flex-wrap">
                    <span>{fav.startIsNow ? 'Nu' : fav.startDate}</span>
                    <span>→</span>
                    <span>{fav.endIsNow ? 'Nu' : fav.endDate}</span>
                    <span className="text-neutral-400 dark:text-neutral-600">· {fav.timezone}</span>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDeleteFavorite(fav.id)}
                    className="btn-liquid-glass w-8 h-8 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 shadow-2xs"
                    title="Ta bort favorit"
                    aria-label="Ta bort favorit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFavorite(fav);
                      onClose();
                    }}
                    className="btn-liquid-glass w-8 h-8 rounded-lg shadow-2xs"
                    title="Ladda datum"
                    aria-label="Ladda datum"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          {favorites.length > 0 && onExportPng ? (
            <button
              type="button"
              onClick={onExportPng}
              className="btn-liquid-glass text-xs font-semibold flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl shadow-2xs"
              title="Exportera sparade favoriter till PNG-bild"
            >
              <ImageDown className="w-3.5 h-3.5 text-neutral-500" />
              <span>Exportera till PNG</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass min-h-[36px] px-5 py-1.5 text-xs font-semibold rounded-xl ml-auto"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};
