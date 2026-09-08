import React from 'react';
import { Briefcase, Calendar, Check, Info } from 'lucide-react';
import { WorkingDaysInfo } from '../types';

interface WorkdayFilterControlProps {
  onlyWorkingDays: boolean;
  excludeSaturday: boolean;
  excludeSunday: boolean;
  workingDaysInfo: WorkingDaysInfo;
  onChangeOnlyWorkingDays: (val: boolean) => void;
  onChangeExcludeSaturday: (val: boolean) => void;
  onChangeExcludeSunday: (val: boolean) => void;
}

export const WorkdayFilterControl: React.FC<WorkdayFilterControlProps> = ({
  onlyWorkingDays,
  excludeSaturday,
  excludeSunday,
  workingDaysInfo,
  onChangeOnlyWorkingDays,
  onChangeExcludeSaturday,
  onChangeExcludeSunday,
}) => {
  return (
    <div
      id="workday-filter-container"
      className="glass-card p-3.5 sm:p-4 rounded-2xl hover:shadow-lg dark:hover:shadow-black/50 transition-all duration-300 ease-out hover:scale-[1.008]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Beräkningsläge
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Välj om beräkningen ska gälla alla dagar eller enbart vardagar/arbetsdagar
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div
          role="radiogroup"
          aria-label="Välj beräkningsläge"
          className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex p-1 bg-neutral-100/80 dark:bg-neutral-800/70 backdrop-blur-md rounded-2xl border border-neutral-200/90 dark:border-neutral-700/60 shrink-0 gap-1"
        >
          <button
            type="button"
            id="btn-mode-calendar-days"
            role="radio"
            aria-checked={!onlyWorkingDays}
            onClick={() => onChangeOnlyWorkingDays(false)}
            className={`flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[34px] px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              !onlyWorkingDays
                ? 'btn-liquid-glass font-semibold text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Alla dagar</span>
          </button>

          <button
            type="button"
            id="btn-mode-working-days"
            role="radio"
            aria-checked={onlyWorkingDays}
            onClick={() => onChangeOnlyWorkingDays(true)}
            className={`flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[34px] px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              onlyWorkingDays
                ? 'btn-liquid-glass-primary font-semibold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Endast arbetsdagar</span>
          </button>
        </div>
      </div>

      {/* Weekend Exclusion options and working days metrics when active */}
      {onlyWorkingDays && (
        <div
          id="workday-options-panel"
          className="mt-3.5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 shrink-0">
              Välj bort:
            </span>

            {/* Saturday exclusion toggle */}
            <button
              type="button"
              id="toggle-exclude-saturday"
              onClick={() => onChangeExcludeSaturday(!excludeSaturday)}
              className={`inline-flex items-center gap-2 min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                excludeSaturday
                  ? 'btn-liquid-pill-active'
                  : 'btn-liquid-glass text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                excludeSaturday
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}>
                {excludeSaturday && <Check className="w-3 h-3" />}
              </div>
              <span>Lördagar ({workingDaysInfo.saturdays} st)</span>
            </button>

            {/* Sunday exclusion toggle */}
            <button
              type="button"
              id="toggle-exclude-sunday"
              onClick={() => onChangeExcludeSunday(!excludeSunday)}
              className={`inline-flex items-center gap-2 min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                excludeSunday
                  ? 'btn-liquid-pill-active'
                  : 'btn-liquid-glass text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                excludeSunday
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}>
                {excludeSunday && <Check className="w-3 h-3" />}
              </div>
              <span>Söndagar ({workingDaysInfo.sundays} st)</span>
            </button>
          </div>

          {/* Quick summary stat pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/60 px-3 py-1.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/50">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="break-words">
              {workingDaysInfo.workingDays} arbetsdagar · {workingDaysInfo.weekendDays} helgdagar exkluderade (
              {workingDaysInfo.percentageWorkingDays}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
