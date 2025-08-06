import { useState, useEffect, useCallback } from 'react';
import { DictionaryService } from '../services/dictionaryService';
import { SEARCH_CONSTANTS, STORAGE_KEYS } from '../constants/app';
import type { Translation, Direction } from '../types/dictionary';

export function useDictionary() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<Translation | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const searchWord = useCallback(async (query: string, direction: Direction) => {
    if (!query.trim()) return;

    console.log('🎯 useDictionary: Starting search for:', query, 'direction:', direction);
    setIsLoading(true);
    
    try {
      // Use real DictionaryService instead of mock data
      const result = await DictionaryService.searchWord(query.trim(), direction);
      console.log('🎯 useDictionary: Search result:', result);
      
      setCurrentResult(result);
      
      // Add to recent searches if found and has valid translations
      if (result && result.meanings.length > 0) {
        const hasValidTranslations = result.meanings.some(meaning => 
          meaning.definitions.some(def => 
            !def.includes('не найден') && 
            !def.includes('یافت نشد') &&
            !def.includes('Перевод не найден') &&
            !def.includes('ترجمه در پایگاه داده یافت نشد')
          )
        );
        
        if (hasValidTranslations) {
          setRecentSearches(prev => {
            const filtered = prev.filter(item => item !== query);
            return [query, ...filtered].slice(0, SEARCH_CONSTANTS.MAX_RECENT_SEARCHES);
          });
        }
      }
      
    } catch (error) {
      console.error('🎯 useDictionary: Search failed:', error);
      setCurrentResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (query: string, direction: Direction) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    console.log('🎯 useDictionary: Getting suggestions for:', query, 'direction:', direction);
    
    try {
      // Use real DictionaryService for suggestions
      const suggestions = await DictionaryService.getSuggestions(query.trim(), direction);
      console.log('🎯 useDictionary: Got suggestions:', suggestions);
      setSuggestions(suggestions || []);
    } catch (error) {
      console.error('🎯 useDictionary: Suggestions failed:', error);
      setSuggestions([]);
    }
  }, []);

  const addToFavorites = useCallback((word: string) => {
    setFavorites(prev => {
      if (prev.includes(word)) {
        return prev.filter(item => item !== word);
      } else {
        return [...prev, word];
      }
    });
  }, []);

  const removeFromFavorites = useCallback((word: string) => {
    setFavorites(prev => prev.filter(item => item !== word));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const removeFromRecentSearches = useCallback((query: string) => {
    setRecentSearches(prev => prev.filter(item => item !== query));
  }, []);

  return {
    isLoading,
    currentResult,
    recentSearches,
    favorites,
    suggestions,
    searchWord,
    getSuggestions,
    addToFavorites,
    removeFromFavorites,
    clearRecentSearches,
    clearFavorites,
    removeFromRecentSearches
  };
}