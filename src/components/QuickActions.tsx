import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface QuickPreset {
  label: string;
  type:
    | 'now'
    | 'today'
    | 'yesterday'
    | 'tomorrow'
    | 'plus_7d'
    | 'plus_30d'
    | 'plus_3m'
    | 'plus_6m'
    | 'plus_1y'
    | 'start_of_year'
    | 'end_of_year';
}

interface QuickActionsProps {
  onSelectPreset: (preset: QuickPreset['type']) => void;
  endIsNow: boolean;
}

const PRESETS: QuickPreset[] = [
  { label: 'Nu', type: 'now' },
  { label: 'Idag', type: 'today' },
  { label: 'Igår', type: 'yesterday' },
  { label: 'Imorgon', type: 'tomorrow' },
  { label: '+7 dagar', type: 'plus_7d' },
  { label: '+30 dagar', type: 'plus_30d' },
  { label: '+3 månader', type: 'plus_3m' },
  { label: '+6 månader', type: 'plus_6m' },
  { label: '+1 år', type: 'plus_1y' },
  { label: 'Början av året', type: 'start_of_year' },
  { label: 'Slutet av året', type: 'end_of_year' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectPreset,
  endIsNow,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative w-full flex items-center gap-1.5 group">
      {/* Optional Left Scroll Arrow for desktop */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          className="hidden md:flex btn-liquid-glass w-7 h-7 rounded-full p-1 shrink-0 shadow-xs z-10"
          aria-label="Rulla vänster snabbval"
          title="Föregående snabbval"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="w-full flex items-center gap-1.5 overflow-x-auto touch-pan-x scroll-smooth py-1 px-0.5 no-scrollbar text-xs"
      >
        <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pr-1 shrink-0 select-none">
          Snabbval:
        </span>

        {PRESETS.map((preset) => {
          const isSelectedNow = preset.type === 'now' && endIsNow;
          return (
            <button
              key={preset.type}
              id={`btn-preset-${preset.type}`}
              type="button"
              onClick={() => onSelectPreset(preset.type)}
              className={`shrink-0 min-h-[34px] sm:min-h-[32px] px-3.5 py-1.5 sm:py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                isSelectedNow
                  ? 'btn-liquid-pill-active'
                  : 'btn-liquid-pill'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Optional Right Scroll Arrow for desktop */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          className="hidden md:flex btn-liquid-glass w-7 h-7 rounded-full p-1 shrink-0 shadow-xs z-10"
          aria-label="Rulla höger snabbval"
          title="Fler snabbval"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
