import React, { useState, useCallback, useEffect } from 'react';
import ModernSearchInput from './ModernSearchInput';
import ModernTranslationResult from './ModernTranslationResult';
import VirtualKeyboard from './VirtualKeyboard';
import { UI_CONSTANTS } from '../constants/app';
import type { Direction, Translation } from '../types/dictionary';

interface SearchContainerProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: (query: string) => void;
  direction: Direction;
  suggestions: string[];
  isLoading: boolean;
  currentResult: Translation | null;
  showVirtualKeyboard: boolean;
  keyboardLanguage: 'ru' | 'fa';
  onVirtualKeyboard: () => void;
  onKeyboardClose: () => void;
  onKeyPress: (key: string) => void;
  onKeyboardLanguageChange: (lang: 'ru' | 'fa') => void;
  onFavorite: (word: string) => void;
  isFavorite: boolean;
  onDirectionChange?: (direction: Direction) => void;
}

export function SearchContainer({ 
  searchQuery, 
  onSearchQueryChange,
  onSearch,
  direction,
  suggestions,
  isLoading,
  currentResult,
  showVirtualKeyboard,
  keyboardLanguage,
  onVirtualKeyboard,
  onKeyboardClose,
  onKeyPress,
  onKeyboardLanguageChange,
  onFavorite,
  isFavorite,
  onDirectionChange
}: SearchContainerProps) {
  
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    console.log('🔍 SearchContainer: Starting search for:', query);
    onSearch(query);
  }, [onSearch]);

  const handleInputChange = useCallback((value: string) => {
    onSearchQueryChange(value);
  }, [onSearchQueryChange]);

  const handleVirtualKeyboard = useCallback(() => {
    onVirtualKeyboard();
    // Scroll to show header, search input and keyboard
    setTimeout(() => {
      const searchSection = document.querySelector('.search-section');
      if (searchSection) {
        const headerHeight = UI_CONSTANTS.HEADER_HEIGHT;
        const offset = searchSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: Math.max(0, offset),
          behavior: 'smooth'
        });
      }
    }, UI_CONSTANTS.SCROLL_DELAY);
  }, [onVirtualKeyboard]);

  const handleKeyboardClose = useCallback(() => {
    onKeyboardClose();
    // Optional: scroll back to top when closing keyboard
    if (window.pageYOffset > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [onKeyboardClose]);

  const handleKeyPress = useCallback((key: string) => {
    onKeyPress(key);
  }, [onKeyPress]);

  const handleKeyboardLanguageChange = useCallback((language: 'ru' | 'fa') => {
    onKeyboardLanguageChange(language);
    // Also update the main direction if callback provided
    if (onDirectionChange) {
      const newDirection = language === 'ru' ? 'ru-fa' : 'fa-ru';
      onDirectionChange(newDirection);
    }
  }, [onKeyboardLanguageChange, onDirectionChange]);

  const handleFavorite = useCallback((word: string) => {
    onFavorite(word);
  }, [onFavorite]);

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
          onVirtualKeyboard={onVirtualKeyboard}
          onVirtualKeyboard={onVirtualKeyboard}
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
    </div>
  );
}