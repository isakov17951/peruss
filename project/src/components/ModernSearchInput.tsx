import React, { useState, useRef, useEffect, useId, memo } from 'react';
import { Search, X, Mic, Sparkles, Keyboard, MicOff } from 'lucide-react';
import type { Direction } from '../types/dictionary';

interface ModernSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  direction: Direction;
  suggestions: string[];
  isLoading: boolean;
  isPending?: boolean;
  onVirtualKeyboard?: () => void;
}

const ModernSearchInput = memo(function ModernSearchInput({ 
  value, 
  onChange, 
  onSearch, 
  direction, 
  suggestions, 
  isLoading,
  isPending = false,
  onVirtualKeyboard
}: ModernSearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceLanguageModal, setShowVoiceLanguageModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputId = useId();
  const listboxId = useId();

  const placeholder = 'Введите слово на персидском или русском';

  const isRtl = direction === 'fa-ru';

  // Modern keyboard navigation with proper ARIA
  useEffect(() => {
    setSelectedIndex(-1);
    suggestionRefs.current = suggestionRefs.current.slice(0, suggestions.length);
  }, [suggestions]);

  // Voice input with modern Web Speech API
  const startVoiceInput = async (language: 'ru' | 'fa') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ru' ? 'ru-RU' : 'fa-IR';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsRecording(true);
    setShowVoiceLanguageModal(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      onSearch(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      // Stop recording if currently recording
      setIsRecording(false);
      return;
    }
    setShowVoiceLanguageModal(true);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onChange(suggestions[selectedIndex]);
        onSearch(suggestions[selectedIndex]);
      } else {
        onSearch(value);
      }
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
      setSelectedIndex(nextIndex);
      suggestionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(selectedIndex - 1, -1);
      setSelectedIndex(prevIndex);
      if (prevIndex >= 0) {
        suggestionRefs.current[prevIndex]?.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <Search className={`w-5 h-5 sm:w-7 sm:h-7 text-gray-400 transition-all duration-300 ${
            isLoading || isPending ? 'animate-pulse text-emerald-500' : 'group-focus-within:text-emerald-500'
          }`} />
        </div>
        
        {/* Main Input */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          aria-label="Поиск в словаре"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`w-full bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-3xl border border-gray-200 py-3 sm:py-7 ${
            'pl-10 sm:pl-16 pr-20 sm:pr-36 text-left'
          } text-base sm:text-xl placeholder-gray-400 focus:outline-none focus:ring-1 sm:focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl hover:bg-white group-focus-within:bg-white`}
          dir="ltr"
        />
        
        {/* Action Buttons */}
        <div className="absolute inset-y-0 right-0 pr-1 sm:pr-3 flex items-center space-x-0.5 sm:space-x-2">
          {/* Virtual Keyboard Button */}
          {onVirtualKeyboard && (
            <button
              onClick={onVirtualKeyboard}
              className="hidden md:block p-1.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 text-gray-500 hover:text-emerald-600 transition-all duration-200"
              title="Виртуальная клавиатура"
              aria-label="Открыть виртуальную клавиатуру"
            >
              <Keyboard className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Voice Input Button */}
          <button
            onClick={handleVoiceClick}
            disabled={isRecording}
            className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
              isRecording 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 text-gray-500 hover:text-emerald-600'
            }`}
            title="Голосовой поиск"
            aria-label="Начать голосовой поиск"
          >
            {isRecording ? <MicOff className="w-4 h-4 sm:w-6 sm:h-6" /> : <Mic className="w-4 h-4 sm:w-6 sm:h-6" />}
          </button>

          {/* AI Enhance Button */}
          <button
            className="hidden sm:block p-1.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 text-gray-500 hover:text-emerald-600 transition-all duration-200"
            title="Умный поиск"
            aria-label="Улучшенный поиск с ИИ"
          >
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          
          {/* Clear Button */}
          {value && (
            <button
              onClick={clearSearch}
              className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
              title="Очистить поиск"
              aria-label="Очистить поле поиска"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Modern Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          id={listboxId}
          role="listbox"
          aria-label="Предложения поиска"
          className="absolute top-full left-0 right-0 mt-1 sm:mt-3 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-3xl border border-emerald-200/50 shadow-lg sm:shadow-2xl z-20 max-h-60 sm:max-h-96 overflow-hidden animate-in slide-in-from-top duration-300"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-3 sm:px-6 py-1.5 sm:py-3 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-emerald-700 flex items-center">
                <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Предложения ({suggestions.length})
              </span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
          
          {/* Suggestions list with custom scrollbar */}
          <div className="max-h-48 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              ref={el => suggestionRefs.current[index] = el}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`group relative w-full text-left px-3 sm:px-8 py-3 sm:py-6 transition-all duration-300 transform hover:scale-[1.005] sm:hover:scale-[1.02] ${
                index === selectedIndex 
                  ? 'bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 text-emerald-800 shadow-sm border-l-2 sm:border-l-4 border-emerald-500' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 hover:shadow-md'
              } ${
                index !== suggestions.length - 1 ? 'border-b border-gray-100/50' : ''
              } font-medium text-sm sm:text-xl ${/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(suggestion) ? 'font-persian' : ''}`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/10 to-teal-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-1.5 sm:space-x-3">
                  {/* Icon indicator */}
                  <div className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === selectedIndex 
                      ? 'bg-emerald-500 shadow-lg' 
                      : 'bg-gray-300 group-hover:bg-emerald-400'
                  }`}></div>
                  
                  {/* Suggestion text */}
                  <span className="flex-1">
                  {suggestion}
                  </span>
                </div>
                
                {/* Arrow indicator */}
                <div className={`transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'text-emerald-600 transform rotate-45' 
                    : 'text-gray-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="w-1 h-1 sm:w-2 sm:h-2 border-r-2 border-t-2 border-current"></div>
                </div>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </button>
          ))}
          </div>
          
          {/* Footer with tip */}
          <div className="hidden md:block bg-gradient-to-r from-gray-50 to-emerald-50/30 px-6 py-3 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span className="flex items-center space-x-2">
                <span>↑↓ навигация</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>Enter выбор</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>Esc закрыть</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Voice Language Selection Modal */}
      {showVoiceLanguageModal && (
        <div className="fixed inset-0 bg-black/30 sm:bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-4 py-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-8 w-full max-w-sm sm:max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">Выберите язык</h3>
              
              <button
                onClick={() => startVoiceInput('ru')}
                className="w-full p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 hover:border-emerald-300 rounded-xl sm:rounded-2xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                    RU
                  </div>
                  <div>
                    <div className="font-semibold text-base sm:text-base text-gray-900 group-hover:text-emerald-700">Русский</div>
                    <div className="text-sm sm:text-sm text-gray-600">Произнесите слово на русском языке</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => startVoiceInput('fa')}
                className="w-full p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 hover:border-emerald-300 rounded-xl sm:rounded-2xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                    فا
                  </div>
                  <div>
                    <div className="font-semibold text-base sm:text-base text-gray-900 group-hover:text-emerald-700">فارسی</div>
                    <div className="text-sm sm:text-sm text-gray-600">کلمه را به زبان فارسی بگویید</div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowVoiceLanguageModal(false)}
              className="w-full p-3 sm:p-3 text-base sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 font-medium"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ModernSearchInput;