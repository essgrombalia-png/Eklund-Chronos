import { CalculationState } from '../types';

export function parseStateFromURL(defaultZone: string): Partial<CalculationState> | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('start') && !params.has('end')) {
      return null;
    }

    const state: Partial<CalculationState> = {};

    const start = params.get('start');
    const startTime = params.get('startTime');
    const end = params.get('end');
    const endTime = params.get('endTime');
    const timezone = params.get('timezone');
    const startIsNow = params.get('startNow') === '1' || params.get('startNow') === 'true';
    const endIsNow = params.get('endNow') === '1' || params.get('endNow') === 'true' || end === 'now';
    const human = params.get('human') === '1' || params.get('human') === 'true';
    const workdays = params.get('workdays') === '1' || params.get('workdays') === 'true';
    const noSat = params.get('noSat') === '0' || params.get('excludeSat') === 'false';
    const noSun = params.get('noSun') === '0' || params.get('excludeSun') === 'false';

    if (start) state.startDate = start;
    if (startTime) state.startTime = startTime;
    if (end && end !== 'now') state.endDate = end;
    if (endTime) state.endTime = endTime;
    if (timezone) state.timezone = timezone;
    if (params.has('startNow')) state.startIsNow = startIsNow;
    if (params.has('endNow') || end === 'now') state.endIsNow = endIsNow;
    if (params.has('human')) state.isHumanReadable = human;
    if (params.has('workdays')) state.onlyWorkingDays = workdays;
    if (params.has('noSat') || params.has('excludeSat')) state.excludeSaturday = !noSat;
    if (params.has('noSun') || params.has('excludeSun')) state.excludeSunday = !noSun;

    return state;
  } catch (err) {
    console.error('Kunde inte läsa URL-parametrar:', err);
    return null;
  }
}

export function serializeStateToURL(state: CalculationState, replaceHistory = true): string {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams();
  if (state.startIsNow) {
    params.set('startNow', '1');
  } else {
    params.set('start', state.startDate);
    if (state.startTime && state.startTime !== '00:00:00' && state.startTime !== '00:00') {
      params.set('startTime', state.startTime);
    }
  }

  if (state.endIsNow) {
    params.set('endNow', '1');
  } else {
    params.set('end', state.endDate);
    if (state.endTime && state.endTime !== '00:00:00' && state.endTime !== '00:00') {
      params.set('endTime', state.endTime);
    }
  }

  if (state.timezone && state.timezone !== 'system') {
    params.set('timezone', state.timezone);
  }

  if (state.isHumanReadable) {
    params.set('human', '1');
  }

  if (state.onlyWorkingDays) {
    params.set('workdays', '1');
    if (!state.excludeSaturday) {
      params.set('excludeSat', 'false');
    }
    if (!state.excludeSunday) {
      params.set('excludeSun', 'false');
    }
  }

  const newSearch = params.toString() ? `?${params.toString()}` : '';
  const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`;

  if (replaceHistory && window.location.search !== newSearch) {
    window.history.replaceState(null, '', newUrl);
  }

  return window.location.origin + newUrl;
}
