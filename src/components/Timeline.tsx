import React from 'react';
import { DateMetadata } from '../types';

interface TimelineProps {
  startDate: string;
  endDate: string;
  startMetadata: DateMetadata;
  endMetadata: DateMetadata;
  nowMetadata: DateMetadata;
  progressPercent: number | null;
  nowBetween: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  startMetadata,
  endMetadata,
  nowMetadata,
  progressPercent,
  nowBetween,
}) => {
  // If dates are invalid or identical, no timeline needed
  if (!startMetadata.dateString || !endMetadata.dateString) {
    return null;
  }

  const safePercent = progressPercent !== null ? Math.min(100, Math.max(0, progressPercent)) : 0;

  return (
    <div
      id="timeline-section"
      className="p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/85 dark:bg-[#11141b]/85 backdrop-blur-xl shadow-xs ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4 sm:mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Tidslinje & Framsteg
        </span>

        {nowBetween && progressPercent !== null && (
          <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 tabular-nums">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{safePercent}%</span> av perioden har passerat
          </span>
        )}
      </div>

      {/* Visual timeline track */}
      <div className="relative py-3 sm:py-4">
        {/* Subtle background line */}
        <div className="relative h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          {nowBetween && progressPercent !== null && (
            <div
              className="h-full bg-neutral-900 dark:bg-neutral-200 transition-all duration-300 rounded-full"
              style={{ width: `${safePercent}%` }}
            />
          )}
        </div>

        {/* Nodes on the timeline */}
        <div className="relative flex justify-between items-center -mt-2.5">
          {/* Start node */}
          <div className="flex flex-col items-start z-10 max-w-[32%]">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#13161B] shadow-2xs ring-2 ring-white dark:ring-[#13161B]" />
            <div className="mt-2 text-left">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block">
                Start
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-900 dark:text-neutral-100 block truncate">
                {startMetadata.dateString}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block tabular-nums">
                {startMetadata.timeString}
              </span>
            </div>
          </div>

          {/* Now node (only if between) */}
          {nowBetween && (
            <div
              className="absolute top-0 flex flex-col items-center -translate-x-1/2 transition-all duration-300 z-20 pointer-events-none"
              style={{ left: `${Math.min(84, Math.max(16, safePercent))}%` }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-4 h-4 rounded-full bg-emerald-500/25 animate-ping" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 dark:bg-emerald-400 ring-2 ring-white dark:ring-[#13161B]" />
              </div>
              <div className="mt-2 text-center">
                <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 block">
                  Nu
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-neutral-900 dark:text-neutral-100 hidden sm:block">
                  {nowMetadata.dateString}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block tabular-nums">
                  {nowMetadata.timeString}
                </span>
              </div>
            </div>
          )}

          {/* End node */}
          <div className="flex flex-col items-end z-10 max-w-[32%]">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#13161B] shadow-2xs ring-2 ring-white dark:ring-[#13161B]" />
            <div className="mt-2 text-right">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block">
                Slut
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-900 dark:text-neutral-100 block truncate">
                {endMetadata.dateString}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block tabular-nums">
                {endMetadata.timeString}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
