import { useState, useRef, useEffect, FormEvent } from "react";
import { Search, Globe, Clock, X, ChevronDown } from "lucide-react";
import { REGIONS } from "../config";
import type { TabType } from "../types";

interface SearchBarProps {
  placeholder: string;
  regionCode: string;
  tab: TabType;
  onRegionChange: (code: string) => void;
  onSearch: (query: string) => void;
}

const HISTORY_KEY_PREFIX = "zpxxy_searchHistory_";
const MAX_HISTORY = 10;

export default function SearchBar({ placeholder, regionCode, tab, onRegionChange, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const historyKey = HISTORY_KEY_PREFIX + tab;

  // Load history when tab changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) setSearchHistory(JSON.parse(saved));
    } catch {}
  }, [historyKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const saveToHistory = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...searchHistory.filter(s => s !== q)].slice(0, MAX_HISTORY);
    setSearchHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query);
      onSearch(query);
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const handleHistoryClick = (item: string) => {
    setQuery(item);
    saveToHistory(item);
    onSearch(item);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(historyKey);
    setShowHistory(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 relative">
      <div className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 bg-white border border-amber-200 rounded-xl text-slate-700 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm"
        />
        {/* History toggle */}
        {searchHistory.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <ChevronDown className={"w-4 h-4 transition-transform " + (showHistory ? "rotate-180" : "")} />
          </button>
        )}

        {/* History dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-100 rounded-xl shadow-lg shadow-amber-200/20 z-50 overflow-hidden animate-slide-down"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-amber-50">
              <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                搜索历史
              </span>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                清除
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchHistory.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-primary-600 transition-colors flex items-center gap-2 border-b border-amber-50/50 last:border-0"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="relative min-w-[150px]">
        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 pointer-events-none" />
        <select
          value={regionCode}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full pl-11 pr-8 py-3 bg-white border border-amber-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm"
        >
          {REGIONS.map((r) => (
            <option key={r.regionCode} value={r.regionCode}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-primary-200/50 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        搜索
      </button>
    </form>
  );
}
