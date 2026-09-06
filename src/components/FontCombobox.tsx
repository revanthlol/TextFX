'use client';

import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { 
  Search, 
  Check, 
  ChevronDown, 
  X, 
  Star
} from 'lucide-react';
import { 
  ALL_FONTS, 
  FontItem, 
  FontCategory, 
  loadFontPreview, 
  getStoredFavorites, 
  toggleFavoriteFont, 
  getStoredRecent, 
  addRecentFont 
} from '@/lib/fonts';

interface FontComboboxProps {
  value: string;
  onChange: (fontFamily: string) => void;
  isDarkMode?: boolean;
  className?: string;
  placeholder?: string;
}

const CATEGORIES: { id: FontCategory | 'favorites' | 'recent'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'popular', label: 'Popular' },
  { id: 'monospace', label: 'Mono' },
  { id: 'sans-serif', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Script' },
  { id: 'favorites', label: 'Starred' }
];

const INITIAL_VISIBLE_COUNT = 40;
const BATCH_SIZE = 30;

export function FontCombobox({
  value,
  onChange,
  isDarkMode = true,
  className = '',
  placeholder = 'Select font...'
}: FontComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | 'favorites' | 'recent'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const deferredSearch = useDeferredValue(search);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Initialize favorites and recents
  useEffect(() => {
    setFavorites(getStoredFavorites());
    setRecents(getStoredRecent());
  }, []);

  // Preload font preview for currently selected font
  useEffect(() => {
    if (value) {
      loadFontPreview(value);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
    } else {
      setSearch('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Filter fonts with memoization
  const filteredFonts = useMemo(() => {
    let list: FontItem[] = ALL_FONTS;

    if (selectedCategory === 'favorites') {
      const favSet = new Set(favorites);
      list = ALL_FONTS.filter((f) => favSet.has(f.family));
    } else if (selectedCategory === 'recent') {
      const recSet = new Set(recents);
      list = ALL_FONTS.filter((f) => recSet.has(f.family));
    } else if (selectedCategory === 'popular') {
      list = ALL_FONTS.filter((f) => f.isPopular);
    } else if (selectedCategory !== 'all') {
      list = ALL_FONTS.filter((f) => f.category === selectedCategory);
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      list = list.filter((f) => f.family.toLowerCase().includes(q));
    }

    return list;
  }, [selectedCategory, deferredSearch, favorites, recents]);

  // Lazy render slice
  const visibleFonts = useMemo(() => {
    return filteredFonts.slice(0, visibleCount);
  }, [filteredFonts, visibleCount]);

  // Load preview fonts for visible slice
  useEffect(() => {
    if (!isOpen) return;
    const slice = visibleFonts.slice(0, 30);
    slice.forEach((f) => loadFontPreview(f.family));
  }, [isOpen, visibleFonts]);

  // Reset pagination on search
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setActiveIndex(0);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [deferredSearch, selectedCategory]);

  // Infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 120) {
      if (visibleCount < filteredFonts.length) {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredFonts.length));
      }
    }
  };

  const handleSelect = (fontFamily: string) => {
    onChange(fontFamily);
    const updated = addRecentFont(fontFamily);
    setRecents(updated);
    setIsOpen(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, fontFamily: string) => {
    e.stopPropagation();
    const updated = toggleFavoriteFont(fontFamily);
    setFavorites(updated);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, visibleFonts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleFonts[activeIndex]) {
        handleSelect(visibleFonts[activeIndex].family);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs transition-all ${
          isDarkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100 hover:border-zinc-700'
            : 'bg-white border-zinc-300 text-zinc-900 hover:border-zinc-400 shadow-sm'
        } ${isOpen ? (isDarkMode ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-emerald-500 ring-1 ring-emerald-500/20') : ''}`}
      >
        <span 
          className="truncate font-medium text-xs"
          style={{ fontFamily: value ? `'${value}', sans-serif` : 'inherit' }}
        >
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Minimalist Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${
            isDarkMode 
              ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100' 
              : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
          }`}
          style={{ width: '100%', minWidth: '280px', maxWidth: '380px' }}
        >
          {/* Search Header */}
          <div className={`p-2 border-b ${isDarkMode ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className={`flex items-center px-2 py-1 rounded-md border text-xs transition-colors ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 focus-within:border-emerald-500/50' 
                : 'bg-white border-zinc-300 focus-within:border-emerald-500'
            }`}>
              <Search className="w-3.5 h-3.5 mr-2 shrink-0 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search fonts..."
                className="w-full bg-transparent outline-none text-xs placeholder:text-zinc-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-0.5 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Minimal Category Pills */}
            <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isCatActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors border shrink-0 ${
                      isCatActive
                        ? isDarkMode
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold'
                          : 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                        : isDarkMode
                        ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fonts List */}
          <div 
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-64 overflow-y-auto p-1 space-y-0.5"
            role="listbox"
          >
            {filteredFonts.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-zinc-500">
                No matching fonts found
              </div>
            ) : (
              visibleFonts.map((font, idx) => {
                const isSelected = font.family.toLowerCase() === value.toLowerCase();
                const isFocused = idx === activeIndex;
                const isFav = favorites.includes(font.family);

                return (
                  <div
                    key={font.family}
                    onClick={() => handleSelect(font.family)}
                    onMouseEnter={() => {
                      setActiveIndex(idx);
                      loadFontPreview(font.family);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`group px-2 py-1.5 rounded-md cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                          : 'bg-emerald-50 text-emerald-800 font-medium'
                        : isFocused
                        ? isDarkMode
                          ? 'bg-zinc-900 text-zinc-100'
                          : 'bg-zinc-100 text-zinc-900'
                        : isDarkMode
                        ? 'text-zinc-300 hover:bg-zinc-900/70 hover:text-zinc-100'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span 
                        className="text-xs truncate"
                        style={{ fontFamily: `'${font.family}', sans-serif` }}
                      >
                        {font.family}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 lowercase opacity-60 shrink-0">
                        {font.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, font.family)}
                        className={`p-0.5 rounded transition-opacity ${
                          isFav 
                            ? 'text-amber-400 opacity-100' 
                            : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                        }`}
                        title={isFav ? 'Unstar' : 'Star'}
                      >
                        <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Minimalist Footer */}
          <div className={`px-2.5 py-1 text-[10px] font-mono flex items-center justify-between border-t ${
            isDarkMode ? 'border-zinc-800/80 bg-zinc-900/30 text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
          }`}>
            <span>{visibleFonts.length} / {filteredFonts.length} fonts</span>
            <span>↑↓ navigate</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FontCombobox;
