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
import { FlipTimeDisplay } from './FlipDisplay';

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
      className="glass-card neon-border-subtle relative p-5 sm:p-7 md:p-8 rounded-2xl overflow-hidden"
    >
      {/* Subtle ambient light gradient in top corner */}
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-transparent dark:from-sky-500/15 dark:via-indigo-500/10 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

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
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30 dark:border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping neon-pulse-dot" />
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
          <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-500 mb-2 font-mono">
            Uppskattad tid
          </p>
          <h2 className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white neon-hero-title capitalize leading-tight break-words">
            {humanSentence}
          </h2>

          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 break-words">
              Exakt:{' '}
              <span className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200 font-medium">
                {exactSentence}
              </span>
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
        <div className="relative z-10 flex flex-col gap-2.5 py-1">
          {/* Primary calendar block: År · Månader · Dagar with high-end font and neon separator dots */}
          <div className="flex items-baseline flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
            {primaryFormatted.split('·').map((segment, idx, arr) => (
              <React.Fragment key={idx}>
                <span className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-neutral-950 dark:text-white neon-hero-title tabular-nums">
                  {segment.trim()}
                </span>
                {idx < arr.length - 1 && (
                  <span className="text-sky-500 dark:text-sky-400 font-bold select-none text-xl sm:text-3xl lg:text-4xl neon-dot-separator px-0.5">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Time row: Timmar : Minuter : Sekunder with smooth flip animation and subtle neon lume */}
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-sky-50 dark:drop-shadow-[0_0_16px_rgba(56,189,248,0.35)] tabular-nums inline-flex items-center">
                <FlipTimeDisplay timeFormatted={timeFormatted} />
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 select-none font-medium">
                tim · min · sek
              </span>
              {isLive && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse neon-pulse-dot"
                  title="Tid tickar i realtid"
                />
              )}
            </div>
          </div>

          {!result.workingDaysInfo?.isWorkingDaysOnly && result.workingDaysInfo && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
              <Briefcase className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <span>
                Motsvarar ca{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono tabular-nums">
                  {result.workingDaysInfo.workingDays}
                </span>{' '}
                arbetsdagar ({result.workingDaysInfo.workingWeeks} v) exkl. helger
              </span>
            </div>
          )}

          {/* Full natural sentence description */}
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-[14px] text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
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
