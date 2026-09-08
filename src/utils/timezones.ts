import { DateTime } from 'luxon';

export interface TimezoneOption {
  zone: string;
  city: string;
  country: string;
  region: string;
  popular?: boolean;
}

export const POPULAR_TIMEZONES: TimezoneOption[] = [
  { zone: 'system', city: 'Lokal tid', country: 'Systemstandard', region: 'Local', popular: true },
  { zone: 'UTC', city: 'UTC (GMT)', country: 'Universell tid', region: 'Global', popular: true },
  { zone: 'Europe/Stockholm', city: 'Stockholm', country: 'Sverige', region: 'Europa', popular: true },
  { zone: 'Europe/London', city: 'London', country: 'Storbritannien', region: 'Europa', popular: true },
  { zone: 'Europe/Paris', city: 'Paris', country: 'Frankrike', region: 'Europa', popular: true },
  { zone: 'Europe/Berlin', city: 'Berlin', country: 'Tyskland', region: 'Europa', popular: true },
  { zone: 'Europe/Helsinki', city: 'Helsingfors', country: 'Finland', region: 'Europa', popular: true },
  { zone: 'Europe/Oslo', city: 'Oslo', country: 'Norge', region: 'Europa', popular: true },
  { zone: 'Europe/Copenhagen', city: 'Köpenhamn', country: 'Danmark', region: 'Europa', popular: true },
  { zone: 'America/New_York', city: 'New York', country: 'USA (Öst)', region: 'Amerika', popular: true },
  { zone: 'America/Chicago', city: 'Chicago', country: 'USA (Central)', region: 'Amerika', popular: true },
  { zone: 'America/Denver', city: 'Denver', country: 'USA (Berg)', region: 'Amerika', popular: false },
  { zone: 'America/Los_Angeles', city: 'Los Angeles', country: 'USA (Väst)', region: 'Amerika', popular: true },
  { zone: 'America/Toronto', city: 'Toronto', country: 'Kanada', region: 'Amerika', popular: false },
  { zone: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brasilien', region: 'Amerika', popular: true },
  { zone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', region: 'Asien', popular: true },
  { zone: 'Asia/Dubai', city: 'Dubai', country: 'Förenade Arabemiraten', region: 'Mellanöstern', popular: true },
  { zone: 'Asia/Singapore', city: 'Singapore', country: 'Singapore', region: 'Asien', popular: true },
  { zone: 'Asia/Hong_Kong', city: 'Hongkong', country: 'Kina', region: 'Asien', popular: true },
  { zone: 'Asia/Bangkok', city: 'Bangkok', country: 'Thailand', region: 'Asien', popular: false },
  { zone: 'Australia/Sydney', city: 'Sydney', country: 'Australien', region: 'Oceanien', popular: true },
  { zone: 'Australia/Melbourne', city: 'Melbourne', country: 'Australien', region: 'Oceanien', popular: false },
  { zone: 'Pacific/Auckland', city: 'Auckland', country: 'Nya Zeeland', region: 'Oceanien', popular: false },
  { zone: 'Pacific/Honolulu', city: 'Honolulu', country: 'USA (Hawaii)', region: 'Oceanien', popular: false },
];

export function getSystemTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Stockholm';
  } catch {
    return 'Europe/Stockholm';
  }
}

export function resolveZone(zone: string): string {
  if (zone === 'system' || !zone) {
    return getSystemTimezone();
  }
  return zone;
}

export function formatUtcOffset(zone: string, referenceDate?: DateTime): string {
  try {
    const actualZone = resolveZone(zone);
    const dt = (referenceDate || DateTime.now()).setZone(actualZone);
    const offsetMinutes = dt.offset;
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60).toString().padStart(2, '0');
    const mins = (absMinutes % 60).toString().padStart(2, '0');
    return `UTC${sign}${hours}:${mins}`;
  } catch {
    return 'UTC+00:00';
  }
}
