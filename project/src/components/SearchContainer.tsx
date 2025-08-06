import React, { useState, useCallback, useEffect } from 'react';
import ModernSearchInput from './ModernSearchInput';
import ModernTranslationResult from './ModernTranslationResult';
import VirtualKeyboard from './VirtualKeyboard';
import { useSearch } from '../hooks/useSearch';
import { useFavorites } from '../hooks/useFavorites';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { SEARCH_CONSTANTS } from '../constants/app';
import type { Direction } from '../types/dictionary';

interface SearchContainerProps {
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
}

export function SearchContainer({ direction, onDirectionChange }: SearchContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [keyboardLanguage, setKeyboardLanguage] = useState<'ru' | 'fa'>('ru');

  const { isLoading, currentResult, suggestions, error, searchWord, getSuggestions, clearError } = useSearch();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToHistory } = useSearchHistory();

  // Get suggestions as user types
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getSuggestions(searchQuery, direction);
    }, SEARCH_CONSTANTS.DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, direction, getSuggestions]);

  // Update keyboard language based on direction
  useEffect(() => {
    setKeyboardLanguage(direction === 'ru-fa' ? 'ru' : 'fa');
  }, [direction]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    console.log('🔍 SearchContainer: Starting search for:', query);
    
    const result = await searchWord(query, direction);
    
    // Add to history if search was successful
    if (result) {
      const hasValidTranslation = result.meanings.some(meaning => 
        meaning.definitions.some(def => 
          !def.includes('не найден') && !def.includes('یافت نشد')
        )
      );
      
      if (hasValidTranslation) {
        addToHistory(query, direction, true);
      }
    }
  }, [searchWord, direction, addToHistory]);

  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleVirtualKeyboard = useCallback(() => {
    setShowVirtualKeyboard(true);
    // Scroll to show header, search input and keyboard
    setTimeout(() => {
      const searchSection = document.querySelector('.search-section');
      if (searchSection) {
        const headerHeight = 80; // Approximate header height
        const offset = searchSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: Math.max(0, offset),
          behavior: 'smooth'
        });
      }
    }, 100);
  }, []);

  const handleKeyboardClose = useCallback(() => {
    setShowVirtualKeyboard(false);
    // Optional: scroll back to top when closing keyboard
    if (window.pageYOffset > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'Enter') {
      handleSearch(searchQuery);
    } else if (key === 'Backspace') {
      setSearchQuery(prev => prev.slice(0, -1));
    } else if (key === ' ') {
      setSearchQuery(prev => prev + ' ');
    } else {
      setSearchQuery(prev => prev + key);
    }
  }, [searchQuery, handleSearch]);

  const handleKeyboardLanguageChange = useCallback((language: 'ru' | 'fa') => {
    setKeyboardLanguage(language);
    // Also update the main direction
    const newDirection = language === 'ru' ? 'ru-fa' : 'fa-ru';
    onDirectionChange(newDirection);
  }, [onDirectionChange]);

  const handleFavorite = useCallback((word: string) => {
    toggleFavorite(word);
  }, [toggleFavorite]);

  const isFavorite = currentResult ? favorites.includes(currentResult.word) : false;

  return (
    <div className="space-y-6 sm:space-y-12">
      {/* Search Section */}
      <div className="search-section">
        <ModernSearchInput
          value={searchQuery}
          onChange={handleInputChange}
          onSearch={handleSearch}
          direction={direction}
          suggestions={suggestions}
          isLoading={isLoading}
          onVirtualKeyboard={handleVirtualKeyboard}
          onDirectionChange={onDirectionChange}
        />
        
        {/* Virtual Keyboard positioned under search */}
        <VirtualKeyboard
          isVisible={showVirtualKeyboard}
          onClose={handleKeyboardClose}
          onKeyPress={handleKeyPress}
          language={keyboardLanguage}
          onLanguageChange={handleKeyboardLanguageChange}
        />
      </div>

      {/* Translation Result */}
      <ModernTranslationResult
        result={currentResult}
        isLoading={isLoading}
        direction={direction}
        onFavorite={handleFavorite}
        isFavorite={isFavorite}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">Ошибка поиска:</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}