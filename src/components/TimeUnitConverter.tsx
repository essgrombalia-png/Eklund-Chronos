import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Calculator,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { DurationTotalsData } from '../types';

export type TimeUnitKey =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'workdays'
  | 'days'
  | 'weeks'
  | 'months'
  | 'quarters'
  | 'years'
  | 'decades';

interface UnitDefinition {
  key: TimeUnitKey;
  singular: string;
  plural: string;
  short: string;
  secondsFactor: number; // Seconds per 1 unit
  category: 'small' | 'standard' | 'large';
  note?: string;
}

const TIME_UNITS: UnitDefinition[] = [
  {
    key: 'milliseconds',
    singular: 'millisekund',
    plural: 'millisekunder',
    short: 'ms',
    secondsFactor: 0.001,
    category: 'small',
  },
  {
    key: 'seconds',
    singular: 'sekund',
    plural: 'sekunder',
    short: 's',
    secondsFactor: 1,
    category: 'small',
  },
  {
    key: 'minutes',
    singular: 'minut',
    plural: 'minuter',
    short: 'min',
    secondsFactor: 60,
    category: 'standard',
  },
  {
    key: 'hours',
    singular: 'timme',
    plural: 'timmar',
    short: 'h',
    secondsFactor: 3600,
    category: 'standard',
  },
  {
    key: 'workdays',
    singular: 'arbetsdag (8h)',
    plural: 'arbetsdagar (8h)',
    short: 'arb.d',
    secondsFactor: 28800,
    category: 'standard',
    note: 'Standard 8-timmars arbetsdag',
  },
  {
    key: 'days',
    singular: 'dag (dygn)',
    plural: 'dagar (dygn)',
    short: 'd',
    secondsFactor: 86400,
    category: 'standard',
    note: '24 timmar',
  },
  {
    key: 'weeks',
    singular: 'vecka',
    plural: 'veckor',
    short: 'v',
    secondsFactor: 604800,
    category: 'standard',
    note: '7 dagar = 168 timmar',
  },
  {
    key: 'months',
    singular: 'månad',
    plural: 'månader',
    short: 'mån',
    secondsFactor: 2629800, // 365.25 / 12 * 86400
    category: 'large',
    note: 'Genomsnitt 30,4375 dagar',
  },
  {
    key: 'quarters',
    singular: 'kvartal',
    plural: 'kvartal',
    short: 'kv',
    secondsFactor: 7889400, // 3 * month
    category: 'large',
    note: '3 månader ≈ 91,31 dagar',
  },
  {
    key: 'years',
    singular: 'år',
    plural: 'år',
    short: 'år',
    secondsFactor: 31557600, // 365.25 * 86400
    category: 'large',
    note: 'Standard kalenderår (365,25 dagar)',
  },
  {
    key: 'decades',
    singular: 'decennium',
    plural: 'decennier',
    short: 'dec',
    secondsFactor: 315576000,
    category: 'large',
    note: '10 kalenderår',
  },
];

const PRESET_CONVERSIONS = [
  { from: 'weeks' as TimeUnitKey, to: 'hours' as TimeUnitKey, value: 1, label: 'Veckor → Timmar' },
  { from: 'months' as TimeUnitKey, to: 'seconds' as TimeUnitKey, value: 1, label: 'Månader → Sekunder' },
  { from: 'days' as TimeUnitKey, to: 'minutes' as TimeUnitKey, value: 1, label: 'Dagar → Minuter' },
  { from: 'years' as TimeUnitKey, to: 'hours' as TimeUnitKey, value: 1, label: 'År → Timmar' },
  { from: 'hours' as TimeUnitKey, to: 'seconds' as TimeUnitKey, value: 1, label: 'Timmar → Sekunder' },
  { from: 'weeks' as TimeUnitKey, to: 'days' as TimeUnitKey, value: 1, label: 'Veckor → Dagar' },
];

interface TimeUnitConverterProps {
  onCopyText: (text: string, label?: string) => void;
  currentTotals?: DurationTotalsData;
}

export const TimeUnitConverter: React.FC<TimeUnitConverterProps> = ({
  onCopyText,
  currentTotals,
}) => {
  const [inputValue, setInputValue] = useState<string>('2');
  const [fromUnit, setFromUnit] = useState<TimeUnitKey>('weeks');
  const [toUnit, setToUnit] = useState<TimeUnitKey>('hours');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const numValue = useMemo(() => {
    const parsed = parseFloat(inputValue.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  const fromDef = useMemo(() => TIME_UNITS.find((u) => u.key === fromUnit) || TIME_UNITS[6], [fromUnit]);
  const toDef = useMemo(() => TIME_UNITS.find((u) => u.key === toUnit) || TIME_UNITS[3], [toUnit]);

  // Calculate direct target value
  const convertedTargetValue = useMemo(() => {
    if (numValue === 0) return 0;
    const totalSeconds = numValue * fromDef.secondsFactor;
    return totalSeconds / toDef.secondsFactor;
  }, [numValue, fromDef, toDef]);

  // Format numbers nicely with Swedish locale
  const formatNumber = (val: number, maxDecimals: number = 4): string => {
    if (val === 0) return '0';
    if (Math.abs(val) >= 1e9 || (Math.abs(val) < 1e-4 && val !== 0)) {
      return val.toExponential(4).replace('.', ',');
    }
    return new Intl.NumberFormat('sv-SE', {
      maximumFractionDigits: maxDecimals,
    }).format(val);
  };

  // Human unit label depending on value
  const getUnitLabel = (def: UnitDefinition, val: number) => {
    return Math.abs(val) === 1 ? def.singular : def.plural;
  };

  // Swap From and To units
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Copy with temporary feedback
  const handleCopy = (text: string, key: string, label: string) => {
    onCopyText(text, label);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Full summary sentence
  const conversionSummarySentence = useMemo(() => {
    const formattedFrom = formatNumber(numValue, 4);
    const formattedTo = formatNumber(convertedTargetValue, 4);
    const fromLabel = getUnitLabel(fromDef, numValue);
    const toLabel = getUnitLabel(toDef, convertedTargetValue);
    return `${formattedFrom} ${fromLabel} = ${formattedTo} ${toLabel}`;
  }, [numValue, convertedTargetValue, fromDef, toDef]);

  // Step calculations for formula breakdown
  const formulaExplanation = useMemo(() => {
    if (fromDef.key === toDef.key) {
      return `Samma enhet (1 = 1)`;
    }

    const factor = fromDef.secondsFactor / toDef.secondsFactor;
    if (factor >= 1 && Number.isInteger(factor)) {
      return `1 ${fromDef.singular} = ${factor.toLocaleString('sv-SE')} ${toDef.plural} (${formatNumber(numValue)} × ${factor.toLocaleString('sv-SE')} = ${formatNumber(convertedTargetValue)})`;
    } else if (factor < 1 && Number.isInteger(1 / factor)) {
      const divisor = Math.round(1 / factor);
      return `1 ${toDef.singular} = ${divisor.toLocaleString('sv-SE')} ${fromDef.plural} (${formatNumber(numValue)} ÷ ${divisor.toLocaleString('sv-SE')} = ${formatNumber(convertedTargetValue)})`;
    }

    return `1 ${fromDef.singular} ≈ ${formatNumber(factor, 4)} ${toDef.plural}`;
  }, [fromDef, toDef, numValue, convertedTargetValue]);

  // Multi-unit matrix list
  const multiUnitList = useMemo(() => {
    const totalSeconds = numValue * fromDef.secondsFactor;
    return TIME_UNITS.filter((u) => u.key !== fromDef.key).map((u) => {
      const converted = totalSeconds / u.secondsFactor;
      return {
        unit: u,
        value: converted,
        formatted: formatNumber(converted, converted > 10000 ? 2 : 4),
        label: getUnitLabel(u, converted),
      };
    });
  }, [numValue, fromDef]);

  return (
    <section
      id="time-unit-converter-section"
      className="glass-card p-5 sm:p-7 md:p-8 rounded-2xl hover:shadow-xl dark:hover:shadow-black/50 transition-all duration-300 ease-out hover:scale-[1.008]"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 border border-neutral-200/70 dark:border-neutral-700/60">
            <ArrowRightLeft className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Tidsenhetskonvertering
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Konvertera enkelt mellan veckor, timmar, månader, sekunder och andra tidsenheter.
            </p>
          </div>
        </div>

        {/* Quick import from current calculation if available */}
        {currentTotals && (currentTotals.totalDays > 0 || currentTotals.totalHours > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Från beräkning:
            </span>
            <button
              type="button"
              id="btn-converter-load-weeks"
              onClick={() => {
                setInputValue(Math.round(currentTotals.totalWeeks).toString());
                setFromUnit('weeks');
                setToUnit('hours');
              }}
              className="btn-liquid-pill text-xs px-3 py-1 rounded-full font-medium"
              title="Ladda totala veckor"
            >
              {Math.round(currentTotals.totalWeeks)} veckor
            </button>
            <button
              type="button"
              id="btn-converter-load-days"
              onClick={() => {
                setInputValue(Math.round(currentTotals.totalDays).toString());
                setFromUnit('days');
                setToUnit('hours');
              }}
              className="btn-liquid-pill text-xs px-3 py-1 rounded-full font-medium"
              title="Ladda totala dagar"
            >
              {Math.round(currentTotals.totalDays)} dagar
            </button>
            <button
              type="button"
              id="btn-converter-load-hours"
              onClick={() => {
                setInputValue(Math.round(currentTotals.totalHours).toString());
                setFromUnit('hours');
                setToUnit('minutes');
              }}
              className="btn-liquid-pill text-xs px-3 py-1 rounded-full font-medium"
              title="Ladda totala timmar"
            >
              {Math.round(currentTotals.totalHours)} timmar
            </button>
          </div>
        )}
      </div>

      {/* Preset conversion shortcuts */}
      <div className="pt-4 pb-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0 mr-1 select-none">
          Vanliga val:
        </span>
        {PRESET_CONVERSIONS.map((preset) => {
          const isActive = fromUnit === preset.from && toUnit === preset.to;
          return (
            <button
              key={preset.label}
              type="button"
              id={`btn-preset-conv-${preset.from}-${preset.to}`}
              onClick={() => {
                setFromUnit(preset.from);
                setToUnit(preset.to);
                setInputValue(preset.value.toString());
              }}
              className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                isActive
                  ? 'btn-liquid-pill-active'
                  : 'btn-liquid-pill'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Dual-Unit Converter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center bg-white/40 dark:bg-neutral-900/30 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/60 dark:border-white/10 shadow-2xs">
        {/* Input Value */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label
            htmlFor="converter-input-value"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            Antal
          </label>
          <div className="relative flex items-center">
            <input
              id="converter-input-value"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ange antal..."
              className="w-full min-h-[46px] px-3.5 py-2 text-base font-mono font-semibold bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200/80 dark:border-white/10 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/25 focus:shadow-[0_0_14px_rgba(56,189,248,0.25)] text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark]"
            />
            {/* Quick adjust buttons */}
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                id="btn-conv-minus"
                onClick={() => setInputValue((prev) => Math.max(0, (parseFloat(prev) || 0) - 1).toString())}
                className="btn-liquid-glass w-7 h-7 rounded-lg text-sm font-bold shadow-2xs"
                title="Minska med 1"
              >
                -
              </button>
              <button
                type="button"
                id="btn-conv-plus"
                onClick={() => setInputValue((prev) => ((parseFloat(prev) || 0) + 1).toString())}
                className="btn-liquid-glass w-7 h-7 rounded-lg text-sm font-bold shadow-2xs"
                title="Öka med 1"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* From Unit */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label
            htmlFor="converter-from-unit"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            Från enhet
          </label>
          <select
            id="converter-from-unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as TimeUnitKey)}
            className="w-full min-h-[46px] px-3 py-2 text-base sm:text-sm font-medium bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-200/80 dark:border-white/10 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/25 text-neutral-900 dark:text-neutral-100 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
          >
            {TIME_UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.plural.charAt(0).toUpperCase() + u.plural.slice(1)} ({u.short})
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="md:col-span-1 flex items-center justify-center py-1 md:pt-4">
          <button
            type="button"
            id="btn-conv-swap-units"
            onClick={handleSwap}
            className="group btn-liquid-glass w-11 h-11 rounded-full shadow-xs"
            title="Växla enheter"
            aria-label="Växla från- och till-enhet"
          >
            <ArrowRightLeft className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 text-sky-600 dark:text-sky-400" />
          </button>
        </div>

        {/* To Unit */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label
            htmlFor="converter-to-unit"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            Till enhet
          </label>
          <select
            id="converter-to-unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value as TimeUnitKey)}
            className="w-full min-h-[46px] px-3 py-2 text-base sm:text-sm font-medium bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-200/80 dark:border-white/10 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/25 text-neutral-900 dark:text-neutral-100 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
          >
            {TIME_UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.plural.charAt(0).toUpperCase() + u.plural.slice(1)} ({u.short})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Result Card with subtle luxury neon glow */}
      <div className="mt-5 p-5 sm:p-6 rounded-xl bg-neutral-950 text-white border border-sky-500/30 dark:border-sky-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_-4px_rgba(56,189,248,0.2)]">
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-400 font-mono">
            Beräknat resultat
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-mono tabular-nums text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              {formatNumber(convertedTargetValue, 4)}
            </span>
            <span className="text-lg sm:text-xl font-medium text-neutral-200 font-chrono">
              {getUnitLabel(toDef, convertedTargetValue)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 pt-1 font-mono">
            {formulaExplanation}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            id="btn-conv-copy-result"
            onClick={() =>
              handleCopy(
                conversionSummarySentence,
                'target-sentence',
                'Konverterat resultat kopierat'
              )
            }
            className="btn-liquid-glass gap-2 min-h-[38px] px-4 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white dark:text-white shadow-xs"
            title="Kopiera fullständig konvertering"
          >
            {copiedKey === 'target-sentence' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kopierad!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comprehensive Multi-Unit Equivalent Matrix */}
      <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Motsvarar i samtliga tidsenheter
            </span>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Vad {formatNumber(numValue)} {getUnitLabel(fromDef, numValue)} motsvarar i alla standardenheter.
            </p>
          </div>
          <span className="hidden sm:inline text-[11px] text-neutral-400 dark:text-neutral-500">
            Klicka på en ruta för att kopiera värdet
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {multiUnitList.map(({ unit, formatted, label }) => {
            const isCurrentTo = toUnit === unit.key;
            return (
              <div
                key={unit.key}
                id={`matrix-unit-${unit.key}`}
                onClick={() => handleCopy(formatted, `unit-${unit.key}`, `${label} kopierat`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCopy(formatted, `unit-${unit.key}`, `${label} kopierat`);
                  }
                }}
                className={`group relative p-3 rounded-xl border text-left cursor-pointer backdrop-blur-md transition-all active:scale-98 ${
                  isCurrentTo
                    ? 'border-neutral-900/90 dark:border-neutral-300 bg-white/90 dark:bg-neutral-800/60 ring-1 ring-neutral-900/10 dark:ring-neutral-400/15 shadow-xs'
                    : 'border-white/70 dark:border-white/10 bg-white/50 dark:bg-[#13161B]/50 hover:border-neutral-300/80 dark:hover:border-neutral-600 hover:bg-white/80 dark:hover:bg-neutral-800/40 shadow-2xs'
                }`}
                title={`Kopiera ${formatted} ${label}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 truncate">
                    {unit.plural.charAt(0).toUpperCase() + unit.plural.slice(1)}
                  </span>
                  {copiedKey === `unit-${unit.key}` ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  )}
                </div>

                <div className="text-sm sm:text-base font-semibold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 truncate">
                  {formatted}
                </div>

                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                  {unit.short}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle footnote about standard calendar calculation basis */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          Beräkningen baseras på standardiserade kalendermått: 1 år = 365,25 dygn, 1 månad = 30,4375 dygn (365,25 / 12).
        </span>
        <span className="font-mono text-[10px]">ISO-standard</span>
      </div>
    </section>
  );
};
