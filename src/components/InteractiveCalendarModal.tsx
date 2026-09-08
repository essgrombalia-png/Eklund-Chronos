import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  Check,
  RotateCcw,
  ArrowLeftRight,
} from 'lucide-react';
import { DateTime } from 'luxon';
import {
  CalculationState,
  DateMetadata,
  DurationResult,
} from '../types';
import {
  calculateDuration,
  formatDateIso,
  parseDateTime,
  WorkingDaysOptions,
} from '../utils/dateCalculations';

interface InteractiveCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'start' | 'end';
  onSelectDate: (dateStr: string, target: 'start' | 'end') => void;
  state: CalculationState;
  startMetadata: DateMetadata;
  endMetadata: DateMetadata;
}

interface HoverPreviewData {
  targetDateIso: string;
  targetDt: DateTime;
  duration: DurationResult;
  isBeforeAnchor: boolean;
  isSameDay: boolean;
  isAfterAnchor: boolean;
  dayName: string;
  formattedDate: string;
  isoWeek: number;
}

const MONTH_NAMES_SV = [
  'Januari',
  'Februari',
  'Mars',
  'April',
  'Maj',
  'Juni',
  'Juli',
  'Augusti',
  'September',
  'Oktober',
  'November',
  'December',
];

export const InteractiveCalendarModal: React.FC<InteractiveCalendarModalProps> = ({
  isOpen,
  onClose,
  target: initialTarget,
  onSelectDate,
  state,
}) => {
  const [activeTarget, setActiveTarget] = useState<'start' | 'end'>(initialTarget);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  
  // Sync active target when initialTarget prop changes
  useEffect(() => {
    setActiveTarget(initialTarget);
  }, [initialTarget]);

  // Current view year and month (always clamped to start of month to prevent day-31 overflow bugs)
  const [viewDate, setViewDate] = useState<DateTime>(() => {
    const baseDate = initialTarget === 'end' ? state.endDate : state.startDate;
    const parsed = parseDateTime(baseDate, '12:00:00', state.timezone);
    return (parsed.isValid ? parsed : DateTime.now().setZone(state.timezone)).startOf('month');
  });

  // When opening modal or switching target, align viewDate with that target's date
  useEffect(() => {
    if (isOpen) {
      const baseDate = activeTarget === 'end' ? state.endDate : state.startDate;
      const parsed = parseDateTime(baseDate, '12:00:00', state.timezone);
      if (parsed.isValid) {
        setViewDate(parsed.startOf('month'));
      }
      setIsMonthPickerOpen(false);
    }
  }, [isOpen, activeTarget, state.startDate, state.endDate, state.timezone]);

  // Hovered or focused date
  const [hoveredDateIso, setHoveredDateIso] = useState<string | null>(null);

  // Now DateTime in user timezone
  const nowDt = useMemo(() => {
    return DateTime.now().setZone(state.timezone);
  }, [state.timezone]);

  // Anchor DateTime based on target
  // If picking 'end', the anchor is start date + start time.
  // If picking 'start', the anchor is end date + end time.
  const anchorDt = useMemo(() => {
    if (activeTarget === 'end') {
      return parseDateTime(state.startDate, state.startTime, state.timezone);
    } else {
      return parseDateTime(state.endDate, state.endTime, state.timezone);
    }
  }, [activeTarget, state.startDate, state.startTime, state.endDate, state.endTime, state.timezone]);

  // Target time (use start time if picking start, end time if picking end)
  const targetTime = activeTarget === 'end' ? state.endTime : state.startTime;

  // Selected date ISO for active target
  const selectedDateIso = activeTarget === 'end' ? state.endDate : state.startDate;

  // Working days options
  const workingDaysOptions: WorkingDaysOptions = useMemo(() => {
    return {
      onlyWorkingDays: state.onlyWorkingDays,
      excludeSaturday: state.excludeSaturday,
      excludeSunday: state.excludeSunday,
    };
  }, [state.onlyWorkingDays, state.excludeSaturday, state.excludeSunday]);

  // Effective preview date: either hovered date or the currently selected date
  const activePreviewIso = hoveredDateIso || selectedDateIso;

  // Real-time preview calculation
  const previewData = useMemo<HoverPreviewData | null>(() => {
    if (!activePreviewIso || !anchorDt.isValid) return null;

    const targetDt = parseDateTime(activePreviewIso, targetTime, state.timezone);
    if (!targetDt.isValid) return null;

    // Calculate duration between anchor and target date
    const startForCalc = activeTarget === 'end' ? anchorDt : targetDt;
    const endForCalc = activeTarget === 'end' ? targetDt : anchorDt;

    const duration = calculateDuration(startForCalc, endForCalc, nowDt, workingDaysOptions);

    const anchorDateIso = activeTarget === 'end' ? state.startDate : state.endDate;
    const isSameDay = activePreviewIso === anchorDateIso;
    const isBeforeAnchor = targetDt.toMillis() < anchorDt.toMillis();
    const isAfterAnchor = targetDt.toMillis() > anchorDt.toMillis();

    return {
      targetDateIso: activePreviewIso,
      targetDt,
      duration,
      isBeforeAnchor,
      isSameDay,
      isAfterAnchor,
      dayName: targetDt.setLocale('sv').toFormat('cccc'),
      formattedDate: targetDt.setLocale('sv').toFormat('d MMMM yyyy'),
      isoWeek: targetDt.weekNumber,
    };
  }, [
    activePreviewIso,
    anchorDt,
    activeTarget,
    targetTime,
    state.timezone,
    state.startDate,
    state.endDate,
    nowDt,
    workingDaysOptions,
  ]);

  // Calendar month matrix generator
  const { monthName, year, weeks } = useMemo(() => {
    const year = viewDate.year;
    const monthName = viewDate.setLocale('sv').toFormat('LLLL yyyy');

    const firstDayOfMonth = viewDate.startOf('month');
    const daysInMonth = viewDate.daysInMonth || 30;

    // Luxon weekday: 1 = Monday, 7 = Sunday
    const startWeekday = firstDayOfMonth.weekday; // 1 (Mon) to 7 (Sun)
    const prevMonthDaysToShow = startWeekday - 1;

    const days: Array<{
      dateIso: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isStart: boolean;
      isEnd: boolean;
      isInSelectedRange: boolean;
      isWeekend: boolean;
      isoWeek: number;
    }> = [];

    const todayIso = nowDt.toFormat('yyyy-MM-dd');
    const startIso = state.startDate;
    const endIso = state.endDate;

    const startMillis = parseDateTime(startIso, '00:00:00', state.timezone).toMillis();
    const endMillis = parseDateTime(endIso, '00:00:00', state.timezone).toMillis();
    const minSelectedMillis = Math.min(startMillis, endMillis);
    const maxSelectedMillis = Math.max(startMillis, endMillis);

    // Days from previous month
    const prevMonth = firstDayOfMonth.minus({ months: 1 });
    const prevMonthDaysCount = prevMonth.daysInMonth || 31;
    for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const d = prevMonth.set({ day: dayNum });
      const dateIso = d.toFormat('yyyy-MM-dd');
      const dMillis = d.toMillis();
      const isWeekend = d.weekday === 6 || d.weekday === 7;

      days.push({
        dateIso,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateIso === todayIso,
        isStart: dateIso === startIso,
        isEnd: dateIso === endIso,
        isInSelectedRange: dMillis >= minSelectedMillis && dMillis <= maxSelectedMillis,
        isWeekend,
        isoWeek: d.weekNumber,
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = firstDayOfMonth.set({ day: dayNum });
      const dateIso = d.toFormat('yyyy-MM-dd');
      const dMillis = d.toMillis();
      const isWeekend = d.weekday === 6 || d.weekday === 7;

      days.push({
        dateIso,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateIso === todayIso,
        isStart: dateIso === startIso,
        isEnd: dateIso === endIso,
        isInSelectedRange: dMillis >= minSelectedMillis && dMillis <= maxSelectedMillis,
        isWeekend,
        isoWeek: d.weekNumber,
      });
    }

    // Trailing days from next month to complete 6 weeks (42 days)
    const remainingDays = 42 - days.length;
    const nextMonth = firstDayOfMonth.plus({ months: 1 });
    for (let dayNum = 1; dayNum <= remainingDays; dayNum++) {
      const d = nextMonth.set({ day: dayNum });
      const dateIso = d.toFormat('yyyy-MM-dd');
      const dMillis = d.toMillis();
      const isWeekend = d.weekday === 6 || d.weekday === 7;

      days.push({
        dateIso,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateIso === todayIso,
        isStart: dateIso === startIso,
        isEnd: dateIso === endIso,
        isInSelectedRange: dMillis >= minSelectedMillis && dMillis <= maxSelectedMillis,
        isWeekend,
        isoWeek: d.weekNumber,
      });
    }

    // Split into 6 weeks of 7 days
    const weeksList: Array<{ weekNumber: number; days: typeof days }> = [];
    for (let w = 0; w < 6; w++) {
      const weekDays = days.slice(w * 7, (w + 1) * 7);
      weeksList.push({
        weekNumber: weekDays[0].isoWeek,
        days: weekDays,
      });
    }

    return {
      monthName,
      year,
      weeks: weeksList,
    };
  }, [viewDate, state.startDate, state.endDate, state.timezone, nowDt]);

  // Safe navigation handlers
  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => prev.startOf('month').minus({ months: 1 }));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => prev.startOf('month').plus({ months: 1 }));
  }, []);

  const handlePrevYear = useCallback(() => {
    setViewDate((prev) => prev.startOf('month').minus({ years: 1 }));
  }, []);

  const handleNextYear = useCallback(() => {
    setViewDate((prev) => prev.startOf('month').plus({ years: 1 }));
  }, []);

  const handleGoToToday = useCallback(() => {
    setViewDate(nowDt.startOf('month'));
  }, [nowDt]);

  const handleGoToStart = useCallback(() => {
    const parsed = parseDateTime(state.startDate, '12:00:00', state.timezone);
    if (parsed.isValid) setViewDate(parsed.startOf('month'));
  }, [state.startDate, state.timezone]);

  const handleGoToEnd = useCallback(() => {
    const parsed = parseDateTime(state.endDate, '12:00:00', state.timezone);
    if (parsed.isValid) setViewDate(parsed.startOf('month'));
  }, [state.endDate, state.timezone]);

  const handleSelectMonth = useCallback((monthIndex: number) => {
    setViewDate((prev) => prev.set({ month: monthIndex + 1 }).startOf('month'));
    setIsMonthPickerOpen(false);
  }, []);

  const handleYearChange = useCallback((newYear: number) => {
    if (!isNaN(newYear) && newYear >= 1900 && newYear <= 2100) {
      setViewDate((prev) => prev.set({ year: newYear }).startOf('month'));
    }
  }, []);

  // Selection handler
  const handleSelectDay = useCallback((dateIso: string) => {
    onSelectDate(dateIso, activeTarget);
    onClose();
  }, [activeTarget, onSelectDate, onClose]);

  // Quick preset offsets from anchor
  const handleApplyOffset = useCallback((offsetUnit: 'days' | 'months' | 'years', amount: number) => {
    if (!anchorDt.isValid) return;
    const targetDt = anchorDt.plus({ [offsetUnit]: amount });
    const targetIso = formatDateIso(targetDt);
    onSelectDate(targetIso, activeTarget);
    onClose();
  }, [anchorDt, activeTarget, onSelectDate, onClose]);

  const handleApplyEndOfMonth = useCallback(() => {
    if (!anchorDt.isValid) return;
    const targetDt = anchorDt.endOf('month');
    const targetIso = formatDateIso(targetDt);
    onSelectDate(targetIso, activeTarget);
    onClose();
  }, [anchorDt, activeTarget, onSelectDate, onClose]);

  const handleApplyEndOfYear = useCallback(() => {
    if (!anchorDt.isValid) return;
    const targetDt = anchorDt.endOf('year');
    const targetIso = formatDateIso(targetDt);
    onSelectDate(targetIso, activeTarget);
    onClose();
  }, [anchorDt, activeTarget, onSelectDate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#11141B] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-3 shrink-0 bg-neutral-50/70 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="calendar-modal-title"
                  className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100"
                >
                  Interaktiv Kalender
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  Realtid
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Peka på valfri dag för omedelbar framräkning av intervall och arbetsdagar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass w-8 h-8 rounded-xl shrink-0"
            aria-label="Stäng kalender"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Switcher & Anchor Details */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-neutral-100/50 dark:bg-neutral-900/60 border-b border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-neutral-800/90 p-0.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTarget('end')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTarget === 'end'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Välj Slutdatum (End)
            </button>
            <button
              type="button"
              onClick={() => setActiveTarget('start')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTarget === 'start'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Välj Startdatum (Start)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
            <span className="text-neutral-400 dark:text-neutral-500">Mätreferens:</span>
            <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200/80 dark:border-neutral-700">
              {activeTarget === 'end'
                ? `Start: ${state.startDate} ${state.startTime.slice(0, 5)}`
                : `Slut: ${state.endDate} ${state.endTime.slice(0, 5)}`}
            </span>
          </div>
        </div>

        {/* Quick Offset Presets Row */}
        <div className="px-4 py-2 sm:px-6 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs bg-white dark:bg-[#11141B]">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
            Snabbval:
          </span>
          <button
            type="button"
            onClick={() => handleApplyOffset('days', 1)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +1 dag
          </button>
          <button
            type="button"
            onClick={() => handleApplyOffset('days', 7)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +7 dagar
          </button>
          <button
            type="button"
            onClick={() => handleApplyOffset('days', 14)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +14 dagar
          </button>
          <button
            type="button"
            onClick={() => handleApplyOffset('days', 30)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +30 dagar
          </button>
          <button
            type="button"
            onClick={() => handleApplyOffset('months', 1)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +1 månad
          </button>
          <button
            type="button"
            onClick={() => handleApplyOffset('months', 3)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +3 mån (Q)
          </button>
          <button
            type="button"
            onClick={() => handleApplyOffset('years', 1)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            +1 år
          </button>
          <button
            type="button"
            onClick={handleApplyEndOfMonth}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            Månadsslut
          </button>
          <button
            type="button"
            onClick={handleApplyEndOfYear}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors shrink-0"
          >
            Årsslut
          </button>
        </div>

        {/* Month Navigation & Selector Bar */}
        <div className="px-4 py-3 sm:px-6 flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-900/20">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Föregående år"
            >
              <span className="text-[10px] font-mono font-bold px-0.5">«</span>
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Föregående månad"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="px-2.5 py-1 rounded-xl text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors capitalize flex items-center gap-1.5"
            >
              <span>{monthName}</span>
              <span className="text-[10px] text-neutral-400">▾</span>
            </button>

            {/* Quick Jumps */}
            <div className="hidden xs:flex items-center gap-1">
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-neutral-200/70 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                Idag
              </button>
              <button
                type="button"
                onClick={activeTarget === 'end' ? handleGoToStart : handleGoToEnd}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-neutral-200/70 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                title={activeTarget === 'end' ? 'Gå till Startmånad' : 'Gå till Slutmånad'}
              >
                {activeTarget === 'end' ? 'Start' : 'Slut'}
              </button>
            </div>

            {/* Month dropdown popover */}
            {isMonthPickerOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-40 w-64 p-3 bg-white dark:bg-[#161922] border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-500">Välj Månad ({year})</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleYearChange(year - 1)}
                      className="p-1 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      -1 år
                    </button>
                    <button
                      type="button"
                      onClick={() => handleYearChange(year + 1)}
                      className="p-1 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      +1 år
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_NAMES_SV.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMonth(idx)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        viewDate.month === idx + 1
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {m.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Nästa månad"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Nästa år"
            >
              <span className="text-[10px] font-mono font-bold px-0.5">»</span>
            </button>
          </div>
        </div>

        {/* Calendar Matrix with Weekday Headers */}
        <div className="p-3 sm:p-5 overflow-x-auto relative">
          <div className="min-w-[320px]">
            {/* Weekday headers */}
            <div className="grid grid-cols-[32px_repeat(7,1fr)] gap-1 mb-1.5 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              <span className="text-[10px] flex items-center justify-center font-mono opacity-60">V.</span>
              <span>Mån</span>
              <span>Tis</span>
              <span>Ons</span>
              <span>Tor</span>
              <span>Fre</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Lör</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Sön</span>
            </div>

            {/* Weeks and Days Grid */}
            <div className="space-y-1">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="grid grid-cols-[32px_repeat(7,1fr)] gap-1 items-center">
                  {/* Week number */}
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 text-center select-none">
                    {week.weekNumber}
                  </span>

                  {/* 7 Days in Week */}
                  {week.days.map((day) => {
                    const isSelectedTarget =
                      activeTarget === 'end' ? day.dateIso === state.endDate : day.dateIso === state.startDate;
                    const isOtherEndpoint =
                      activeTarget === 'end' ? day.dateIso === state.startDate : day.dateIso === state.endDate;
                    const isHovered = day.dateIso === hoveredDateIso;

                    return (
                      <button
                        key={day.dateIso}
                        type="button"
                        onClick={() => handleSelectDay(day.dateIso)}
                        onMouseEnter={() => setHoveredDateIso(day.dateIso)}
                        onMouseLeave={() => setHoveredDateIso(null)}
                        className={`relative h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-medium transition-colors flex flex-col items-center justify-center select-none ${
                          isSelectedTarget
                            ? 'bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold shadow-md ring-2 ring-neutral-950 dark:ring-neutral-100 z-10'
                            : isOtherEndpoint
                            ? 'bg-neutral-200/90 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold ring-1 ring-neutral-400 dark:ring-neutral-600'
                            : isHovered
                            ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500 dark:ring-sky-400 z-10'
                            : day.isInSelectedRange
                            ? 'bg-sky-50/70 dark:bg-sky-950/30 text-neutral-900 dark:text-neutral-100 font-semibold'
                            : day.isCurrentMonth
                            ? day.isWeekend
                              ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                              : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                            : 'text-neutral-300 dark:text-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                        }`}
                      >
                        <span className="tabular-nums leading-none">{day.dayNumber}</span>

                        {/* Today indicator dot */}
                        {day.isToday && !isSelectedTarget && (
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                        )}

                        {/* Start / End badge tags */}
                        {day.isStart && (
                          <span className="text-[8px] uppercase tracking-tighter font-bold absolute bottom-0.5 leading-none">
                            Start
                          </span>
                        )}
                        {day.isEnd && !day.isStart && (
                          <span className="text-[8px] uppercase tracking-tighter font-bold absolute bottom-0.5 leading-none">
                            Slut
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Persistent Micro-Preview Panel at Bottom of Modal */}
        <div className="p-3.5 sm:p-5 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/95 dark:bg-[#0D0F14]/95 backdrop-blur-md shrink-0">
          {previewData ? (
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                    {previewData.dayName} {previewData.formattedDate}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                    (V.{previewData.isoWeek})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {previewData.isSameDay ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      Samma dag (0 d)
                    </span>
                  ) : previewData.isAfterAnchor ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Framåt i tiden (+)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Bakåt i tiden (-)
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Formatted Duration Preview */}
              <div className="flex flex-wrap items-baseline gap-2 py-0.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Beräknat tidsomfång:
                </span>
                <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                  {previewData.duration.primaryFormatted || '0 sekunder'}
                </span>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  {previewData.duration.timeFormatted}
                </span>
              </div>

              {/* Detailed metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-xs shadow-2xs">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Totalt dagar</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
                    {previewData.duration.totals.totalDays.toLocaleString('sv-SE')} d
                  </div>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-xs shadow-2xs">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Arbetsdagar</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
                    {previewData.duration.workingDaysInfo.workingDays.toLocaleString('sv-SE')} d
                  </div>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-xs shadow-2xs">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Totalt timmar</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
                    {previewData.duration.totals.totalHours.toLocaleString('sv-SE')} h
                  </div>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-xs shadow-2xs">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Veckor</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
                    {previewData.duration.totals.totalWeeks.toLocaleString('sv-SE')} v
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Klicka på valfritt datum för att välja direkt
                </span>

                <button
                  type="button"
                  onClick={() => handleSelectDay(previewData.targetDateIso)}
                  className="btn-liquid-glass-primary px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Välj {previewData.targetDateIso}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400 py-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                <span>Peka på valfri dag i kalendern för att förhandsgranska tidsintervallet i realtid.</span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Klicka för att välja
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
