import { useState, useEffect, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';
import {
  CalculationState,
  FavoriteItem,
  HistoryItem,
} from './types';
import {
  calculateDuration,
  formatDateIso,
  formatTimeIso,
  getDateMetadata,
  getNowInZone,
  parseDateTime,
} from './utils/dateCalculations';
import {
  clearAllHistory,
  deleteFavoriteItem,
  deleteHistoryItem,
  getStoredFavorites,
  getStoredHistory,
  getStoredTheme,
  saveFavoriteItem,
  saveHistoryItem,
  setStoredTheme,
} from './utils/storage';
import { parseStateFromURL, serializeStateToURL } from './utils/urlState';
import { Header } from './components/Header';
import { DateRangeSection } from './components/DateRangeSection';
import { WorkdayFilterControl } from './components/WorkdayFilterControl';
import { DurationDisplay } from './components/DurationDisplay';
import { TimeUnitConverter } from './components/TimeUnitConverter';
import { ComparisonView } from './components/ComparisonView';
import { DurationBreakdown } from './components/DurationBreakdown';
import { Timeline } from './components/Timeline';
import { DateMetadataCard } from './components/DateMetadataCard';
import { QuickActions, QuickPreset } from './components/QuickActions';
import { TimezoneSelector } from './components/TimezoneSelector';
import { HistoryModal } from './components/HistoryModal';
import { FavoritesModal } from './components/FavoritesModal';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AboutModal } from './components/AboutModal';
import { InteractiveCalendarModal } from './components/InteractiveCalendarModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { downloadDataAsPng } from './utils/exportPng';
import { downloadDataAsCsv } from './utils/exportCsv';
import wallpaperBg from './assets/images/aluminium_os_bg_1788863498137.jpg';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => getStoredTheme());

  // System dark preference listener
  useEffect(() => {
    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleCycleTheme = () => {
    const next: Record<'system' | 'light' | 'dark', 'system' | 'light' | 'dark'> = {
      system: 'light',
      light: 'dark',
      dark: 'system',
    };
    const nextTheme = next[theme];
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  // Default initial dates (e.g. 2024-01-01 to Now)
  const initialUrlState = useMemo(() => parseStateFromURL('system'), []);

  const [state, setState] = useState<CalculationState>(() => {
    const now = DateTime.now();
    const twoYearsAgo = now.minus({ years: 2, months: 4, days: 13 });

    return {
      startDate: initialUrlState?.startDate || formatDateIso(twoYearsAgo),
      startTime: initialUrlState?.startTime || '00:00:00',
      endDate: initialUrlState?.endDate || formatDateIso(now),
      endTime: initialUrlState?.endTime || formatTimeIso(now),
      startIsNow: initialUrlState?.startIsNow || false,
      endIsNow: initialUrlState?.endIsNow !== undefined ? initialUrlState.endIsNow : true,
      timezone: initialUrlState?.timezone || 'system',
      isHumanReadable: initialUrlState?.isHumanReadable || false,
      includeMilliseconds: false,
      onlyWorkingDays: initialUrlState?.onlyWorkingDays || false,
      excludeSaturday:
        initialUrlState?.excludeSaturday !== undefined ? initialUrlState.excludeSaturday : true,
      excludeSunday:
        initialUrlState?.excludeSunday !== undefined ? initialUrlState.excludeSunday : true,
    };
  });

  // Current live tick (updates once every second when live is active)
  const [currentNow, setCurrentNow] = useState<DateTime>(() => getNowInZone(state.timezone));

  useEffect(() => {
    const isLive = state.startIsNow || state.endIsNow;
    const updateTick = () => {
      setCurrentNow(getNowInZone(state.timezone));
    };

    updateTick();

    if (!isLive) return;

    const intervalId = setInterval(updateTick, 1000);
    return () => clearInterval(intervalId);
  }, [state.startIsNow, state.endIsNow, state.timezone]);

  // Sync state to URL without polluting browser back history
  useEffect(() => {
    serializeStateToURL(state, true);
  }, [state]);

  // Modals & Drawers state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('end');

  // History & Favorites state
  const [history, setHistory] = useState<HistoryItem[]>(() => getStoredHistory());
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getStoredFavorites());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Compute actual Start and End DateTime instances
  const startDt = useMemo(() => {
    if (state.startIsNow) return currentNow;
    return parseDateTime(state.startDate, state.startTime, state.timezone);
  }, [state.startIsNow, state.startDate, state.startTime, state.timezone, currentNow]);

  const endDt = useMemo(() => {
    if (state.endIsNow) return currentNow;
    return parseDateTime(state.endDate, state.endTime, state.timezone);
  }, [state.endIsNow, state.endDate, state.endTime, state.timezone, currentNow]);

  // Primary calculation result
  const durationResult = useMemo(() => {
    const res = calculateDuration(startDt, endDt, currentNow, {
      onlyWorkingDays: state.onlyWorkingDays,
      excludeSaturday: state.excludeSaturday,
      excludeSunday: state.excludeSunday,
    });
    res.isLive = state.startIsNow || state.endIsNow;
    return res;
  }, [
    startDt,
    endDt,
    currentNow,
    state.startIsNow,
    state.endIsNow,
    state.onlyWorkingDays,
    state.excludeSaturday,
    state.excludeSunday,
  ]);

  // Calendar metadata
  const startMetadata = useMemo(() => getDateMetadata(startDt), [startDt]);
  const endMetadata = useMemo(() => getDateMetadata(endDt), [endDt]);
  const nowMetadata = useMemo(() => getDateMetadata(currentNow), [currentNow]);

  // Save to history on valid change (debounced)
  useEffect(() => {
    if (!startDt.isValid || !endDt.isValid) return;

    const timer = setTimeout(() => {
      const summary = durationResult.exactSentence;
      const updated = saveHistoryItem({
        startDate: state.startIsNow ? 'Nu' : state.startDate,
        startTime: state.startTime,
        endDate: state.endIsNow ? 'Nu' : state.endDate,
        endTime: state.endTime,
        startIsNow: state.startIsNow,
        endIsNow: state.endIsNow,
        timezone: state.timezone,
        summary,
      });
      setHistory(updated);
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    state.startDate,
    state.startTime,
    state.endDate,
    state.endTime,
    state.startIsNow,
    state.endIsNow,
    state.timezone,
    durationResult.exactSentence,
    startDt.isValid,
    endDt.isValid,
  ]);

  // Swap dates
  const handleSwapDates = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startDate: prev.endIsNow ? formatDateIso(currentNow) : prev.endDate,
      startTime: prev.endIsNow ? formatTimeIso(currentNow) : prev.endTime,
      endDate: prev.startIsNow ? formatDateIso(currentNow) : prev.startDate,
      endTime: prev.startIsNow ? formatTimeIso(currentNow) : prev.startTime,
      startIsNow: prev.endIsNow,
      endIsNow: prev.startIsNow,
    }));
    triggerToast('Datumen växlades');
  }, [currentNow, triggerToast]);

  // Reset dates
  const handleResetDates = useCallback(() => {
    const now = getNowInZone(state.timezone);
    const startDefault = now.minus({ years: 1 });
    setState({
      startDate: formatDateIso(startDefault),
      startTime: '00:00:00',
      endDate: formatDateIso(now),
      endTime: formatTimeIso(now),
      startIsNow: false,
      endIsNow: true,
      timezone: state.timezone,
      isHumanReadable: false,
      includeMilliseconds: false,
    });
    triggerToast('Återställd till standard');
  }, [state.timezone, triggerToast]);

  // Copy text helper
  const handleCopyText = useCallback(
    (text: string, label: string) => {
      try {
        navigator.clipboard.writeText(text);
        triggerToast(label);
      } catch {
        triggerToast('Kunde inte kopiera');
      }
    },
    [triggerToast]
  );

  // Share URL helper
  const handleShare = useCallback(() => {
    const shareUrl = serializeStateToURL(state, false);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      triggerToast('Dela-länk kopierad till urklipp');
    }
  }, [state, triggerToast]);

  // Presets handling
  const handleSelectPreset = useCallback(
    (preset: QuickPreset['type']) => {
      const now = getNowInZone(state.timezone);
      let targetDt: DateTime | null = null;
      let setEndNow = false;

      switch (preset) {
        case 'now':
          setEndNow = true;
          break;
        case 'today':
          targetDt = now.startOf('day');
          break;
        case 'yesterday':
          targetDt = now.minus({ days: 1 }).startOf('day');
          break;
        case 'tomorrow':
          targetDt = now.plus({ days: 1 }).startOf('day');
          break;
        case 'plus_7d':
          targetDt = startDt.isValid ? startDt.plus({ days: 7 }) : now.plus({ days: 7 });
          break;
        case 'plus_30d':
          targetDt = startDt.isValid ? startDt.plus({ days: 30 }) : now.plus({ days: 30 });
          break;
        case 'plus_3m':
          targetDt = startDt.isValid ? startDt.plus({ months: 3 }) : now.plus({ months: 3 });
          break;
        case 'plus_6m':
          targetDt = startDt.isValid ? startDt.plus({ months: 6 }) : now.plus({ months: 6 });
          break;
        case 'plus_1y':
          targetDt = startDt.isValid ? startDt.plus({ years: 1 }) : now.plus({ years: 1 });
          break;
        case 'start_of_year':
          targetDt = now.startOf('year');
          break;
        case 'end_of_year':
          targetDt = now.endOf('year').startOf('second');
          break;
      }

      if (setEndNow) {
        setState((prev) => ({
          ...prev,
          endIsNow: true,
          endDate: formatDateIso(now),
          endTime: formatTimeIso(now),
        }));
        triggerToast('Slutdatum satt till Nu (Live)');
      } else if (targetDt && targetDt.isValid) {
        setState((prev) => ({
          ...prev,
          endIsNow: false,
          endDate: formatDateIso(targetDt!),
          endTime: formatTimeIso(targetDt!),
        }));
        triggerToast('Slutdatum uppdaterat');
      }
    },
    [state.timezone, startDt, triggerToast]
  );

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setIsFavoritesOpen(false);
        setIsExportOpen(false);
        setIsShortcutsOpen(false);
        setIsAboutOpen(false);
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setState((prev) => ({ ...prev, endIsNow: !prev.endIsNow }));
        triggerToast(state.endIsNow ? 'Låste upp från Nu' : 'Slutdatum satt till Nu (Live)');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSwapDates();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopyText(
          state.isHumanReadable ? durationResult.humanSentence : durationResult.exactSentence,
          'Resultat kopierat'
        );
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetDates();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwapDates, handleCopyText, handleResetDates, state.endIsNow, state.isHumanReadable, durationResult, triggerToast]);

  // Load from history item
  const handleSelectHistory = (item: HistoryItem) => {
    setState((prev) => ({
      ...prev,
      startDate: item.startDate === 'Nu' ? formatDateIso(currentNow) : item.startDate,
      startTime: item.startTime,
      endDate: item.endDate === 'Nu' ? formatDateIso(currentNow) : item.endDate,
      endTime: item.endTime,
      startIsNow: item.startIsNow,
      endIsNow: item.endIsNow,
      timezone: item.timezone || prev.timezone,
    }));
    triggerToast('Tidigare beräkning laddad');
  };

  // Load from favorite item
  const handleSelectFavorite = (fav: FavoriteItem) => {
    setState((prev) => ({
      ...prev,
      startDate: fav.startDate,
      startTime: fav.startTime,
      endDate: fav.endDate,
      endTime: fav.endTime,
      startIsNow: fav.startIsNow,
      endIsNow: fav.endIsNow,
      timezone: fav.timezone || prev.timezone,
    }));
    triggerToast(`Favorit "${fav.title}" laddad`);
  };

  // Save new favorite
  const handleSaveFavorite = (title: string) => {
    const updated = saveFavoriteItem({
      title,
      startDate: state.startIsNow ? 'Nu' : state.startDate,
      startTime: state.startTime,
      endDate: state.endIsNow ? 'Nu' : state.endDate,
      endTime: state.endTime,
      startIsNow: state.startIsNow,
      endIsNow: state.endIsNow,
      timezone: state.timezone,
    });
    setFavorites(updated);
    triggerToast(`"${title}" sparades i favoriter`);
  };

  // Direct export helpers
  const handleExportFavoritesPng = useCallback(async () => {
    try {
      await downloadDataAsPng(favorites, history, {
        theme: theme === 'light' ? 'light' : 'dark',
        includeCurrentResult: false,
        includeFavorites: true,
        includeHistory: false,
        timezone: state.timezone,
      });
      triggerToast('Favoriter exporterades som PNG');
    } catch {
      triggerToast('Kunde inte exportera');
    }
  }, [favorites, history, theme, state.timezone, triggerToast]);

  const handleExportHistoryPng = useCallback(async () => {
    try {
      await downloadDataAsPng(favorites, history, {
        theme: theme === 'light' ? 'light' : 'dark',
        includeCurrentResult: false,
        includeFavorites: false,
        includeHistory: true,
        timezone: state.timezone,
      });
      triggerToast('Historik exporterades som PNG');
    } catch {
      triggerToast('Kunde inte exportera');
    }
  }, [favorites, history, theme, state.timezone, triggerToast]);

  const handleExportHistoryCsv = useCallback(() => {
    try {
      downloadDataAsCsv(history, favorites, {
        delimiter: ';',
        includeCurrentResult: false,
        includeHistory: true,
        includeFavorites: false,
        timezone: state.timezone,
      });
      triggerToast('Historik exporterades som CSV');
    } catch {
      triggerToast('Kunde inte exportera');
    }
  }, [history, favorites, state.timezone, triggerToast]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas-pattern text-neutral-900 dark:text-neutral-100 transition-colors relative overflow-hidden">
      {/* Full-bleed fixed OS wallpaper background image across all devices */}
      <div className="wallpaper-background-layer fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <img
          src={wallpaperBg}
          alt="Modern OS Wallpaper Background"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== window.location.origin + '/wallpaper.jpg') {
              target.src = '/wallpaper.jpg';
            }
          }}
          className="w-full h-full min-h-[100dvh] object-cover object-center select-none"
        />
        {/* Harmonizing atmospheric tint layer to guarantee pristine WCAG AA contrast & typography legibility */}
        <div className="absolute inset-0 bg-white/10 dark:bg-[#07090e]/45 transition-colors" />
        {/* Subtle radial vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20 dark:from-black/30 dark:via-transparent dark:to-black/45 pointer-events-none" />
      </div>

      {/* Background ambient lighting and micro-grid */}
      <div className="bg-grid-overlay" aria-hidden="true" />
      <div className="ambient-glow-top" aria-hidden="true" />

      {/* Top Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onShare={handleShare}
        theme={theme}
        onCycleTheme={handleCycleTheme}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Top Control Bar: Timezone & Quick actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-0.5 sm:pt-1">
          <div className="flex-1 min-w-0">
            <QuickActions
              onSelectPreset={handleSelectPreset}
              endIsNow={state.endIsNow}
            />
          </div>
          <div className="shrink-0 flex items-center justify-between md:justify-end gap-2">
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider md:hidden">
              Tidszon:
            </span>
            <TimezoneSelector
              currentZone={state.timezone}
              onChangeZone={(tz) => setState((prev) => ({ ...prev, timezone: tz }))}
            />
          </div>
        </div>

        {/* Date & Time Range Pickers Section */}
        <DateRangeSection
          startDate={state.startDate}
          startTime={state.startTime}
          endDate={state.endDate}
          endTime={state.endTime}
          startIsNow={state.startIsNow}
          endIsNow={state.endIsNow}
          onStartDateChange={(val) => setState((prev) => ({ ...prev, startDate: val }))}
          onStartTimeChange={(val) => setState((prev) => ({ ...prev, startTime: val }))}
          onEndDateChange={(val) => setState((prev) => ({ ...prev, endDate: val }))}
          onEndTimeChange={(val) => setState((prev) => ({ ...prev, endTime: val }))}
          onToggleStartNow={(val) => setState((prev) => ({ ...prev, startIsNow: val }))}
          onToggleEndNow={(val) => setState((prev) => ({ ...prev, endIsNow: val }))}
          onSwap={handleSwapDates}
          onReset={handleResetDates}
          startMetadata={startMetadata}
          endMetadata={endMetadata}
          startError={!startDt.isValid ? 'Ogiltigt startdatum eller tid' : null}
          endError={!endDt.isValid ? 'Ogiltigt slutdatum eller tid' : null}
          onOpenCalendar={(target) => {
            setCalendarTarget(target);
            setIsCalendarOpen(true);
          }}
        />

        {/* Workday & Weekend Filter Control */}
        <WorkdayFilterControl
          onlyWorkingDays={state.onlyWorkingDays}
          excludeSaturday={state.excludeSaturday}
          excludeSunday={state.excludeSunday}
          workingDaysInfo={durationResult.workingDaysInfo}
          onChangeOnlyWorkingDays={(val) =>
            setState((prev) => ({ ...prev, onlyWorkingDays: val }))
          }
          onChangeExcludeSaturday={(val) =>
            setState((prev) => ({ ...prev, excludeSaturday: val }))
          }
          onChangeExcludeSunday={(val) =>
            setState((prev) => ({ ...prev, excludeSunday: val }))
          }
        />

        {/* Main Result Display (Visual Hero Focus) */}
        <DurationDisplay
          result={durationResult}
          isHumanReadable={state.isHumanReadable}
          onToggleHumanReadable={(val) => setState((prev) => ({ ...prev, isHumanReadable: val }))}
          onCopyText={handleCopyText}
          isLive={state.startIsNow || state.endIsNow}
        />

        {/* Time Unit Conversion Section (e.g. Weeks to Hours, Months to Seconds) */}
        <TimeUnitConverter
          onCopyText={handleCopyText}
          currentTotals={durationResult.totals}
        />

        {/* Third Date Comparison & Multi-Range Delta Analyzer */}
        <ComparisonView
          startDate={state.startDate}
          startTime={state.startTime}
          endDate={state.endDate}
          endTime={state.endTime}
          startIsNow={state.startIsNow}
          endIsNow={state.endIsNow}
          timezone={state.timezone}
          currentNow={currentNow}
          baseDurationResult={durationResult}
          onCopyText={handleCopyText}
        />

        {/* Timeline & Progress Visualization */}
        <Timeline
          startDate={state.startDate}
          endDate={state.endDate}
          startMetadata={startMetadata}
          endMetadata={endMetadata}
          nowMetadata={nowMetadata}
          progressPercent={durationResult.progressPercent}
          nowBetween={durationResult.nowBetween}
        />

        {/* Detailed Breakdown Statistics Grid */}
        <DurationBreakdown
          totals={durationResult.totals}
          workingDaysInfo={durationResult.workingDaysInfo}
          onCopyText={handleCopyText}
        />

        {/* Deep Calendar & Date Metadata Inspector */}
        <DateMetadataCard
          startMetadata={startMetadata}
          endMetadata={endMetadata}
          onCopyText={handleCopyText}
        />
      </main>

      {/* Footer */}
      <Footer onOpenAbout={() => setIsAboutOpen(true)} />

      {/* Discrete Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={(id) => setHistory(deleteHistoryItem(id))}
        onClearAll={() => {
          clearAllHistory();
          setHistory([]);
          triggerToast('Historik rensades');
        }}
        onCopyText={handleCopyText}
        onExportPng={handleExportHistoryPng}
        onExportCsv={handleExportHistoryCsv}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectFavorite={handleSelectFavorite}
        onDeleteFavorite={(id) => setFavorites(deleteFavoriteItem(id))}
        onSaveCurrentAsFavorite={handleSaveFavorite}
        currentStartFormatted={`${state.startIsNow ? 'Nu' : state.startDate} ${state.startTime}`}
        currentEndFormatted={`${state.endIsNow ? 'Nu' : state.endDate} ${state.endTime}`}
        onExportPng={handleExportFavoritesPng}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        favorites={favorites}
        history={history}
        currentTimezone={state.timezone}
        durationResult={durationResult}
        calculationState={state}
        startFormatted={`${state.startIsNow ? 'Nu' : state.startDate} ${state.startTime}`}
        endFormatted={`${state.endIsNow ? 'Nu' : state.endDate} ${state.endTime}`}
        onSuccessToast={triggerToast}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <InteractiveCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        target={calendarTarget}
        onSelectDate={(dateStr, target) => {
          if (target === 'end') {
            setState((prev) => ({ ...prev, endDate: dateStr, endIsNow: false }));
            triggerToast(`Slutdatum inställt på ${dateStr}`);
          } else {
            setState((prev) => ({ ...prev, startDate: dateStr, startIsNow: false }));
            triggerToast(`Startdatum inställt på ${dateStr}`);
          }
        }}
        state={state}
        startMetadata={startMetadata}
        endMetadata={endMetadata}
      />
    </div>
  );
}
