export interface CalculationState {
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm or HH:mm:ss
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:mm or HH:mm:ss
  startIsNow: boolean;
  endIsNow: boolean;
  timezone: string;
  isHumanReadable: boolean;
  includeMilliseconds: boolean;
  onlyWorkingDays: boolean;
  excludeSaturday: boolean;
  excludeSunday: boolean;
}

export type TimeDirection = 'past' | 'future' | 'same';

export interface WorkingDaysInfo {
  isWorkingDaysOnly: boolean;
  workingDays: number;
  weekendDays: number; // total excluded weekend days
  saturdays: number;
  sundays: number;
  workingWeeks: number; // workingDays / 5
  standardWorkHours8h: number; // workingDays * 8
  exactWorkingSeconds: number;
  exactWorkingHours: number;
  exactWorkingMinutes: number;
  excludeSaturday: boolean;
  excludeSunday: boolean;
  percentageWorkingDays: number; // e.g. 71.4%
}

export interface DurationBreakdownData {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface DurationTotalsData {
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalMilliseconds: number;
}

export interface DurationResult {
  direction: TimeDirection;
  statusLabel: string; // 'Tid sedan' | 'Tid kvar' | 'Samma tidpunkt'
  isLive: boolean;
  breakdown: DurationBreakdownData;
  totals: DurationTotalsData;
  primaryFormatted: string;   // e.g. "2 år · 4 månader · 13 dagar"
  timeFormatted: string;      // e.g. "08 : 24 : 17"
  exactSentence: string;      // e.g. "2 år, 4 månader, 13 dagar, 8 timmar, 24 minuter och 17 sekunder"
  humanSentence: string;      // e.g. "ungefär 2 år och 4 månader"
  progressPercent: number | null; // 0 - 100 if now is between start and end
  nowBetween: boolean;
  workingDaysInfo: WorkingDaysInfo;
}

export interface DateMetadata {
  dateString: string;
  timeString: string;
  weekdayName: string;
  isoWeekNumber: number;
  dayOfYear: number;
  daysInYear: number;
  daysRemainingInYear: number;
  quarter: number;
  isLeapYear: boolean;
  isoString: string;
  unixTimestampSeconds: number;
  unixTimestampMillis: number;
  timezoneName: string;
  utcOffsetFormatted: string;
  formattedDisplay: string;
}

export interface HistoryItem {
  id: string;
  createdAt: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startIsNow: boolean;
  endIsNow: boolean;
  timezone: string;
  summary: string;
}

export interface FavoriteItem {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startIsNow: boolean;
  endIsNow: boolean;
  timezone: string;
}
