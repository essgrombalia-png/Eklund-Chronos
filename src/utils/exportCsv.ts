import { DateTime } from 'luxon';
import { CalculationState, DurationResult, FavoriteItem, HistoryItem } from '../types';
import { calculateDuration, parseDateTime } from './dateCalculations';

export interface CsvExportOptions {
  delimiter?: ',' | ';';
  includeCurrentResult?: boolean;
  includeHistory?: boolean;
  includeFavorites?: boolean;
  timezone?: string;
  currentResult?: DurationResult;
  currentState?: CalculationState;
  startFormatted?: string;
  endFormatted?: string;
}

/**
 * RFC 4180 compliant CSV cell formatting with proper quote escaping
 */
function escapeCsvCell(val: string | number | boolean | null | undefined, delimiter: string): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If the string contains the delimiter, quotes, or newlines, quote it and double inner quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatNumber(num: number, delimiter: string, decimals: number = 2): string {
  if (!isFinite(num)) return '0';
  // If semicolon is used (European Excel), decimal point is usually comma
  if (delimiter === ';') {
    return num.toFixed(decimals).replace('.', ',');
  }
  return num.toFixed(decimals);
}

/**
 * Builds a structured CSV string containing history, current calculation, and statistics
 */
export function generateCsv(
  history: HistoryItem[],
  favorites: FavoriteItem[],
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ';'; // Default to semicolon for Swedish Excel friendly formatting
  const includeCurrent = options.includeCurrentResult !== false && options.currentResult && options.currentState;
  const includeHistory = options.includeHistory !== false;
  const includeFavorites = options.includeFavorites === true;

  const headers = [
    'Typ',
    'ID_Titel',
    'Skapad_Tidpunkt',
    'Startdatum',
    'Starttid',
    'Start_Ar_Nu',
    'Slutdatum',
    'Sluttid',
    'Slut_Ar_Nu',
    'Tidszon',
    'Riktning',
    'Status',
    'Ar',
    'Manader',
    'Veckor',
    'Dagar',
    'Klockslag_Tid',
    'Timmar',
    'Minuter',
    'Sekunder',
    'Millisekunder',
    'Totala_Dagar',
    'Totala_Veckor',
    'Totala_Manader',
    'Totala_Timmar',
    'Totala_Minuter',
    'Totala_Sekunder',
    'Totala_Millisekunder',
    'Arbetsdagar',
    'Helgdagar_Bortraknade',
    'Endast_Arbetsdagar_Aktivt',
    'Fullstandig_Beskrivning',
  ];

  const rows: string[][] = [];

  // 1. Current Active Calculation
  if (includeCurrent && options.currentResult && options.currentState) {
    const res = options.currentResult;
    const st = options.currentState;
    const nowIso = DateTime.now().toISO() ?? '';

    rows.push([
      'Aktuell beräkning',
      'Nuvarande session',
      nowIso,
      st.startDate,
      st.startTime,
      st.startIsNow ? 'Ja' : 'Nej',
      st.endDate,
      st.endTime,
      st.endIsNow ? 'Ja' : 'Nej',
      st.timezone,
      res.direction === 'past' ? 'Förfluten tid' : res.direction === 'future' ? 'Framtida tid' : 'Samma tidpunkt',
      res.statusLabel,
      String(res.breakdown.years),
      String(res.breakdown.months),
      String(res.breakdown.weeks),
      String(res.breakdown.days),
      res.timeFormatted,
      String(res.breakdown.hours),
      String(res.breakdown.minutes),
      String(res.breakdown.seconds),
      String(res.breakdown.milliseconds),
      formatNumber(res.totals.totalDays, delimiter, 4),
      formatNumber(res.totals.totalWeeks, delimiter, 4),
      formatNumber(res.totals.totalMonths, delimiter, 4),
      formatNumber(res.totals.totalHours, delimiter, 2),
      String(res.totals.totalMinutes),
      String(res.totals.totalSeconds),
      String(res.totals.totalMilliseconds),
      String(res.workingDaysInfo?.workingDays ?? ''),
      String(res.workingDaysInfo?.weekendDays ?? ''),
      res.workingDaysInfo?.isWorkingDaysOnly ? 'Ja' : 'Nej',
      res.exactSentence,
    ]);
  }

  // 2. History items with parsed duration statistics
  if (includeHistory && history.length > 0) {
    for (const item of history) {
      const createdIso = new Date(item.createdAt).toISOString();
      const tz = item.timezone || options.timezone || 'system';

      // Parse start and end to compute precise duration stats
      const startD = item.startIsNow
        ? DateTime.fromMillis(item.createdAt).setZone(tz)
        : parseDateTime(item.startDate, item.startTime || '00:00:00', tz);

      const endD = item.endIsNow
        ? DateTime.fromMillis(item.createdAt).setZone(tz)
        : parseDateTime(item.endDate, item.endTime || '00:00:00', tz);

      let years = 0;
      let months = 0;
      let weeks = 0;
      let days = 0;
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      let millis = 0;
      let totalDays = 0;
      let totalWeeks = 0;
      let totalMonths = 0;
      let totalHours = 0;
      let totalMinutes = 0;
      let totalSeconds = 0;
      let totalMillis = 0;
      let directionStr = 'Okänd';
      let statusStr = '';
      let timeFormatted = '00:00:00';

      if (startD.isValid && endD.isValid) {
        const computed = calculateDuration(startD, endD, DateTime.now().setZone(tz));
        years = computed.breakdown.years;
        months = computed.breakdown.months;
        weeks = computed.breakdown.weeks;
        days = computed.breakdown.days;
        hours = computed.breakdown.hours;
        minutes = computed.breakdown.minutes;
        seconds = computed.breakdown.seconds;
        millis = computed.breakdown.milliseconds;

        totalDays = computed.totals.totalDays;
        totalWeeks = computed.totals.totalWeeks;
        totalMonths = computed.totals.totalMonths;
        totalHours = computed.totals.totalHours;
        totalMinutes = computed.totals.totalMinutes;
        totalSeconds = computed.totals.totalSeconds;
        totalMillis = computed.totals.totalMilliseconds;

        directionStr =
          computed.direction === 'past'
            ? 'Förfluten tid'
            : computed.direction === 'future'
            ? 'Framtida tid'
            : 'Samma tidpunkt';
        statusStr = computed.statusLabel;
        timeFormatted = computed.timeFormatted;
      }

      rows.push([
        'Historikpost',
        item.id,
        createdIso,
        item.startDate,
        item.startTime || '00:00:00',
        item.startIsNow ? 'Ja' : 'Nej',
        item.endDate,
        item.endTime || '00:00:00',
        item.endIsNow ? 'Ja' : 'Nej',
        tz,
        directionStr,
        statusStr,
        String(years),
        String(months),
        String(weeks),
        String(days),
        timeFormatted,
        String(hours),
        String(minutes),
        String(seconds),
        String(millis),
        formatNumber(totalDays, delimiter, 4),
        formatNumber(totalWeeks, delimiter, 4),
        formatNumber(totalMonths, delimiter, 4),
        formatNumber(totalHours, delimiter, 2),
        String(totalMinutes),
        String(totalSeconds),
        String(totalMillis),
        '',
        '',
        'Nej',
        item.summary,
      ]);
    }
  }

  // 3. Favorites (if requested)
  if (includeFavorites && favorites.length > 0) {
    for (const fav of favorites) {
      const tz = fav.timezone || options.timezone || 'system';
      const startD = fav.startIsNow
        ? DateTime.now().setZone(tz)
        : parseDateTime(fav.startDate, fav.startTime || '00:00:00', tz);

      const endD = fav.endIsNow
        ? DateTime.now().setZone(tz)
        : parseDateTime(fav.endDate, fav.endTime || '00:00:00', tz);

      let years = 0;
      let months = 0;
      let weeks = 0;
      let days = 0;
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      let totalDays = 0;
      let totalHours = 0;
      let totalMinutes = 0;
      let totalSeconds = 0;
      let summary = '';
      let timeFormatted = '00:00:00';

      if (startD.isValid && endD.isValid) {
        const computed = calculateDuration(startD, endD, DateTime.now().setZone(tz));
        years = computed.breakdown.years;
        months = computed.breakdown.months;
        weeks = computed.breakdown.weeks;
        days = computed.breakdown.days;
        hours = computed.breakdown.hours;
        minutes = computed.breakdown.minutes;
        seconds = computed.breakdown.seconds;
        totalDays = computed.totals.totalDays;
        totalHours = computed.totals.totalHours;
        totalMinutes = computed.totals.totalMinutes;
        totalSeconds = computed.totals.totalSeconds;
        summary = computed.exactSentence;
        timeFormatted = computed.timeFormatted;
      }

      rows.push([
        'Favorit',
        fav.title,
        '',
        fav.startDate,
        fav.startTime || '00:00:00',
        fav.startIsNow ? 'Ja' : 'Nej',
        fav.endDate,
        fav.endTime || '00:00:00',
        fav.endIsNow ? 'Ja' : 'Nej',
        tz,
        'Sparad favorit',
        fav.title,
        String(years),
        String(months),
        String(weeks),
        String(days),
        timeFormatted,
        String(hours),
        String(minutes),
        String(seconds),
        '0',
        formatNumber(totalDays, delimiter, 4),
        '',
        '',
        formatNumber(totalHours, delimiter, 2),
        String(totalMinutes),
        String(totalSeconds),
        '0',
        '',
        '',
        'Nej',
        summary,
      ]);
    }
  }

  // Format all lines with delimiter
  const headerLine = headers.map((h) => escapeCsvCell(h, delimiter)).join(delimiter);
  const dataLines = rows.map((r) => r.map((c) => escapeCsvCell(c, delimiter)).join(delimiter));

  // UTF-8 BOM (\uFEFF) ensures Excel handles characters properly
  return '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
}

/**
 * Triggers a browser download of the generated CSV file
 */
export function downloadDataAsCsv(
  history: HistoryItem[],
  favorites: FavoriteItem[],
  options: CsvExportOptions = {}
): void {
  const csvContent = generateCsv(history, favorites, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = DateTime.now().toFormat('yyyy-MM-dd');
  const scopeSuffix =
    options.includeCurrentResult && !options.includeHistory
      ? 'aktuell-berakning'
      : options.includeHistory && !options.includeCurrentResult
      ? 'historik-statistik'
      : 'statistik-export';

  link.href = url;
  link.setAttribute('download', `chronos-${scopeSuffix}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
