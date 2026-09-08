import React from 'react';
import { ArrowLeftRight, RotateCcw } from 'lucide-react';
import { DateTimeInput } from './DateTimeInput';
import { DateMetadata } from '../types';

interface DateRangeSectionProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startIsNow: boolean;
  endIsNow: boolean;
  onStartDateChange: (val: string) => void;
  onStartTimeChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onEndTimeChange: (val: string) => void;
  onToggleStartNow: (val: boolean) => void;
  onToggleEndNow: (val: boolean) => void;
  onSwap: () => void;
  onReset: () => void;
  startMetadata: DateMetadata;
  endMetadata: DateMetadata;
  startError?: string | null;
  endError?: string | null;
  onOpenCalendar?: (target: 'start' | 'end') => void;
}

export const DateRangeSection: React.FC<DateRangeSectionProps> = ({
  startDate,
  startTime,
  endDate,
  endTime,
  startIsNow,
  endIsNow,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onToggleStartNow,
  onToggleEndNow,
  onSwap,
  onReset,
  startMetadata,
  endMetadata,
  startError,
  endError,
  onOpenCalendar,
}) => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        {/* Start Date */}
        <DateTimeInput
          idPrefix="start-date"
          label="Startdatum & tid"
          dateValue={startDate}
          timeValue={startTime}
          isNow={startIsNow}
          onDateChange={onStartDateChange}
          onTimeChange={onStartTimeChange}
          onToggleNow={onToggleStartNow}
          metadata={startMetadata}
          errorMessage={startError}
          onOpenCalendar={onOpenCalendar ? () => onOpenCalendar('start') : undefined}
        />

        {/* Swap button & Reset center column */}
        <div className="flex md:flex-col items-center justify-center gap-2.5 py-1 md:py-0">
          <button
            type="button"
            id="btn-swap-dates"
            onClick={onSwap}
            className="group btn-liquid-glass min-w-[44px] min-h-[44px] w-11 h-11 md:w-10 md:h-10 rounded-full shadow-xs"
            title="Växla plats på start- och slutdatum (Kortkommando: S)"
            aria-label="Växla start- och slutdatum"
          >
            <ArrowLeftRight className="w-4 h-4 text-neutral-700 dark:text-neutral-200 transition-transform duration-300 rotate-90 md:rotate-0 group-hover:scale-110 group-active:rotate-180" />
            <span className="sr-only">Växla</span>
          </button>

          <button
            type="button"
            id="btn-reset-dates"
            onClick={onReset}
            className="group btn-liquid-glass min-w-[38px] min-h-[38px] w-9 h-9 md:w-8.5 md:h-8.5 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            title="Återställ datum till standard (Kortkommando: R)"
            aria-label="Återställ beräkning"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-rotate-90" />
            <span className="sr-only">Återställ</span>
          </button>
        </div>

        {/* End Date */}
        <DateTimeInput
          idPrefix="end-date"
          label="Slutdatum & tid"
          dateValue={endDate}
          timeValue={endTime}
          isNow={endIsNow}
          onDateChange={onEndDateChange}
          onTimeChange={onEndTimeChange}
          onToggleNow={onToggleEndNow}
          metadata={endMetadata}
          errorMessage={endError}
          onOpenCalendar={onOpenCalendar ? () => onOpenCalendar('end') : undefined}
        />
      </div>
    </div>
  );
};
