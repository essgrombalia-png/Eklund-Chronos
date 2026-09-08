import React, { useState, useMemo } from 'react';
import { DateTime } from 'luxon';
import {
  GitCompare,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  TrendingUp,
  TrendingDown,
  Scale,
  Milestone,
  Check,
  Split,
  ChevronRight,
} from 'lucide-react';
import { DurationResult } from '../types';
import {
  calculateDuration,
  formatDateIso,
  formatTimeIso,
  parseDateTime,
  getNowInZone,
  getDateMetadata,
} from '../utils/dateCalculations';

interface ComparisonViewProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startIsNow: boolean;
  endIsNow: boolean;
  timezone: string;
  currentNow: DateTime;
  baseDurationResult: DurationResult;
  onCopyText: (text: string, label: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  startDate,
  startTime,
  endDate,
  endTime,
  startIsNow,
  endIsNow,
  timezone,
  currentNow,
  baseDurationResult,
  onCopyText,
}) => {
  // Initialize third date C (default: 30 days after end date or 1 month ahead)
  const [compareDate, setCompareDate] = useState<string>(() => {
    const end = endIsNow
      ? currentNow
      : parseDateTime(endDate, endTime, timezone);
    const defaultThird = end.isValid ? end.plus({ days: 30 }) : currentNow.plus({ days: 30 });
    return formatDateIso(defaultThird);
  });

  const [compareTime, setCompareTime] = useState<string>('00:00:00');
  const [compareIsNow, setCompareIsNow] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute DateTime instances
  const dtA = useMemo(() => {
    if (startIsNow) return currentNow;
    return parseDateTime(startDate, startTime, timezone);
  }, [startIsNow, startDate, startTime, timezone, currentNow]);

  const dtB = useMemo(() => {
    if (endIsNow) return currentNow;
    return parseDateTime(endDate, endTime, timezone);
  }, [endIsNow, endDate, endTime, timezone, currentNow]);

  const dtC = useMemo(() => {
    if (compareIsNow) return currentNow;
    return parseDateTime(compareDate, compareTime, timezone);
  }, [compareIsNow, compareDate, compareTime, timezone, currentNow]);

  // Comparison Calculations
  const durationAC = useMemo(() => {
    return calculateDuration(dtA, dtC, currentNow);
  }, [dtA, dtC, currentNow]);

  const durationBC = useMemo(() => {
    return calculateDuration(dtB, dtC, currentNow);
  }, [dtB, dtC, currentNow]);

  // Milliseconds & Day totals
  const millisAB = Math.abs(dtB.toMillis() - dtA.toMillis());
  const millisAC = Math.abs(dtC.toMillis() - dtA.toMillis());
  const millisBC = Math.abs(dtC.toMillis() - dtB.toMillis());

  const daysAB = baseDurationResult.totals.totalDays;
  const daysAC = durationAC.totals.totalDays;
  const daysBC = durationBC.totals.totalDays;

  // Delta between Range [A -> C] and Base Range [A -> B]
  const diffDays = daysAC - daysAB;
  const diffPercent = daysAB > 0 ? ((daysAC - daysAB) / daysAB) * 100 : 0;
  const diffHours = (millisAC - millisAB) / (1000 * 60 * 60);

  // Relative Position of Date C compared to [A, B]
  const relativePosition = useMemo(() => {
    if (!dtA.isValid || !dtB.isValid || !dtC.isValid) return 'unknown';

    const minM = Math.min(dtA.toMillis(), dtB.toMillis());
    const maxM = Math.max(dtA.toMillis(), dtB.toMillis());
    const cMillis = dtC.toMillis();

    if (cMillis < minM) return 'before_start';
    if (cMillis > maxM) return 'after_end';
    if (cMillis === minM) return 'at_start';
    if (cMillis === maxM) return 'at_end';
    return 'inside_interval';
  }, [dtA, dtB, dtC]);

  // Percentage inside interval if applicable
  const positionPercentage = useMemo(() => {
    if (relativePosition !== 'inside_interval') return null;
    const minM = Math.min(dtA.toMillis(), dtB.toMillis());
    const maxM = Math.max(dtA.toMillis(), dtB.toMillis());
    const total = maxM - minM;
    if (total <= 0) return 0;
    return Number((((dtC.toMillis() - minM) / total) * 100).toFixed(1));
  }, [relativePosition, dtA, dtB, dtC]);

  // Metadata for C
  const metadataC = useMemo(() => getDateMetadata(dtC), [dtC]);

  // Quick preset actions for Date C
  const handleSetPreset = (type: 'now' | 'plus_7d' | 'plus_30d' | 'plus_90d' | 'plus_1y' | 'midpoint' | 'double') => {
    setCompareIsNow(false);

    if (type === 'now') {
      setCompareIsNow(true);
      return;
    }

    if (!dtB.isValid || !dtA.isValid) return;

    if (type === 'plus_7d') {
      const next = dtB.plus({ days: 7 });
      setCompareDate(formatDateIso(next));
      setCompareTime(formatTimeIso(next));
    } else if (type === 'plus_30d') {
      const next = dtB.plus({ days: 30 });
      setCompareDate(formatDateIso(next));
      setCompareTime(formatTimeIso(next));
    } else if (type === 'plus_90d') {
      const next = dtB.plus({ days: 90 });
      setCompareDate(formatDateIso(next));
      setCompareTime(formatTimeIso(next));
    } else if (type === 'plus_1y') {
      const next = dtB.plus({ years: 1 });
      setCompareDate(formatDateIso(next));
      setCompareTime(formatTimeIso(next));
    } else if (type === 'midpoint') {
      const midMillis = (dtA.toMillis() + dtB.toMillis()) / 2;
      const midDt = DateTime.fromMillis(midMillis, { zone: dtA.zone });
      setCompareDate(formatDateIso(midDt));
      setCompareTime(formatTimeIso(midDt));
    } else if (type === 'double') {
      const spanMillis = dtB.toMillis() - dtA.toMillis();
      const doubleDt = DateTime.fromMillis(dtB.toMillis() + spanMillis, { zone: dtB.zone });
      setCompareDate(formatDateIso(doubleDt));
      setCompareTime(formatTimeIso(doubleDt));
    }
  };

  // Full summary text for copying
  const comparisonSummary = useMemo(() => {
    const aStr = `${startIsNow ? 'Nu' : startDate} ${startTime}`;
    const bStr = `${endIsNow ? 'Nu' : endDate} ${endTime}`;
    const cStr = `${compareIsNow ? 'Nu' : compareDate} ${compareTime}`;

    return [
      `=== JÄMFÖRELSEANALYS AV TIDSSPANN ===`,
      `Basintervall [A → B]: ${aStr} till ${bStr}`,
      `Längd [A → B]: ${baseDurationResult.exactSentence} (${daysAB} dagar)`,
      ``,
      `Tredje datum [C]: ${cStr}`,
      `Jämförelseintervall [A → C]: ${durationAC.exactSentence} (${daysAC} dagar)`,
      `Offset från slutdatum [B → C]: ${durationBC.exactSentence} (${daysBC} dagar)`,
      ``,
      `Skillnad mot basintervall: ${diffDays >= 0 ? '+' : ''}${diffDays.toFixed(2)} dagar (${diffPercent >= 0 ? '+' : ''}${diffPercent.toFixed(1)}%)`,
    ].join('\n');
  }, [
    startIsNow,
    startDate,
    startTime,
    endIsNow,
    endDate,
    endTime,
    compareIsNow,
    compareDate,
    compareTime,
    baseDurationResult,
    daysAB,
    daysAC,
    daysBC,
    durationAC,
    durationBC,
    diffDays,
    diffPercent,
  ]);

  const handleCopySummary = () => {
    onCopyText(comparisonSummary, 'Jämförelseanalys kopierad till urklipp');
    setCopiedKey('summary');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section
      id="section-comparison-view"
      className="glass-card p-5 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <span>Tredje datum & Jämförelseanalys</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold border border-sky-500/30">
                Multi-Range
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Jämför ett tredje datum (C) mot det aktiva tidsintervallet [A → B] och beräkna avvikelser
            </p>
          </div>
        </div>

        {/* Copy comparison button */}
        <button
          type="button"
          id="btn-copy-comparison-summary"
          onClick={handleCopySummary}
          className="btn-liquid-glass gap-2 self-start sm:self-auto min-h-[38px] px-4 py-1.5 text-xs font-semibold rounded-xl shadow-xs"
          title="Kopiera fullständig jämförelserapport"
        >
          {copiedKey === 'summary' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kopierad!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-sky-500" />
              <span>Kopiera analys</span>
            </>
          )}
        </button>
      </div>

      {/* Third Date Input & Presets Bar */}
      <div className="relative z-10 pt-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Third Date Picker inputs */}
          <div className="lg:col-span-7 space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="comparison-date-input"
                className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5"
              >
                <Milestone className="w-3.5 h-3.5 text-sky-500" />
                <span>Tredje datum / Milstolpe (C)</span>
              </label>
              {compareIsNow && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synkad med realtid
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {/* Date Input */}
              <div
                className={`sm:col-span-3 min-h-[46px] min-w-0 relative flex items-center px-3.5 py-1.5 border rounded-xl backdrop-blur-md transition-all ${
                  compareIsNow
                    ? 'bg-neutral-100/50 dark:bg-neutral-800/30 border-neutral-200/60 dark:border-neutral-700/40 cursor-default'
                    : 'bg-white/70 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-neutral-500 focus-within:border-sky-500 dark:focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20 dark:focus-within:ring-sky-400/25 focus-within:shadow-[0_0_14px_rgba(56,189,248,0.25)] shadow-2xs'
                }`}
              >
                <Calendar className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                <input
                  id="comparison-date-input"
                  type="date"
                  value={compareDate}
                  onChange={(e) => {
                    setCompareIsNow(false);
                    setCompareDate(e.target.value);
                  }}
                  disabled={compareIsNow}
                  className="w-full h-8 text-xs sm:text-[14px] font-semibold font-mono tracking-tight bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none disabled:opacity-80 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              {/* Time Input */}
              <div
                className={`sm:col-span-2 min-h-[46px] min-w-0 relative flex items-center px-3.5 py-1.5 border rounded-xl backdrop-blur-md transition-all ${
                  compareIsNow
                    ? 'bg-neutral-100/50 dark:bg-neutral-800/30 border-neutral-200/60 dark:border-neutral-700/40 cursor-default'
                    : 'bg-white/70 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-neutral-500 focus-within:border-sky-500 dark:focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20 dark:focus-within:ring-sky-400/25 focus-within:shadow-[0_0_14px_rgba(56,189,248,0.25)] shadow-2xs'
                }`}
              >
                <Clock className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0 pointer-events-none" />
                <input
                  id="comparison-time-input"
                  type="time"
                  step="1"
                  value={compareTime}
                  onChange={(e) => {
                    setCompareIsNow(false);
                    setCompareTime(e.target.value);
                  }}
                  disabled={compareIsNow}
                  className="w-full h-8 text-xs sm:text-[14px] font-semibold font-mono tabular-nums tracking-tight bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none disabled:opacity-80 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons for Date C */}
          <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleSetPreset('now')}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                compareIsNow ? 'btn-liquid-pill-active' : 'btn-liquid-pill'
              }`}
            >
              Nu (Realtid)
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('plus_30d')}
              className="btn-liquid-pill min-h-[34px] px-3 py-1 text-xs font-medium rounded-full transition-all"
            >
              +30d efter B
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('plus_90d')}
              className="btn-liquid-pill min-h-[34px] px-3 py-1 text-xs font-medium rounded-full transition-all"
            >
              +90d efter B
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('plus_1y')}
              className="btn-liquid-pill min-h-[34px] px-3 py-1 text-xs font-medium rounded-full transition-all"
            >
              +1 år efter B
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('midpoint')}
              className="btn-liquid-pill min-h-[34px] px-3 py-1 text-xs font-medium rounded-full transition-all"
            >
              Mitten av [A-B]
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('double')}
              className="btn-liquid-pill min-h-[34px] px-3 py-1 text-xs font-medium rounded-full transition-all"
            >
              Dubbla spannet
            </button>
          </div>
        </div>

        {/* Highlight Callout: Primary Difference Summary */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-500/25 dark:border-sky-500/35 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              diffDays > 0
                ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300'
                : diffDays < 0
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
            }`}>
              {diffDays > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : diffDays < 0 ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 font-mono">
                Avvikelse mot basintervall [A → B]
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {diffDays > 0
                    ? `+${diffDays.toFixed(1)} dagar längre`
                    : diffDays < 0
                    ? `${Math.abs(diffDays).toFixed(1)} dagar kortare`
                    : 'Exakt samma längd'}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  diffPercent > 0
                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                    : diffPercent < 0
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {diffPercent >= 0 ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                {relativePosition === 'after_end' && (
                  <span>Datum C infaller <strong>{daysBC.toFixed(1)} dagar efter</strong> slutdatum B ({metadataC.formattedDisplay}).</span>
                )}
                {relativePosition === 'before_start' && (
                  <span>Datum C infaller <strong>{daysAC.toFixed(1)} dagar före</strong> startdatum A ({metadataC.formattedDisplay}).</span>
                )}
                {relativePosition === 'inside_interval' && (
                  <span>Datum C infaller <strong>inuti intervallet</strong> vid <strong>{positionPercentage}%</strong> av den totala tidsrymden.</span>
                )}
                {relativePosition === 'at_start' && (
                  <span>Datum C sammanfaller exakt med startdatum A.</span>
                )}
                {relativePosition === 'at_end' && (
                  <span>Datum C sammanfaller exakt med slutdatum B.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200/60 dark:border-neutral-800/60 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <span>Skillnad i timmar:</span>
            <span className="font-bold text-neutral-900 dark:text-neutral-200 text-sm">
              {diffHours >= 0 ? `+${diffHours.toFixed(1)}h` : `${diffHours.toFixed(1)}h`}
            </span>
          </div>
        </div>

        {/* 3-Way Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Card 1: Range [A -> B] */}
          <div className="glass-card-nested p-4 rounded-xl space-y-2 border-neutral-200/80 dark:border-neutral-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Basintervall [A → B]
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                {daysAB.toFixed(1)}d
              </span>
            </div>
            <p className="font-display text-base font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
              {baseDurationResult.primaryFormatted || `${daysAB} dagar`}
            </p>
            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <div>Veckor: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{baseDurationResult.totals.totalWeeks.toFixed(2)}</span></div>
              <div>Månader: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{baseDurationResult.totals.totalMonths.toFixed(2)}</span></div>
              <div>Timmar: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{baseDurationResult.totals.totalHours.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Card 2: Range [A -> C] */}
          <div className="glass-card-nested p-4 rounded-xl space-y-2 border-sky-500/30 dark:border-sky-500/40 bg-sky-500/5 dark:bg-sky-500/10 shadow-[0_0_15px_-4px_rgba(56,189,248,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                Jämförelse [A → C]
              </span>
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-300">
                {daysAC.toFixed(1)}d
              </span>
            </div>
            <p className="font-display text-base font-bold text-neutral-900 dark:text-white line-clamp-2">
              {durationAC.primaryFormatted || `${daysAC} dagar`}
            </p>
            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 space-y-0.5 pt-1 border-t border-sky-500/20 dark:border-sky-500/20">
              <div>Veckor: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{durationAC.totals.totalWeeks.toFixed(2)}</span></div>
              <div>Månader: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{durationAC.totals.totalMonths.toFixed(2)}</span></div>
              <div>Timmar: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{durationAC.totals.totalHours.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Card 3: Offset [B -> C] */}
          <div className="glass-card-nested p-4 rounded-xl space-y-2 border-neutral-200/80 dark:border-neutral-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Offset [B → C]
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                {daysBC.toFixed(1)}d
              </span>
            </div>
            <p className="font-display text-base font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
              {durationBC.primaryFormatted || `${daysBC} dagar`}
            </p>
            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <div>Veckor: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{durationBC.totals.totalWeeks.toFixed(2)}</span></div>
              <div>Månader: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{durationBC.totals.totalMonths.toFixed(2)}</span></div>
              <div>Timmar: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{durationBC.totals.totalHours.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {/* Proportional Range Visualizer Bar */}
        <div className="p-4 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold font-mono text-neutral-600 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
              Visuell proportionell jämförelse
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">
              Bas = 100% ({daysAB.toFixed(0)} dagar)
            </span>
          </div>

          {/* Bar 1: Base [A -> B] */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>Bas [A → B]:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{daysAB.toFixed(1)} dagar (100%)</span>
            </div>
            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-blue-500 rounded-full w-full" />
            </div>
          </div>

          {/* Bar 2: Compared [A -> C] */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>Jämförelse [A → C]:</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                {daysAC.toFixed(1)} dagar ({daysAB > 0 ? ((daysAC / daysAB) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                style={{
                  width: `${Math.min(100, Math.max(4, daysAB > 0 ? (daysAC / Math.max(daysAB, daysAC)) * 100 : 0))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
