import { FavoriteItem, HistoryItem } from '../types';

const HISTORY_KEY = 'chronos_history_v1';
const FAVORITES_KEY = 'chronos_favorites_v1';
const THEME_KEY = 'chronos_theme_v1';

export const DEFAULT_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-new-year',
    title: 'Nyårsafton (Nedräkning)',
    startDate: '2026-01-01',
    startTime: '00:00:00',
    endDate: '2027-01-01',
    endTime: '00:00:00',
    startIsNow: false,
    endIsNow: false,
    timezone: 'Europe/Stockholm',
  },
  {
    id: 'fav-summer',
    title: 'Midsommarafton',
    startDate: '2026-01-01',
    startTime: '00:00:00',
    endDate: '2026-06-19',
    endTime: '12:00:00',
    startIsNow: false,
    endIsNow: false,
    timezone: 'Europe/Stockholm',
  },
  {
    id: 'fav-decade',
    title: 'Årtiondet 2020 – 2030',
    startDate: '2020-01-01',
    startTime: '00:00:00',
    endDate: '2030-01-01',
    endTime: '00:00:00',
    startIsNow: false,
    endIsNow: false,
    timezone: 'UTC',
  },
];

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem[] {
  try {
    const current = getStoredHistory();
    // Check if identical to most recent entry to prevent duplicate noise
    if (
      current.length > 0 &&
      current[0].startDate === item.startDate &&
      current[0].endDate === item.endDate &&
      current[0].startIsNow === item.startIsNow &&
      current[0].endIsNow === item.endIsNow &&
      current[0].timezone === item.timezone
    ) {
      return current;
    }

    const newItem: HistoryItem = {
      ...item,
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };

    const updated = [newItem, ...current].slice(0, 15);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function getStoredFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return DEFAULT_FAVORITES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function saveFavoriteItem(item: Omit<FavoriteItem, 'id'>): FavoriteItem[] {
  try {
    const current = getStoredFavorites();
    const newItem: FavoriteItem = {
      ...item,
      id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    const updated = [newItem, ...current];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteFavoriteItem(id: string): FavoriteItem[] {
  try {
    const current = getStoredFavorites();
    const updated = current.filter((f) => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getStoredTheme(): 'light' | 'dark' | 'system' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function setStoredTheme(theme: 'light' | 'dark' | 'system'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
