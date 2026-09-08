import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import { POPULAR_TIMEZONES, formatUtcOffset, resolveZone } from '../utils/timezones';

interface TimezoneSelectorProps {
  currentZone: string;
  onChangeZone: (zone: string) => void;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  currentZone,
  onChangeZone,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeZoneResolved = resolveZone(currentZone);
  const currentOffset = formatUtcOffset(currentZone);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeOption =
    POPULAR_TIMEZONES.find((tz) => tz.zone === currentZone) ||
    POPULAR_TIMEZONES.find((tz) => tz.zone === activeZoneResolved) || {
      zone: currentZone,
      city: currentZone.split('/').pop()?.replace('_', ' ') || currentZone,
      country: '',
      region: '',
    };

  const filtered = POPULAR_TIMEZONES.filter((tz) => {
    const q = searchQuery.toLowerCase();
    return (
      tz.city.toLowerCase().includes(q) ||
      tz.country.toLowerCase().includes(q) ||
      tz.zone.toLowerCase().includes(q) ||
      tz.region.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        id="btn-timezone-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-liquid-glass gap-2 min-h-[36px] px-3.5 py-1.5 text-xs font-medium rounded-xl shadow-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {activeOption.city}
        </span>
        <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
          ({currentOffset})
        </span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 dark:text-neutral-500 ml-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-[calc(100vw-2rem)] max-w-xs sm:w-72 max-h-80 bg-white dark:bg-[#13161B] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök stad eller tidszon..."
                className="w-full min-h-[38px] sm:min-h-[32px] pl-8 pr-3 py-1.5 text-base sm:text-xs bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 [color-scheme:light] dark:[color-scheme:dark]"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1.5 no-scrollbar" role="listbox">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-neutral-400">
                Inga tidszoner matchar sökningen
              </div>
            ) : (
              filtered.map((tz) => {
                const isSelected = currentZone === tz.zone;
                const offset = formatUtcOffset(tz.zone);
                return (
                  <button
                    key={tz.zone}
                    type="button"
                    onClick={() => {
                      onChangeZone(tz.zone);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between min-h-[36px] px-3 py-2 text-xs rounded-xl text-left transition-colors active:scale-98 ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                          {tz.city}
                        </span>
                        {tz.country && (
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            · {tz.country}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        {tz.zone === 'system' ? 'Standard webbläsare' : tz.zone}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {offset}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
