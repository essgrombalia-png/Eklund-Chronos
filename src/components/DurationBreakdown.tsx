import React from 'react';
import { Copy, Briefcase, CalendarOff } from 'lucide-react';
import { DurationTotalsData, WorkingDaysInfo } from '../types';

interface DurationBreakdownProps {
  totals: DurationTotalsData;
  workingDaysInfo?: WorkingDaysInfo;
  onCopyText: (text: string, label: string) => void;
}

export const DurationBreakdown: React.FC<DurationBreakdownProps> = ({
  totals,
  workingDaysInfo,
  onCopyText,
}) => {
  // Format number with standard Swedish space separation
  const formatNumber = (num: number, decimals: number = 0): string => {
    if (decimals === 0) {
      return Math.floor(num).toLocaleString('sv-SE');
    }
    return num.toLocaleString('sv-SE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const statItems = [
    {
      id: 'stat-days',
      label: 'Totala dagar',
      value: formatNumber(totals.totalDays, 0),
      rawNumber: totals.totalDays.toString(),
      unit: 'dagar',
    },
    {
      id: 'stat-hours',
      label: 'Totala timmar',
      value: formatNumber(totals.totalHours),
      rawNumber: totals.totalHours.toString(),
      unit: 'timmar',
    },
    {
      id: 'stat-minutes',
      label: 'Totala minuter',
      value: formatNumber(totals.totalMinutes),
      rawNumber: totals.totalMinutes.toString(),
      unit: 'minuter',
    },
    {
      id: 'stat-seconds',
      label: 'Totala sekunder',
      value: formatNumber(totals.totalSeconds),
      rawNumber: totals.totalSeconds.toString(),
      unit: 'sekunder',
    },
    {
      id: 'stat-weeks',
      label: 'Totala veckor',
      value: formatNumber(totals.totalWeeks, 1),
      rawNumber: totals.totalWeeks.toString(),
      unit: 'veckor',
    },
    {
      id: 'stat-months',
      label: 'Totala månader',
      value: formatNumber(totals.totalMonths, 1),
      rawNumber: totals.totalMonths.toString(),
      unit: 'månader',
    },
    {
      id: 'stat-milliseconds',
      label: 'Millisekunder',
      value: formatNumber(totals.totalMilliseconds),
      rawNumber: totals.totalMilliseconds.toString(),
      unit: 'ms',
    },
  ];

  return (
    <div
      id="duration-breakdown-container"
      className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/85 dark:bg-[#11141b]/85 backdrop-blur-xl overflow-hidden shadow-xs ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
    >
      <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Totalt tidsintervall
        </span>
        <span className="text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500">
          Klicka för att kopiera
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-neutral-100 dark:divide-neutral-800/80">
        {statItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onCopyText(item.rawNumber, `${item.label} kopierat`)}
            className="group relative p-3.5 sm:p-5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 active:bg-neutral-100 dark:active:bg-neutral-800/70 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Kopiera ${item.label}: ${item.value}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCopyText(item.rawNumber, `${item.label} kopierat`);
              }
            }}
          >
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                {item.label}
              </span>
              <Copy className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity shrink-0" />
            </div>

            <div
              className="text-base xs:text-lg sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight tabular-nums truncate"
              title={`${item.value} ${item.unit}`}
            >
              {item.value}
            </div>

            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
              {item.unit}
            </div>
          </div>
        ))}

        {/* 8th cell: summary note */}
        <div className="p-3.5 sm:p-5 flex flex-col justify-between bg-neutral-50/40 dark:bg-neutral-900/30">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Precision
          </span>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Exakt kalenderbaserad beräkning med skottår och tidszoner.
          </div>
        </div>
      </div>

      {/* Dedicated Workdays & Weekends breakdown section */}
      {workingDaysInfo && (
        <div className="border-t border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50/50 dark:bg-[#111418]">
          <div className="px-4 py-3 sm:px-6 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/70">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Arbetsdags- och helgfördelning
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {workingDaysInfo.percentageWorkingDays}% arbetsdagar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-200/60 dark:divide-neutral-800/70">
            {/* Arbetsdagar */}
            <div
              onClick={() =>
                onCopyText(workingDaysInfo.workingDays.toString(), 'Arbetsdagar kopierat')
              }
              className="p-3.5 sm:p-4 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Arbetsdagar
                </span>
                <Copy className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div
                className="text-base sm:text-xl font-semibold font-mono text-amber-700 dark:text-amber-300 tabular-nums truncate"
                title={`${formatNumber(workingDaysInfo.workingDays, 0)} vardagar`}
              >
                {formatNumber(workingDaysInfo.workingDays, 0)}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
                vardagar (mån–fre)
              </div>
            </div>

            {/* Exkluderade helgdagar */}
            <div
              onClick={() =>
                onCopyText(workingDaysInfo.weekendDays.toString(), 'Helgdagar kopierat')
              }
              className="p-3.5 sm:p-4 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Helgdagar
                </span>
                <CalendarOff className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
              </div>
              <div
                className="text-base sm:text-xl font-semibold font-mono text-neutral-800 dark:text-neutral-200 tabular-nums truncate"
                title={`${workingDaysInfo.weekendDays} helgdagar`}
              >
                {workingDaysInfo.weekendDays}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
                {workingDaysInfo.saturdays} lör · {workingDaysInfo.sundays} sön
              </div>
            </div>

            {/* Arbetsveckor */}
            <div
              onClick={() =>
                onCopyText(workingDaysInfo.workingWeeks.toString(), 'Arbetsveckor kopierat')
              }
              className="p-3.5 sm:p-4 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Arbetsveckor
                </span>
                <Copy className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div
                className="text-base sm:text-xl font-semibold font-mono text-neutral-800 dark:text-neutral-200 tabular-nums truncate"
                title={`${formatNumber(workingDaysInfo.workingWeeks, 1)} arbetsveckor`}
              >
                {formatNumber(workingDaysInfo.workingWeeks, 1)}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
                5 dagars arbetsveckor
              </div>
            </div>

            {/* Standard arbetstimmar (8h/dag) */}
            <div
              onClick={() =>
                onCopyText(
                  workingDaysInfo.standardWorkHours8h.toString(),
                  'Arbetstimmar (8h) kopierat'
                )
              }
              className="p-3.5 sm:p-4 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Arbetstid (8h/dag)
                </span>
                <Copy className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div
                className="text-base sm:text-xl font-semibold font-mono text-neutral-800 dark:text-neutral-200 tabular-nums truncate"
                title={`${formatNumber(workingDaysInfo.standardWorkHours8h, 0)} timmar`}
              >
                {formatNumber(workingDaysInfo.standardWorkHours8h, 0)}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
                timmar totalt
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
