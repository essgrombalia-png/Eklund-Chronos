import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { DateMetadata } from '../types';

interface DateMetadataCardProps {
  startMetadata: DateMetadata;
  endMetadata: DateMetadata;
  onCopyText: (text: string, label: string) => void;
}

export const DateMetadataCard: React.FC<DateMetadataCardProps> = ({
  startMetadata,
  endMetadata,
  onCopyText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderColumn = (label: string, meta: DateMetadata) => {
    return (
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
            {meta.dateString} {meta.timeString}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">Veckodag</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{meta.weekdayName}</span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">Veckonummer (ISO)</span>
            <span className="font-medium font-mono text-neutral-800 dark:text-neutral-200 tabular-nums">
              Vecka {meta.isoWeekNumber}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">Dag på året</span>
            <span className="font-medium font-mono text-neutral-800 dark:text-neutral-200 tabular-nums">
              {meta.dayOfYear} av {meta.daysInYear}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">Kvartal</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Q{meta.quarter}</span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">Dagar kvar av år</span>
            <span className="font-medium font-mono text-neutral-800 dark:text-neutral-200 tabular-nums">
              {meta.daysRemainingInYear} dagar
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">Skottår</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {meta.isLeapYear ? 'Ja (366 d)' : 'Nej (365 d)'}
            </span>
          </div>

          <div className="col-span-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Unix timestamp</span>
              <button
                type="button"
                onClick={() =>
                  onCopyText(meta.unixTimestampSeconds.toString(), 'Unix timestamp kopierad')
                }
                className="btn-liquid-glass flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                title="Kopiera Unix timestamp"
              >
                <span className="tabular-nums">{meta.unixTimestampSeconds}</span>
                <Copy className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">ISO 8601</span>
              <button
                type="button"
                onClick={() => onCopyText(meta.isoString, 'ISO 8601 kopierad')}
                className="btn-liquid-glass flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 max-w-[190px] xs:max-w-[240px] sm:max-w-[300px]"
                title="Kopiera ISO-sträng"
              >
                <span className="truncate">{meta.isoString}</span>
                <Copy className="w-3 h-3 shrink-0 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id="date-details-container"
      className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/85 dark:bg-[#11141b]/85 backdrop-blur-xl overflow-hidden shadow-xs ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 active:bg-neutral-100 dark:active:bg-neutral-800/60 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Fördjupade Datumdetaljer
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 hidden sm:inline">
            (Veckonummer, kvartal, dag på året, Unix timestamp)
          </span>
        </div>

        <div className="btn-liquid-pill px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 rounded-full shrink-0 shadow-2xs font-medium">
          <span>{isExpanded ? 'Dölj' : 'Visa detaljer'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-5 pt-2 sm:px-6 sm:pb-6 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col md:flex-row gap-5 sm:gap-6">
          {renderColumn('Startdatum detaljer', startMetadata)}
          <div className="hidden md:block w-[1px] bg-neutral-200/80 dark:border-neutral-800/80 self-stretch" />
          {renderColumn('Slutdatum detaljer', endMetadata)}
        </div>
      )}
    </div>
  );
};
