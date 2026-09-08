import { DateTime } from 'luxon';
import {
  DateMetadata,
  DurationBreakdownData,
  DurationResult,
  DurationTotalsData,
  TimeDirection,
  WorkingDaysInfo,
} from '../types';
import { resolveZone, formatUtcOffset } from './timezones';

export interface WorkingDaysOptions {
  onlyWorkingDays?: boolean;
  excludeSaturday?: boolean;
  excludeSunday?: boolean;
}

/**
 * Parses date string and time string in a specific IANA timezone
 */
export function parseDateTime(
  dateStr: string,
  timeStr: string = '00:00:00',
  zone: string = 'system'
): DateTime {
  const actualZone = resolveZone(zone);
  const cleanTime = timeStr.trim();
  const timeParts = cleanTime.split(':');
  const hours = parseInt(timeParts[0] || '0', 10);
  const minutes = parseInt(timeParts[1] || '0', 10);
  const seconds = parseInt(timeParts[2] || '0', 10);

  const dateParts = dateStr.trim().split('-');
  if (dateParts.length !== 3) {
    return DateTime.invalid('Ogiltigt datumformat');
  }

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);

  return DateTime.fromObject(
    {
      year,
      month,
      day,
      hour: isNaN(hours) ? 0 : hours,
      minute: isNaN(minutes) ? 0 : minutes,
      second: isNaN(seconds) ? 0 : seconds,
      millisecond: 0,
    },
    { zone: actualZone }
  );
}

/**
 * Returns current DateTime in specified zone
 */
export function getNowInZone(zone: string = 'system'): DateTime {
  const actualZone = resolveZone(zone);
  return DateTime.now().setZone(actualZone);
}

/**
 * Formats a DateTime to YYYY-MM-DD
 */
export function formatDateIso(dt: DateTime): string {
  return dt.toFormat('yyyy-MM-dd');
}

/**
 * Formats a DateTime to HH:mm:ss
 */
export function formatTimeIso(dt: DateTime): string {
  return dt.toFormat('HH:mm:ss');
}

/**
 * Detailed business / working days calculation excluding weekends (Saturdays and/or Sundays).
 */
export function calculateWorkingDaysInfo(
  earlier: DateTime,
  later: DateTime,
  excludeSat: boolean = true,
  excludeSun: boolean = true
): WorkingDaysInfo {
  if (!earlier.isValid || !later.isValid) {
    return {
      isWorkingDaysOnly: false,
      workingDays: 0,
      weekendDays: 0,
      saturdays: 0,
      sundays: 0,
      workingWeeks: 0,
      standardWorkHours8h: 0,
      exactWorkingSeconds: 0,
      exactWorkingHours: 0,
      exactWorkingMinutes: 0,
      excludeSaturday: excludeSat,
      excludeSunday: excludeSun,
      percentageWorkingDays: 0,
    };
  }

  const isWeekendDay = (dt: DateTime): { isExcluded: boolean; isSat: boolean; isSun: boolean } => {
    const isSat = dt.weekday === 6;
    const isSun = dt.weekday === 7;
    const isExcluded = (isSat && excludeSat) || (isSun && excludeSun);
    return { isExcluded, isSat, isSun };
  };

  let totalWorkingSeconds = 0;
  let saturdaysCount = 0;
  let sundaysCount = 0;
  let workingDaysCount = 0;

  const startDay = earlier.startOf('day');
  const endDay = later.startOf('day');
  const totalCalendarDaysDiff = Math.round(endDay.diff(startDay, 'days').days);

  if (totalCalendarDaysDiff === 0) {
    const { isExcluded, isSat, isSun } = isWeekendDay(earlier);
    if (isExcluded) {
      if (isSat) saturdaysCount = 1;
      if (isSun) sundaysCount = 1;
      totalWorkingSeconds = 0;
      workingDaysCount = 0;
    } else {
      totalWorkingSeconds = Math.max(0, later.diff(earlier, 'seconds').seconds);
      workingDaysCount = totalWorkingSeconds > 0 ? 1 : 0;
    }
  } else {
    // 1. Partial first day: earlier to end of its day
    const firstDayStatus = isWeekendDay(earlier);
    if (firstDayStatus.isExcluded) {
      if (firstDayStatus.isSat) saturdaysCount++;
      if (firstDayStatus.isSun) sundaysCount++;
    } else {
      workingDaysCount++;
      const endOfFirstDay = earlier.endOf('day');
      const firstDaySec = Math.max(0, endOfFirstDay.diff(earlier, 'seconds').seconds + 1);
      totalWorkingSeconds += firstDaySec;
    }

    // 2. Intermediate full days
    if (totalCalendarDaysDiff > 1) {
      const intermediateDaysCount = totalCalendarDaysDiff - 1;

      if (intermediateDaysCount > 700) {
        // High performance optimization for multi-year calculations
        const fullWeeks = Math.floor(intermediateDaysCount / 7);
        const remainderDays = intermediateDaysCount % 7;

        let weekendDaysPerWeek = 0;
        if (excludeSat) weekendDaysPerWeek++;
        if (excludeSun) weekendDaysPerWeek++;
        const workingDaysPerWeek = 7 - weekendDaysPerWeek;

        if (excludeSat) saturdaysCount += fullWeeks;
        if (excludeSun) sundaysCount += fullWeeks;
        workingDaysCount += fullWeeks * workingDaysPerWeek;
        totalWorkingSeconds += fullWeeks * workingDaysPerWeek * 86400;

        let cursor = startDay.plus({ days: 1 + fullWeeks * 7 });
        for (let i = 0; i < remainderDays; i++) {
          const status = isWeekendDay(cursor);
          if (status.isExcluded) {
            if (status.isSat) saturdaysCount++;
            if (status.isSun) sundaysCount++;
          } else {
            workingDaysCount++;
            totalWorkingSeconds += 86400;
          }
          cursor = cursor.plus({ days: 1 });
        }
      } else {
        let cursor = startDay.plus({ days: 1 });
        for (let i = 0; i < intermediateDaysCount; i++) {
          const status = isWeekendDay(cursor);
          if (status.isExcluded) {
            if (status.isSat) saturdaysCount++;
            if (status.isSun) sundaysCount++;
          } else {
            workingDaysCount++;
            totalWorkingSeconds += 86400;
          }
          cursor = cursor.plus({ days: 1 });
        }
      }
    }

    // 3. Partial last day: start of later's day to later
    const lastDayStatus = isWeekendDay(later);
    if (lastDayStatus.isExcluded) {
      if (lastDayStatus.isSat) saturdaysCount++;
      if (lastDayStatus.isSun) sundaysCount++;
    } else {
      const lastDaySec = Math.max(0, later.diff(later.startOf('day'), 'seconds').seconds);
      if (lastDaySec > 0) {
        workingDaysCount++;
        totalWorkingSeconds += lastDaySec;
      }
    }
  }

  const totalWeekendDays = saturdaysCount + sundaysCount;
  const exactWorkingHours = Math.floor(totalWorkingSeconds / 3600);
  const exactWorkingMinutes = Math.floor(totalWorkingSeconds / 60);

  // Exact fractional or rounded working days
  const workingDays = Number((totalWorkingSeconds / 86400).toFixed(2));
  const workingWeeks = Number((totalWorkingSeconds / (86400 * 5)).toFixed(2));
  const standardWorkHours8h = Number(((totalWorkingSeconds / 86400) * 8).toFixed(1));

  const totalEvaluatedDays = workingDays + totalWeekendDays;
  const percentageWorkingDays =
    totalEvaluatedDays > 0 ? Number(((workingDays / totalEvaluatedDays) * 100).toFixed(1)) : 100;

  return {
    isWorkingDaysOnly: false,
    workingDays,
    weekendDays: totalWeekendDays,
    saturdays: saturdaysCount,
    sundays: sundaysCount,
    workingWeeks,
    standardWorkHours8h,
    exactWorkingSeconds: Math.round(totalWorkingSeconds),
    exactWorkingHours,
    exactWorkingMinutes,
    excludeSaturday: excludeSat,
    excludeSunday: excludeSun,
    percentageWorkingDays,
  };
}

/**
 * Detailed calendar calculation between two dates
 */
export function calculateDuration(
  startDt: DateTime,
  endDt: DateTime,
  nowDt: DateTime,
  options?: WorkingDaysOptions
): DurationResult {
  if (!startDt.isValid || !endDt.isValid) {
    return getEmptyResult(options);
  }

  const startMillis = startDt.toMillis();
  const endMillis = endDt.toMillis();
  const diffMillis = endMillis - startMillis;

  let direction: TimeDirection = 'same';
  if (diffMillis > 0) {
    direction = 'future';
  } else if (diffMillis < 0) {
    direction = 'past';
  }

  // Absolute ordering for breakdown
  const earlier = diffMillis < 0 ? endDt : startDt;
  const later = diffMillis < 0 ? startDt : endDt;
  const absDiffMillis = Math.abs(diffMillis);

  // Working days info calculation
  const excludeSat = options?.excludeSaturday !== false;
  const excludeSun = options?.excludeSunday !== false;
  const onlyWorkingDays = !!options?.onlyWorkingDays;

  const workingDaysInfo = calculateWorkingDaysInfo(earlier, later, excludeSat, excludeSun);
  workingDaysInfo.isWorkingDaysOnly = onlyWorkingDays;

  // Progress calculation
  let progressPercent: number | null = null;
  let nowBetween = false;
  const nowMillis = nowDt.toMillis();

  if (startMillis !== endMillis) {
    const minM = Math.min(startMillis, endMillis);
    const maxM = Math.max(startMillis, endMillis);
    if (nowMillis >= minM && nowMillis <= maxM) {
      nowBetween = true;
      const progress = ((nowMillis - minM) / (maxM - minM)) * 100;
      progressPercent = Math.min(100, Math.max(0, Number(progress.toFixed(1))));
    } else if (nowMillis > maxM) {
      progressPercent = 100;
    } else {
      progressPercent = 0;
    }
  }

  // If ONLY working days mode is selected, override results with business days logic
  if (onlyWorkingDays) {
    const wSec = workingDaysInfo.exactWorkingSeconds;
    const wDaysTotal = workingDaysInfo.workingDays;
    const wWeeksTotal = workingDaysInfo.workingWeeks;
    const wMonthsTotal = Number((wDaysTotal / 21.75).toFixed(2)); // ~21.75 working days/month

    const wWholeDays = Math.floor(wDaysTotal);
    const wWholeWeeks = Math.floor(wWholeDays / 5);
    const wRemainingDays = wWholeDays % 5;
    const wHours = Math.floor((wSec % 86400) / 3600);
    const wMinutes = Math.floor((wSec % 3600) / 60);
    const wSeconds = Math.floor(wSec % 60);

    const wBreakdown: DurationBreakdownData = {
      years: Math.floor(wWholeDays / 261),
      months: Math.floor((wWholeDays % 261) / 21.75),
      weeks: wWholeWeeks,
      days: wRemainingDays,
      hours: wHours,
      minutes: wMinutes,
      seconds: wSeconds,
      milliseconds: 0,
    };

    const wTotals: DurationTotalsData = {
      totalMonths: wMonthsTotal,
      totalWeeks: wWeeksTotal,
      totalDays: wDaysTotal,
      totalHours: Math.floor(wSec / 3600),
      totalMinutes: Math.floor(wSec / 60),
      totalSeconds: wSec,
      totalMilliseconds: wSec * 1000,
    };

    const wParts: string[] = [];
    if (wBreakdown.years > 0) {
      wParts.push(`${wBreakdown.years} ${wBreakdown.years === 1 ? 'arbetsår' : 'arbetsår'}`);
    }
    if (wBreakdown.months > 0) {
      wParts.push(`${wBreakdown.months} ${wBreakdown.months === 1 ? 'arbetsmånad' : 'arbetsmånader'}`);
    }
    if (wBreakdown.weeks > 0 && wBreakdown.years === 0) {
      wParts.push(`${wBreakdown.weeks} ${wBreakdown.weeks === 1 ? 'arbetsvecka' : 'arbetsveckor'}`);
    }
    if (wRemainingDays > 0 || (wBreakdown.years === 0 && wBreakdown.months === 0 && wBreakdown.weeks === 0)) {
      wParts.push(`${wRemainingDays} ${wRemainingDays === 1 ? 'arbetsdag' : 'arbetsdagar'}`);
    }
    const wPrimaryFormatted = wParts.join(' · ');

    const hh = wHours.toString().padStart(2, '0');
    const mm = wMinutes.toString().padStart(2, '0');
    const ss = wSeconds.toString().padStart(2, '0');
    const wTimeFormatted = `${hh} : ${mm} : ${ss}`;

    const wExactSentence = `${wWholeDays} ${wWholeDays === 1 ? 'arbetsdag' : 'arbetsdagar'} (${workingDaysInfo.workingWeeks} arbetsveckor)${
      wHours > 0 || wMinutes > 0 ? `, ${wHours} tim och ${wMinutes} min` : ''
    } · ${workingDaysInfo.weekendDays} ${workingDaysInfo.weekendDays === 1 ? 'helgdag' : 'helgdagar'} exkluderade`;

    const wHumanSentence = `cirka ${wWholeDays} arbetsdagar (${workingDaysInfo.workingWeeks} arbetsveckor, ${workingDaysInfo.weekendDays} helgdagar borträknade)`;

    return {
      direction,
      statusLabel: 'Endast arbetsdagar (helger exkluderade)',
      isLive: false,
      breakdown: wBreakdown,
      totals: wTotals,
      primaryFormatted: wPrimaryFormatted,
      timeFormatted: wTimeFormatted,
      exactSentence: wExactSentence,
      humanSentence: wHumanSentence,
      progressPercent,
      nowBetween,
      workingDaysInfo,
    };
  }

  // Exact calendar difference
  // Luxon's diff handles year lengths (leap vs non-leap), variable month days, and DST transitions
  const diffCalendar = later.diff(earlier, [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
  ]);

  const rawYears = Math.floor(diffCalendar.years || 0);
  const rawMonths = Math.floor(diffCalendar.months || 0);
  const rawDays = Math.floor(diffCalendar.days || 0);
  const rawHours = Math.floor(diffCalendar.hours || 0);
  const rawMinutes = Math.floor(diffCalendar.minutes || 0);
  const rawSeconds = Math.floor(diffCalendar.seconds || 0);
  const rawMilliseconds = Math.floor(diffCalendar.milliseconds || 0);

  const breakdown: DurationBreakdownData = {
    years: rawYears,
    months: rawMonths,
    weeks: Math.floor(rawDays / 7),
    days: rawDays,
    hours: rawHours,
    minutes: rawMinutes,
    seconds: rawSeconds,
    milliseconds: rawMilliseconds,
  };

  // Exact totals
  const totalSeconds = Math.floor(absDiffMillis / 1000);
  const totalMinutes = Math.floor(absDiffMillis / 60000);
  const totalHours = Math.floor(absDiffMillis / 3600000);
  const totalDays = Number((absDiffMillis / 86400000).toFixed(2));
  const totalWeeks = Number((absDiffMillis / (86400000 * 7)).toFixed(2));

  // Calendar accurate total months
  const totalMonthsDiff = later.diff(earlier, 'months').months || 0;
  const totalMonths = Number(totalMonthsDiff.toFixed(2));

  const totals: DurationTotalsData = {
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    totalMilliseconds: absDiffMillis,
  };

  // Status label
  let statusLabel = 'Samma tidpunkt';
  if (direction === 'future') {
    statusLabel = endMillis > nowDt.toMillis() ? 'Tid kvar' : 'Tid sedan';
  } else if (direction === 'past') {
    statusLabel = 'Tid sedan';
  }

  // Formatted main representation: "2 år · 4 månader · 13 dagar"
  const dateParts: string[] = [];
  if (rawYears > 0) {
    dateParts.push(`${rawYears} ${rawYears === 1 ? 'år' : 'år'}`);
  }
  if (rawMonths > 0) {
    dateParts.push(`${rawMonths} ${rawMonths === 1 ? 'månad' : 'månader'}`);
  }
  if (rawDays > 0 || (rawYears === 0 && rawMonths === 0)) {
    dateParts.push(`${rawDays} ${rawDays === 1 ? 'dag' : 'dagar'}`);
  }
  const primaryFormatted = dateParts.length > 0 ? dateParts.join(' · ') : '0 dagar';

  // Formatted time: "08 : 24 : 17"
  const hh = rawHours.toString().padStart(2, '0');
  const mm = rawMinutes.toString().padStart(2, '0');
  const ss = rawSeconds.toString().padStart(2, '0');
  const timeFormatted = `${hh} : ${mm} : ${ss}`;

  // Complete exact sentence
  const exactSentence = buildExactSentence(breakdown);

  // Human readable sentence
  const humanSentence = buildHumanSentence(breakdown, totals);

  return {
    direction,
    statusLabel,
    isLive: false,
    breakdown,
    totals,
    primaryFormatted,
    timeFormatted,
    exactSentence,
    humanSentence,
    progressPercent,
    nowBetween,
    workingDaysInfo,
  };
}

function buildExactSentence(b: DurationBreakdownData): string {
  const parts: string[] = [];
  if (b.years > 0) parts.push(`${b.years} ${b.years === 1 ? 'år' : 'år'}`);
  if (b.months > 0) parts.push(`${b.months} ${b.months === 1 ? 'månad' : 'månader'}`);
  if (b.days > 0) parts.push(`${b.days} ${b.days === 1 ? 'dag' : 'dagar'}`);
  if (b.hours > 0) parts.push(`${b.hours} ${b.hours === 1 ? 'timme' : 'timmar'}`);
  if (b.minutes > 0) parts.push(`${b.minutes} ${b.minutes === 1 ? 'minut' : 'minuter'}`);
  if (b.seconds > 0 || parts.length === 0) parts.push(`${b.seconds} ${b.seconds === 1 ? 'sekund' : 'sekunder'}`);

  if (parts.length === 1) return parts[0];
  const lastPart = parts.pop();
  return `${parts.join(', ')} och ${lastPart}`;
}

function buildHumanSentence(b: DurationBreakdownData, totals: DurationTotalsData): string {
  if (b.years >= 1) {
    if (b.months === 0) {
      return b.years === 1 ? 'ungefär 1 år' : `ungefär ${b.years} år`;
    }
    const monthText = b.months === 1 ? '1 månad' : `${b.months} månader`;
    return `ungefär ${b.years} ${b.years === 1 ? 'år' : 'år'} och ${monthText}`;
  }

  if (b.months >= 1) {
    if (b.days <= 3) {
      return b.months === 1 ? 'cirka en månad' : `cirka ${b.months} månader`;
    }
    const weekCount = Math.round(b.days / 7);
    if (weekCount > 0) {
      return `cirka ${b.months} ${b.months === 1 ? 'månad' : 'månader'} och ${weekCount} ${weekCount === 1 ? 'vecka' : 'veckor'}`;
    }
    return `cirka ${b.months} ${b.months === 1 ? 'månad' : 'månader'}`;
  }

  if (totals.totalDays >= 7) {
    const wholeWeeks = Math.round(totals.totalWeeks);
    return `cirka ${wholeWeeks} ${wholeWeeks === 1 ? 'vecka' : 'veckor'}`;
  }

  if (totals.totalDays >= 1) {
    if (b.hours >= 6) {
      return `ungefär ${b.days} ${b.days === 1 ? 'dag' : 'dagar'} och ${b.hours} timmar`;
    }
    return b.days === 1 ? 'cirka 1 dag' : `cirka ${b.days} dagar`;
  }

  if (totals.totalHours >= 1) {
    if (b.minutes >= 10) {
      return `ungefär ${b.hours} ${b.hours === 1 ? 'timme' : 'timmar'} och ${b.minutes} minuter`;
    }
    return b.hours === 1 ? 'cirka 1 timme' : `cirka ${b.hours} timmar`;
  }

  if (totals.totalMinutes >= 1) {
    return b.minutes === 1 ? 'cirka 1 minut' : `cirka ${b.minutes} minuter`;
  }

  return 'mindre än en minut';
}

/**
 * Retrieves comprehensive calendar metadata for a single DateTime instance
 */
export function getDateMetadata(dt: DateTime): DateMetadata {
  if (!dt.isValid) {
    return {
      dateString: '',
      timeString: '',
      weekdayName: 'Ogiltigt',
      isoWeekNumber: 0,
      dayOfYear: 0,
      daysInYear: 365,
      daysRemainingInYear: 0,
      quarter: 1,
      isLeapYear: false,
      isoString: '',
      unixTimestampSeconds: 0,
      unixTimestampMillis: 0,
      timezoneName: '',
      utcOffsetFormatted: '',
      formattedDisplay: '',
    };
  }

  const weekdayNames = [
    'Måndag',
    'Tisdag',
    'Onsdag',
    'Torsdag',
    'Fredag',
    'Lördag',
    'Söndag',
  ];
  const weekdayName = weekdayNames[dt.weekday - 1] || '';

  const isLeap = dt.isInLeapYear;
  const daysInYear = dt.daysInYear;
  const dayOfYear = Math.floor(dt.ordinal);
  const daysRemainingInYear = daysInYear - dayOfYear;
  const quarter = dt.quarter;
  const isoWeekNumber = dt.weekNumber;

  const isoString = dt.toISO() || '';
  const unixTimestampMillis = dt.toMillis();
  const unixTimestampSeconds = Math.floor(unixTimestampMillis / 1000);
  const utcOffsetFormatted = formatUtcOffset(dt.zoneName, dt);

  // e.g. "8 september 2026, 14:30"
  const formattedDisplay = dt.setLocale('sv-SE').toFormat('d MMMM yyyy, HH:mm:ss');

  return {
    dateString: formatDateIso(dt),
    timeString: formatTimeIso(dt),
    weekdayName,
    isoWeekNumber,
    dayOfYear,
    daysInYear,
    daysRemainingInYear,
    quarter,
    isLeapYear: isLeap,
    isoString,
    unixTimestampSeconds,
    unixTimestampMillis,
    timezoneName: dt.zoneName,
    utcOffsetFormatted,
    formattedDisplay,
  };
}

function getEmptyResult(options?: WorkingDaysOptions): DurationResult {
  const excludeSat = options?.excludeSaturday !== false;
  const excludeSun = options?.excludeSunday !== false;
  const isWorkingDaysOnly = !!options?.onlyWorkingDays;

  return {
    direction: 'same',
    statusLabel: isWorkingDaysOnly ? 'Endast arbetsdagar (0 dagar)' : 'Samma tidpunkt',
    isLive: false,
    breakdown: {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    },
    totals: {
      totalMonths: 0,
      totalWeeks: 0,
      totalDays: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
      totalMilliseconds: 0,
    },
    primaryFormatted: isWorkingDaysOnly ? '0 arbetsdagar' : '0 dagar',
    timeFormatted: '00 : 00 : 00',
    exactSentence: isWorkingDaysOnly ? '0 arbetsdagar (ingen tidsskillnad)' : 'Ingen skillnad i tid',
    humanSentence: 'samma tidpunkt',
    progressPercent: null,
    nowBetween: false,
    workingDaysInfo: {
      isWorkingDaysOnly,
      workingDays: 0,
      weekendDays: 0,
      saturdays: 0,
      sundays: 0,
      workingWeeks: 0,
      standardWorkHours8h: 0,
      exactWorkingSeconds: 0,
      exactWorkingHours: 0,
      exactWorkingMinutes: 0,
      excludeSaturday: excludeSat,
      excludeSunday: excludeSun,
      percentageWorkingDays: 0,
    },
  };
}
