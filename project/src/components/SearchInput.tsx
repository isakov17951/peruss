import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Mic } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  direction: 'ru-fa' | 'fa-ru';
  suggestions: string[];
  isLoading: boolean;
}

export default function SearchInput({ 
  value, 
  onChange, 
  onSearch, 
  direction, 
  suggestions, 
  isLoading 
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholder = direction === 'ru-fa' 
    ? 'Search Russian words...' 
    : 'جستجوی کلمات فارسی...';

  const isRtl = direction === 'fa-ru';

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onChange(suggestions[selectedIndex]);
        onSearch(suggestions[selectedIndex]);
      } else {
        onSearch(value);
      }
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
          <Search className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`w-full bg-white rounded-xl border border-gray-200 py-4 ${
            isRtl ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'
          } text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md`}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
        
        {value && (
          <button
            onClick={clearSearch}
            className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200`}
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
              }`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}