import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { DateMetadata } from '../types';
import { DateTime } from 'luxon';

interface TimelineProps {
  startDate: string;
  endDate: string;
  startMetadata: DateMetadata;
  endMetadata: DateMetadata;
  nowMetadata: DateMetadata;
  progressPercent: number | null;
  nowBetween: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  startDate,
  endDate,
  startMetadata,
  endMetadata,
  nowMetadata,
  progressPercent,
  nowBetween,
}) => {
  // If dates are invalid or identical, no timeline needed
  if (!startMetadata.dateString || !endMetadata.dateString) {
    return null;
  }

  const trackRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);

  const safePercent = progressPercent !== null ? Math.min(100, Math.max(0, progressPercent)) : 0;

  // Calculate timestamps for interpolation
  const { startTs, endTs } = useMemo(() => {
    try {
      const s = DateTime.fromISO(startDate).toMillis() || 0;
      const e = DateTime.fromISO(endDate).toMillis() || 0;
      return { startTs: Math.min(s, e), endTs: Math.max(s, e) };
    } catch {
      return { startTs: 0, endTs: 0 };
    }
  }, [startDate, endDate]);

  const updateHoverFromEvent = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const rawRatio = (clientX - rect.left) / rect.width;
      const clampedRatio = Math.max(0, Math.min(1, rawRatio));
      setHoverPercent(Math.round(clampedRatio * 100));
    },
    []
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    updateHoverFromEvent(e.clientX);
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
    setHoverPercent(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsInteracting(true);
      updateHoverFromEvent(e.touches[0].clientX);
    }
  };

  // Interpolated date/time string for hovered position
  const hoverDetails = useMemo(() => {
    if (hoverPercent === null || !startTs || !endTs) return null;
    const interpolatedMillis = startTs + (endTs - startTs) * (hoverPercent / 100);
    const dt = DateTime.fromMillis(interpolatedMillis);
    if (!dt.isValid) return null;
    return {
      date: dt.toFormat('yyyy-MM-dd'),
      time: dt.toFormat('HH:mm:ss'),
    };
  }, [hoverPercent, startTs, endTs]);

  // Display percent for the glowing progress bar (hovered value during interaction, or real progress if between, or full span)
  const activeDisplayPercent = hoverPercent !== null ? hoverPercent : nowBetween ? safePercent : 100;

  return (
    <div
      id="timeline-section"
      className="glass-card p-4 sm:p-6 rounded-2xl hover:shadow-xl dark:hover:shadow-black/50 transition-all duration-300 ease-out hover:scale-[1.008]"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Tidslinje & Framsteg
          </span>
          {isInteracting && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 animate-in fade-in zoom-in-95 duration-150">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              <span>Inspekterar</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {nowBetween && progressPercent !== null && (
            <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 tabular-nums">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{safePercent}%</span> av perioden har passerat
            </span>
          )}
        </div>
      </div>

      {/* Interactive visual timeline track */}
      <div
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerLeave}
        className="relative py-4 sm:py-5 cursor-crosshair select-none group"
      >
        {/* Subtle background track */}
        <div className="relative h-2 w-full bg-neutral-100 dark:bg-neutral-800/90 rounded-full overflow-visible transition-colors">
          {/* Animated Glow-Pulse Base Range Fill */}
          <div
            className={`h-full rounded-full transition-all duration-200 relative ${
              isInteracting
                ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 timeline-glow-pulse timeline-shimmer-sweep'
                : nowBetween
                ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 dark:from-neutral-200 dark:to-white timeline-glow-pulse'
                : 'bg-neutral-900 dark:bg-neutral-200'
            }`}
            style={{ width: `${activeDisplayPercent}%` }}
          >
            {/* Ambient soft glow halo layer directly underneath */}
            <div
              className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 pointer-events-none ${
                isInteracting
                  ? 'opacity-100 bg-sky-400/80 dark:bg-sky-400/90'
                  : 'opacity-40 bg-indigo-500/40 dark:bg-sky-400/30'
              }`}
            />
          </div>

          {/* Real-time Now marker on track (when between) */}
          {nowBetween && !isInteracting && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40 ring-2 ring-white dark:ring-[#11141b] pointer-events-none transition-all duration-300"
              style={{ left: `${safePercent}%` }}
            >
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </div>
          )}

          {/* Interactive Inspection Hover Scrubber & Tooltip */}
          {isInteracting && hoverPercent !== null && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-75"
              style={{ left: `${hoverPercent}%` }}
            >
              {/* Scrubber Pin / Orb with Glow */}
              <div className="relative flex items-center justify-center">
                <span className="absolute -inset-2 rounded-full bg-sky-400/40 blur-sm animate-pulse" />
                <div className="w-4 h-4 rounded-full bg-white dark:bg-sky-300 border-2 border-sky-600 dark:border-white shadow-lg shadow-sky-500/50" />
              </div>

              {/* Floating Glass Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-neutral-900/95 dark:bg-white/95 text-white dark:text-neutral-950 text-[11px] font-mono shadow-xl backdrop-blur-md border border-white/20 dark:border-black/10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex flex-col items-center">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="text-sky-400 dark:text-sky-600 font-bold">{hoverPercent}%</span>
                  {hoverDetails && (
                    <span className="opacity-90">{hoverDetails.date}</span>
                  )}
                </div>
                {hoverDetails && (
                  <span className="text-[9px] opacity-75 font-normal tracking-wide">{hoverDetails.time}</span>
                )}
                {/* Tooltip caret */}
                <div className="w-2 h-2 bg-neutral-900/95 dark:bg-white/95 rotate-45 -mb-1 mt-0.5 border-r border-b border-white/20 dark:border-black/10" />
              </div>
            </div>
          )}
        </div>

        {/* Nodes along the timeline */}
        <div className="relative flex justify-between items-center -mt-2">
          {/* Start node */}
          <div className="flex flex-col items-start z-10 max-w-[32%] group-hover:opacity-95 transition-opacity">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#11141b] shadow-2xs ring-2 ring-white dark:ring-[#11141b] transition-transform duration-200 group-hover:scale-110" />
            <div className="mt-2 text-left">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block">
                Start
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-900 dark:text-neutral-100 block truncate">
                {startMetadata.dateString}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block tabular-nums">
                {startMetadata.timeString}
              </span>
            </div>
          </div>

          {/* Real-time Now node label (when between) */}
          {nowBetween && (
            <div
              className="absolute top-0 flex flex-col items-center -translate-x-1/2 transition-all duration-300 z-20 pointer-events-none"
              style={{ left: `${Math.min(84, Math.max(16, safePercent))}%` }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-4 h-4 rounded-full bg-emerald-500/25 animate-ping" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 dark:bg-emerald-400 ring-2 ring-white dark:ring-[#11141b] shadow-sm shadow-emerald-500/30" />
              </div>
              <div className="mt-2 text-center">
                <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 block">
                  Nu
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-neutral-900 dark:text-neutral-100 hidden sm:block">
                  {nowMetadata.dateString}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block tabular-nums">
                  {nowMetadata.timeString}
                </span>
              </div>
            </div>
          )}

          {/* End node */}
          <div className="flex flex-col items-end z-10 max-w-[32%] group-hover:opacity-95 transition-opacity">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#11141b] shadow-2xs ring-2 ring-white dark:ring-[#11141b] transition-transform duration-200 group-hover:scale-110" />
            <div className="mt-2 text-right">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block">
                Slut
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-900 dark:text-neutral-100 block truncate">
                {endMetadata.dateString}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block tabular-nums">
                {endMetadata.timeString}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
