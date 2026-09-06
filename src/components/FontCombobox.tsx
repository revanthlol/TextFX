'use client';

import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { 
  Search, 
  Check, 
  Star, 
  Clock, 
  ChevronDown, 
  X, 
  Type, 
  Sparkles, 
  Code2, 
  PenTool, 
  Compass
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

const CATEGORIES: { id: FontCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'popular', label: 'Popular', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'monospace', label: 'Monospace', icon: <Code2 className="w-3.5 h-3.5 text-emerald-500" /> },
  { id: 'handwriting', label: 'Handwriting', icon: <PenTool className="w-3.5 h-3.5 text-pink-500" /> },
  { id: 'sans-serif', label: 'Sans Serif', icon: <Type className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'serif', label: 'Serif', icon: <Type className="w-3.5 h-3.5 text-purple-500" /> },
  { id: 'display', label: 'Display', icon: <Sparkles className="w-3.5 h-3.5 text-orange-500" /> }
];

const INITIAL_VISIBLE_COUNT = 40;
const BATCH_SIZE = 30;

export function FontCombobox({
  value,
  onChange,
  isDarkMode = false,
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

  // Load preview fonts for visible slice only
  useEffect(() => {
    if (!isOpen) return;
    const slice = visibleFonts.slice(0, 25);
    slice.forEach((f) => loadFontPreview(f.family));
  }, [isOpen, visibleFonts]);

  // Reset pagination & active index on filter changes
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setActiveIndex(0);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [deferredSearch, selectedCategory]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 150) {
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
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < visibleFonts.length - 1 ? prev + 1 : prev));
      scrollActiveIntoView(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollActiveIntoView(activeIndex - 1);
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

  const scrollActiveIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-font-item]');
    const target = items[index] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 outline-none ${
          isDarkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
            : 'bg-white border-zinc-300 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-sm'
        } ${isOpen ? (isDarkMode ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-blue-500 ring-1 ring-blue-500/30') : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          <Type className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-blue-500'}`} />
          <span 
            className="truncate text-xs font-medium"
            style={{ fontFamily: value ? `'${value}', sans-serif` : 'inherit' }}
          >
            {value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {favorites.includes(value) && (
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div 
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl shadow-2xl border overflow-hidden transition-all duration-100 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700 text-gray-100 shadow-black/80' 
              : 'bg-white border-gray-200 text-gray-900 shadow-xl'
          }`}
          style={{ width: '100%', minWidth: '320px', maxWidth: '440px' }}
        >
          {/* Search Header */}
          <div className={`p-2.5 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
            <div className={`relative flex items-center rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 focus-within:border-yellow-500' 
                : 'bg-white border-gray-300 focus-within:border-blue-500'
            }`}>
              <Search className="w-4 h-4 ml-3 shrink-0 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search 1,500+ fonts (Fira, Inter, Roboto)..."
                className={`w-full px-2.5 py-1.5 text-sm bg-transparent outline-none placeholder:text-gray-400 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Chips Bar */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {/* Starred Filter Chip */}
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'favorites' ? 'all' : 'favorites')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === 'favorites'
                    ? (isDarkMode ? 'bg-amber-500 text-black font-semibold' : 'bg-amber-500 text-white font-semibold')
                    : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                <Star className={`w-3 h-3 ${selectedCategory === 'favorites' ? 'fill-current' : 'text-amber-400'}`} />
                <span>Starred ({favorites.length})</span>
              </button>

              {/* Recents Filter Chip */}
              {recents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === 'recent' ? 'all' : 'recent')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    selectedCategory === 'recent'
                      ? (isDarkMode ? 'bg-blue-500 text-white font-semibold' : 'bg-blue-600 text-white font-semibold')
                      : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Recent</span>
                </button>
              )}

              {/* Standard Categories */}
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? (isDarkMode ? 'bg-yellow-500 text-black font-semibold' : 'bg-gray-900 text-white font-semibold')
                      : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fonts List (Paginated / Windowed for zero lag) */}
          <div 
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60"
            role="listbox"
          >
            {filteredFonts.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Type className={`w-6 h-6 mx-auto mb-1.5 opacity-30 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className="text-xs font-medium text-gray-400">No matching fonts found</p>
              </div>
            ) : (
              visibleFonts.map((font, idx) => {
                const isSelected = font.family.toLowerCase() === value.toLowerCase();
                const isFavorite = favorites.includes(font.family);
                const isFocused = idx === activeIndex;

                return (
                  <div
                    key={font.family}
                    data-font-item
                    onClick={() => handleSelect(font.family)}
                    onMouseEnter={() => {
                      setActiveIndex(idx);
                      loadFontPreview(font.family);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`group px-2.5 py-1.5 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? (isDarkMode ? 'bg-emerald-500/15 text-emerald-300 font-semibold' : 'bg-blue-50 text-blue-900 font-semibold')
                        : isFocused
                          ? (isDarkMode ? 'bg-zinc-800/80 text-zinc-100' : 'bg-zinc-100 text-zinc-900')
                          : (isDarkMode ? 'text-zinc-200 hover:bg-zinc-800/50' : 'text-zinc-800 hover:bg-zinc-50')
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {/* Font name styled in its own typography */}
                      <span 
                        className="text-sm truncate font-medium"
                        style={{ fontFamily: `'${font.family}', sans-serif` }}
                      >
                        {font.family}
                      </span>
                      
                      <span className={`text-[9px] px-1.5 py-0.2 rounded capitalize shrink-0 font-normal ${
                        font.category === 'monospace'
                          ? (isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                          : font.category === 'handwriting'
                            ? (isDarkMode ? 'bg-pink-950/60 text-pink-300 border border-pink-800/40' : 'bg-pink-50 text-pink-700 border border-pink-200')
                            : (isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500')
                      }`}>
                        {font.category}
                      </span>
                      
                      {font.isPopular && (
                        <span className="text-[10px] text-amber-500 font-medium shrink-0">
                          ★
                        </span>
                      )}
                    </div>

                    {/* Action buttons (Favorite & Selected Checkmark) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, font.family)}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        className={`p-1.5 rounded-md transition-colors ${
                          isFavorite 
                            ? 'text-amber-400 hover:text-amber-300' 
                            : 'text-gray-400 hover:text-amber-400 opacity-40 group-hover:opacity-100'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      {isSelected && (
                        <div className={`p-1 rounded-full ${isDarkMode ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className={`py-1.5 px-3 text-[11px] flex items-center justify-between border-t ${
            isDarkMode ? 'border-gray-800 bg-gray-950 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'
          }`}>
            <span>Showing {visibleFonts.length} of {filteredFonts.length} fonts</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-mono">↑↓</kbd>
              <kbd className="ml-0.5 px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-mono">↵</kbd>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FontCombobox;
