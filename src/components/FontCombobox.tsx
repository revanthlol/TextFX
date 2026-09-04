'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  sampleText?: string;
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

export default function FontCombobox({
  value,
  onChange,
  sampleText = 'TextFX',
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

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Initialize favorites and recents from localStorage
  useEffect(() => {
    setFavorites(getStoredFavorites());
    setRecents(getStoredRecent());
  }, []);

  // Preload preview for current selected font
  useEffect(() => {
    if (value) {
      loadFontPreview(value, sampleText);
    }
  }, [value, sampleText]);

  // Handle clicking outside to close
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
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Filter fonts based on category and search query
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

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((f) => f.family.toLowerCase().includes(q));
    }

    return list;
  }, [selectedCategory, search, favorites, recents]);

  // Load preview fonts for first visible slice
  useEffect(() => {
    if (!isOpen) return;
    const slice = filteredFonts.slice(0, 25);
    slice.forEach((f) => loadFontPreview(f.family, sampleText));
  }, [isOpen, filteredFonts, sampleText]);

  // Reset active index on filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [search, selectedCategory]);

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
      setActiveIndex((prev) => (prev < filteredFonts.length - 1 ? prev + 1 : prev));
      scrollActiveIntoView(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollActiveIntoView(activeIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFonts[activeIndex]) {
        handleSelect(filteredFonts[activeIndex].family);
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

  const cleanSample = (sampleText && sampleText.trim().length > 0) 
    ? (sampleText.length > 24 ? `${sampleText.slice(0, 24)}...` : sampleText) 
    : 'TextFX';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 outline-none ${
          isDarkMode
            ? 'bg-gray-800/90 border-gray-700 text-gray-100 hover:border-gray-500 hover:bg-gray-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30'
            : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
        } ${isOpen ? (isDarkMode ? 'border-yellow-500 ring-1 ring-yellow-500/30' : 'border-blue-500 ring-1 ring-blue-500/30') : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Type className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`} />
          <span 
            className="truncate text-sm"
            style={{ fontFamily: value ? `'${value}', sans-serif` : 'inherit' }}
          >
            {value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {favorites.includes(value) && (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div 
          className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-xl shadow-2xl border backdrop-blur-md overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode 
              ? 'bg-gray-900/98 border-gray-700 text-gray-100 shadow-black/80' 
              : 'bg-white/98 border-gray-200 text-gray-900 shadow-xl'
          }`}
          style={{ width: '100%', minWidth: '320px', maxWidth: '480px' }}
        >
          {/* Search Header */}
          <div className={`p-3 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-gray-50/80'}`}>
            <div className={`relative flex items-center rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 focus-within:border-yellow-500' 
                : 'bg-white border-gray-300 focus-within:border-blue-500'
            }`}>
              <Search className={`w-4 h-4 ml-3 shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search Google Fonts (e.g. Fira, Inter, Roboto)..."
                className={`w-full px-2.5 py-2 text-sm bg-transparent outline-none placeholder:text-gray-400 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1.5 mr-1 hover:opacity-75 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Chips Bar */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-xs">
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

          {/* Fonts List */}
          <div 
            ref={listRef}
            className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60"
            role="listbox"
          >
            {filteredFonts.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Type className={`w-8 h-8 mx-auto mb-2 opacity-30 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className="text-sm font-medium text-gray-400">No matching fonts found</p>
                <p className="text-xs text-gray-500 mt-1">Try another search term or switch categories</p>
              </div>
            ) : (
              filteredFonts.map((font, idx) => {
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
                      loadFontPreview(font.family, sampleText);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`group px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? (isDarkMode ? 'bg-yellow-500/15 text-yellow-300' : 'bg-blue-50 text-blue-900')
                        : isFocused
                          ? (isDarkMode ? 'bg-gray-800/80 text-gray-100' : 'bg-gray-100 text-gray-900')
                          : (isDarkMode ? 'text-gray-200 hover:bg-gray-800/50' : 'text-gray-800 hover:bg-gray-50')
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs tracking-tight truncate">
                          {font.family}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize shrink-0 font-normal ${
                          font.category === 'monospace'
                            ? (isDarkMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                            : font.category === 'handwriting'
                              ? (isDarkMode ? 'bg-pink-950 text-pink-300 border border-pink-800/40' : 'bg-pink-50 text-pink-700 border border-pink-200')
                              : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')
                        }`}>
                          {font.category}
                        </span>
                        {font.isPopular && (
                          <span className="text-[10px] text-amber-500 font-medium shrink-0">
                            ★ Popular
                          </span>
                        )}
                      </div>

                      {/* Live Typeface Preview */}
                      <div 
                        className={`text-sm sm:text-base mt-1 truncate ${
                          isSelected ? (isDarkMode ? 'text-yellow-200' : 'text-blue-700') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                        }`}
                        style={{ fontFamily: `'${font.family}', sans-serif` }}
                      >
                        {cleanSample}
                      </div>
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
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
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
          <div className={`py-2 px-3 text-[11px] flex items-center justify-between border-t ${
            isDarkMode ? 'border-gray-800 bg-gray-950 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'
          }`}>
            <span>{filteredFonts.length} fonts available</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-mono">↑↓</kbd> navigate
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-mono">↵</kbd> select
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
