import React, { useRef } from 'react';
import { Calendar, Clock, Radio } from 'lucide-react';
import { DateMetadata } from '../types';

interface DateTimeInputProps {
  idPrefix: string;
  label: string;
  dateValue: string;
  timeValue: string;
  isNow: boolean;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  onToggleNow: (isNow: boolean) => void;
  metadata: DateMetadata;
  errorMessage?: string | null;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  idPrefix,
  label,
  dateValue,
  timeValue,
  isNow,
  onDateChange,
  onTimeChange,
  onToggleNow,
  metadata,
  errorMessage,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleDateContainerClick = () => {
    if (isNow) return;
    try {
      if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current?.focus();
      }
    } catch {
      dateInputRef.current?.focus();
    }
  };

  return (
    <div
      id={`${idPrefix}-container`}
      className={`relative p-3.5 sm:p-5 rounded-2xl border transition-all ${
        errorMessage
          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
          : isNow
          ? 'border-neutral-300 dark:border-neutral-700/80 bg-neutral-50/60 dark:bg-neutral-900/50 shadow-xs'
          : 'border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-[#13161B] shadow-xs'
      }`}
    >
      {/* Header bar with label and "Nu" toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
          {isNow && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Use Now toggle with comfortable tap target */}
        <button
          type="button"
          id={`${idPrefix}-btn-now`}
          onClick={() => onToggleNow(!isNow)}
          className={`flex items-center gap-1.5 min-h-[34px] px-3.5 py-1 text-xs font-medium rounded-xl transition-all ${
            isNow
              ? 'btn-liquid-glass-primary shadow-xs font-semibold'
              : 'btn-liquid-glass text-neutral-600 dark:text-neutral-300'
          }`}
          title={isNow ? 'Lås upp från Nu' : 'Ställ in på Nu (uppdateras live)'}
        >
          <Radio className={`w-3 h-3 ${isNow ? 'animate-pulse' : ''}`} />
          <span>Nu</span>
        </button>
      </div>

      {/* Inputs row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {/* Date input */}
        <div
          onClick={handleDateContainerClick}
          className={`sm:col-span-3 min-h-[44px] sm:min-h-[42px] min-w-0 relative flex items-center px-3 py-2 border rounded-xl transition-colors cursor-pointer ${
            isNow
              ? 'bg-neutral-100/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/50 cursor-default'
              : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 focus-within:border-neutral-900 dark:focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-900 dark:focus-within:ring-neutral-400'
          }`}
        >
          <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-2.5 shrink-0 pointer-events-none" />
          <input
            ref={dateInputRef}
            id={`${idPrefix}-date`}
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={isNow}
            className="w-full text-xs sm:text-sm font-medium bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none disabled:opacity-80 disabled:cursor-default [color-scheme:light] dark:[color-scheme:dark]"
            aria-label={`${label} datum`}
          />
        </div>

        {/* Time input */}
        <div
          className={`sm:col-span-2 min-h-[44px] sm:min-h-[42px] min-w-0 relative flex items-center px-3 py-2 border rounded-xl transition-colors ${
            isNow
              ? 'bg-neutral-100/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/50 cursor-default'
              : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 focus-within:border-neutral-900 dark:focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-900 dark:focus-within:ring-neutral-400'
          }`}
        >
          <Clock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-2.5 shrink-0 pointer-events-none" />
          <input
            ref={timeInputRef}
            id={`${idPrefix}-time`}
            type="time"
            step="1"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={isNow}
            className="w-full text-xs sm:text-sm font-medium font-mono tabular-nums bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none disabled:opacity-80 disabled:cursor-default [color-scheme:light] dark:[color-scheme:dark]"
            aria-label={`${label} tid`}
          />
        </div>
      </div>

      {/* Error message if invalid */}
      {errorMessage && (
        <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
          {errorMessage}
        </p>
      )}

      {/* Subtle date metadata pill row */}
      {metadata.weekdayName && metadata.weekdayName !== 'Ogiltigt' && (
        <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/70 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {metadata.weekdayName}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>Vecka {metadata.isoWeekNumber}</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>Dag {metadata.dayOfYear} av {metadata.daysInYear}</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>Q{metadata.quarter}</span>
          </div>

          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
            {metadata.daysRemainingInYear} d kvar av år
          </span>
        </div>
      )}
    </div>
  );
};
