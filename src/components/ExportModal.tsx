import React, { useState } from 'react';
import {
  X,
  ImageDown,
  FileSpreadsheet,
  Check,
  Bookmark,
  History,
  Palette,
  Sparkles,
  Layers,
} from 'lucide-react';
import { CalculationState, DurationResult, FavoriteItem, HistoryItem } from '../types';
import { downloadDataAsPng } from '../utils/exportPng';
import { downloadDataAsCsv } from '../utils/exportCsv';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  history: HistoryItem[];
  currentTimezone: string;
  durationResult: DurationResult;
  calculationState: CalculationState;
  startFormatted: string;
  endFormatted: string;
  onSuccessToast: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  favorites,
  history,
  currentTimezone,
  durationResult,
  calculationState,
  startFormatted,
  endFormatted,
  onSuccessToast,
}) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'csv'>('png');
  const [scope, setScope] = useState<'all' | 'current' | 'history' | 'favorites'>('all');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [csvDelimiter, setCsvDelimiter] = useState<';' | ','>(';');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      await downloadDataAsPng(favorites, history, {
        theme: themeMode,
        includeCurrentResult: scope === 'all' || scope === 'current',
        includeFavorites: scope === 'all' || scope === 'favorites',
        includeHistory: scope === 'all' || scope === 'history',
        timezone: currentTimezone,
        currentResultData: {
          durationResult,
          state: calculationState,
          startFormatted,
          endFormatted,
        },
      });
      onSuccessToast('PNG-bild med fullständigt resultat nedladdad');
      onClose();
    } catch (err) {
      console.error('Export PNG failed:', err);
      onSuccessToast('Kunde inte generera PNG-bild');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    try {
      setIsExporting(true);
      downloadDataAsCsv(history, favorites, {
        delimiter: csvDelimiter,
        includeCurrentResult: scope === 'all' || scope === 'current',
        includeHistory: scope === 'all' || scope === 'history',
        includeFavorites: scope === 'all' || scope === 'favorites',
        timezone: currentTimezone,
        currentResult: durationResult,
        currentState: calculationState,
        startFormatted,
        endFormatted,
      });
      onSuccessToast('CSV-fil med historik och statistik nedladdad');
      onClose();
    } catch (err) {
      console.error('Export CSV failed:', err);
      onSuccessToast('Kunde inte exportera CSV-fil');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'png') {
      handleExportPng();
    } else {
      handleExportCsv();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#14171B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden modal-dialog-animate flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
              {exportFormat === 'png' ? (
                <ImageDown className="w-4 h-4" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
            </div>
            <h3
              id="export-modal-title"
              className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate"
            >
              Exportera beräkningsdata & statistik
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1">
          {/* Format selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
              Välj format
            </label>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('png')}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                  exportFormat === 'png'
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 mt-0.5">
                  <ImageDown className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">PNG-bild</span>
                    {exportFormat === 'png' && (
                      <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                    Hela resultatet: år, månader, dagar, tid (HH:mm:ss) och statistik.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                  exportFormat === 'csv'
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">CSV-kalkylark</span>
                    {exportFormat === 'csv' && (
                      <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                    För analys i Excel, Sheets, Python eller R med alla numeriska tidsenheter.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
              Innehåll att inkludera
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                  scope === 'all'
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-neutral-100'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[11px]">All data</span>
                  {scope === 'all' && <Check className="w-3 h-3 text-neutral-900 dark:text-neutral-100" />}
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                  Resultat + {history.length + favorites.length} poster
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('current')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                  scope === 'current'
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-neutral-100'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-neutral-400" />
                    <span className="font-medium text-[11px]">Endast resultat</span>
                  </div>
                  {scope === 'current' && <Check className="w-3 h-3 text-neutral-900 dark:text-neutral-100" />}
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                  År, mån, dag, tid
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('history')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                  scope === 'history'
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-neutral-100'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <History className="w-3 h-3 text-neutral-400" />
                    <span className="font-medium text-[11px]">Historik</span>
                  </div>
                  {scope === 'history' && <Check className="w-3 h-3 text-neutral-900 dark:text-neutral-100" />}
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                  {history.length} beräkningar
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('favorites')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                  scope === 'favorites'
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-neutral-100'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-neutral-400" />
                    <span className="font-medium text-[11px]">Favoriter</span>
                  </div>
                  {scope === 'favorites' && <Check className="w-3 h-3 text-neutral-900 dark:text-neutral-100" />}
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                  {favorites.length} sparade
                </span>
              </button>
            </div>
          </div>

          {/* Conditional Options per Format */}
          {exportFormat === 'png' ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-neutral-400" />
                <span>Bildtema</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`px-3 py-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                    themeMode === 'dark'
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#0D0F12] border border-neutral-600 inline-block" />
                    <span>Mörkt tema</span>
                  </div>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`px-3 py-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                    themeMode === 'light'
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white border border-neutral-300 inline-block" />
                    <span>Ljust tema</span>
                  </div>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-neutral-400" />
                <span>CSV-avgränsare</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCsvDelimiter(';')}
                  className={`px-3 py-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                    csvDelimiter === ';'
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div>
                    <div className="font-medium">Semikolon (;)</div>
                    <div className="text-[10px] opacity-75">Bäst för Excel i Sverige/Europa</div>
                  </div>
                  {csvDelimiter === ';' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCsvDelimiter(',')}
                  className={`px-3 py-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                    csvDelimiter === ','
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div>
                    <div className="font-medium">Komma (,)</div>
                    <div className="text-[10px] opacity-75">Standard (RFC 4180 / Python / R)</div>
                  </div>
                  {csvDelimiter === ',' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Detailed summary of what will be in the file */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <div className="flex items-center justify-between font-medium text-neutral-800 dark:text-neutral-200">
              <span>
                {exportFormat === 'png' ? 'PNG-rendering' : 'CSV-innehåll'}
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                {exportFormat === 'png' ? '920px · 2x Retina' : 'UTF-8 BOM (Excel-klar)'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {exportFormat === 'png'
                ? 'Exporterar hela resultatet med tydliga kort för år, månader, dagar och tid (HH:mm:ss), följt av totala dagar/timmar/minuter/sekunder och historik.'
                : 'Innehåller 29 kolumner inklusive start/slut, tidszon, status samt separata numeriska fält för år, månader, veckor, dagar, tid, timmar, minuter, sekunder och totaler.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2.5 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass min-h-[38px] px-4 py-1.5 text-xs font-medium rounded-xl"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="btn-liquid-glass-primary gap-2 min-h-[38px] px-5 py-1.5 text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50"
          >
            {exportFormat === 'png' ? (
              <ImageDown className="w-4 h-4" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>
              {isExporting
                ? 'Bearbetar export...'
                : exportFormat === 'png'
                ? 'Ladda ner PNG'
                : 'Ladda ner CSV'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
