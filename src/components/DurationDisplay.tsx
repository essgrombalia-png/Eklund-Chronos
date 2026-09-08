import React from 'react';
import {
  Copy,
  Clock,
  Sparkles,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Equal,
  Briefcase,
} from 'lucide-react';
import { DurationResult } from '../types';

interface DurationDisplayProps {
  result: DurationResult;
  isHumanReadable: boolean;
  onToggleHumanReadable: (val: boolean) => void;
  onCopyText: (text: string, label: string) => void;
  isLive: boolean;
}

export const DurationDisplay: React.FC<DurationDisplayProps> = ({
  result,
  isHumanReadable,
  onToggleHumanReadable,
  onCopyText,
  isLive,
}) => {
  const { direction, statusLabel, primaryFormatted, timeFormatted, exactSentence, humanSentence } = result;

  const handleCopySummary = () => {
    const textToCopy = isHumanReadable ? humanSentence : exactSentence;
    onCopyText(textToCopy, 'Sammanfattning kopierad');
  };

  return (
    <div
      id="duration-hero-container"
      className="relative p-5 sm:p-7 md:p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-[#13161B] shadow-xs sm:shadow-sm transition-all overflow-hidden"
    >
      {/* Subtle ambient light gradient in top corner */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-neutral-200/30 dark:bg-neutral-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top status bar with direction tag & Exakt / Lättläst switch */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-full ${
              result.workingDaysInfo?.isWorkingDaysOnly
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                : direction === 'future'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                : direction === 'past'
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            {result.workingDaysInfo?.isWorkingDaysOnly ? (
              <Briefcase className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : direction === 'future' ? (
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : direction === 'past' ? (
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Equal className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>{statusLabel}</span>
          </span>

          {/* Weekend excluded badge */}
          {result.workingDaysInfo?.isWorkingDaysOnly && (
            <span className="inline-flex items-center text-[11px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 px-2 py-0.5 rounded-md">
              {result.workingDaysInfo.weekendDays} helgdagar bortvalda
            </span>
          )}

          {/* Live indicator if end is Now */}
          {isLive && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live ticker
            </span>
          )}
        </div>

        {/* Mode switcher: Exakt vs Lättläst */}
        <div className="grid grid-cols-2 sm:inline-flex p-1 bg-neutral-100/80 dark:bg-neutral-800/70 backdrop-blur-md rounded-xl border border-neutral-200/90 dark:border-neutral-700/60 text-xs shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onToggleHumanReadable(false)}
            className={`flex items-center justify-center gap-1.5 min-h-[34px] sm:min-h-[30px] px-3.5 py-1 rounded-lg font-medium transition-all ${
              !isHumanReadable
                ? 'btn-liquid-glass text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Exakt</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleHumanReadable(true)}
            className={`flex items-center justify-center gap-1.5 min-h-[34px] sm:min-h-[30px] px-3.5 py-1 rounded-lg font-medium transition-all ${
              isHumanReadable
                ? 'btn-liquid-glass text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Lättläst</span>
          </button>
        </div>
      </div>

      {/* Main hero visualization */}
      {isHumanReadable ? (
        <div className="relative z-10 py-3 sm:py-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
            Uppskattad tid
          </p>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 capitalize leading-tight break-words">
            {humanSentence}
          </h2>

          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 break-words">
              Exakt: <span className="font-mono tabular-nums text-neutral-700 dark:text-neutral-300">{exactSentence}</span>
            </p>

            <button
              type="button"
              id="btn-copy-human-result"
              onClick={handleCopySummary}
              className="btn-liquid-glass shrink-0 self-stretch sm:self-auto gap-2 min-h-[38px] sm:min-h-[34px] px-4 py-1.5 text-xs font-semibold rounded-xl shadow-xs"
              title="Kopiera text (Kortkommando: C)"
              aria-label="Kopiera text"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopiera</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col gap-2 py-1">
          {/* Primary calendar block: År · Månader · Dagar */}
          <div className="flex items-baseline">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums leading-tight break-words">
              {primaryFormatted}
            </h2>
          </div>

          {/* Time row: Timmar : Minuter : Sekunder */}
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-medium font-mono tracking-wider text-neutral-700 dark:text-neutral-300 tabular-nums">
                {timeFormatted}
              </span>
            </div>

            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              tim · min · sek
            </span>
          </div>

          {!result.workingDaysInfo?.isWorkingDaysOnly && result.workingDaysInfo && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
              <Briefcase className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <span>
                Motsvarar ca <span className="font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{result.workingDaysInfo.workingDays}</span> arbetsdagar ({result.workingDaysInfo.workingWeeks} v) exkl. helger
              </span>
            </div>
          )}

          {/* Full natural sentence description */}
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {exactSentence}
            </p>

            <button
              type="button"
              id="btn-copy-main-result"
              onClick={handleCopySummary}
              className="btn-liquid-glass shrink-0 self-stretch sm:self-auto gap-2 min-h-[38px] sm:min-h-[34px] px-4 py-1.5 text-xs font-semibold rounded-xl shadow-xs"
              title="Kopiera fullständigt resultat (Kortkommando: C)"
              aria-label="Kopiera text"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopiera</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
