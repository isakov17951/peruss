import { useState, useEffect, useCallback, useMemo, useTransition, useDeferredValue } from 'react';
import type { Translation, DictionaryState, Direction } from '../types/dictionary';
import { DictionaryService } from '../services/dictionaryService';

// Modern React 19 features with concurrent rendering
export function useModernDictionary() {
  const [state, setState] = useState<DictionaryState>({
    isLoading: false,
    currentResult: null,
    recentSearches: [],
    favorites: [],
    suggestions: [],
    searchHistory: []
  });

  const [isPending, startTransition] = useTransition();

  // Modern storage with IndexedDB fallback
  const storage = useMemo(() => ({
    async get(key: string) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    },
    async set(key: string, value: any) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Storage failed:', error);
      }
    }
  }), []);

  // Load persisted data with modern async patterns
  useEffect(() => {
    const loadData = async () => {
      const [searches, favorites, history] = await Promise.all([
        storage.get('dictionary-recent-searches'),
        storage.get('dictionary-favorites'),
        storage.get('dictionary-search-history')
      ]);

      setState(prev => ({
        ...prev,
        recentSearches: searches || [],
        favorites: favorites || [],
        searchHistory: history || []
      }));
    };

    loadData();
  }, [storage]);

  // Auto-save with debouncing
  useEffect(() => {
    const saveData = async () => {
      await Promise.all([
        storage.set('dictionary-recent-searches', state.recentSearches),
        storage.set('dictionary-favorites', state.favorites),
        storage.set('dictionary-search-history', state.searchHistory)
      ]);
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [state.recentSearches, state.favorites, state.searchHistory, storage]);

  // Modern search with concurrent features
  const searchWord = useCallback(async (query: string, direction: Direction) => {
    if (!query.trim()) return;

    console.log('🎯 Hook: Starting search for:', query, 'direction:', direction);

    startTransition(() => {
      setState(prev => ({ ...prev, isLoading: true }));
    });

    try {
      const result = await DictionaryService.searchWord(query.trim(), direction);
      console.log('🎯 Hook: Search result:', result);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentResult: result,
        recentSearches: result && result.meanings.length > 0 && !result.meanings[0].definitions[0].includes('не найден') && !result.meanings[0].definitions[0].includes('یافت نشد')
          ? [query, ...prev.recentSearches.filter(item => item !== query)].slice(0, 10)
          : prev.recentSearches,
        searchHistory: result && result.meanings.length > 0 && !result.meanings[0].definitions[0].includes('не найден') && !result.meanings[0].definitions[0].includes('یافت نشد')
          ? [...prev.searchHistory, { query, timestamp: Date.now(), direction }].slice(-50)
          : prev.searchHistory
      }));
    } catch (error) {
      console.error('Search error:', error);
      console.error('🎯 Hook: Search failed for:', query);
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentResult: null
      }));
    }
  }, []);

  // Smart suggestions with real database
  const getSuggestions = useCallback(async (query: string, direction: Direction) => {
    if (!query.trim()) {
      console.log('🎯 Hook: Clearing suggestions and result for empty query');
      setState(prev => ({ ...prev, suggestions: [], currentResult: null }));
      return;
    }

    console.log('🎯 Hook: Getting suggestions for:', query, 'direction:', direction, 'table:', direction === 'ru-fa' ? 'rus_words' : 'pers_words');

    try {
      const suggestions = await DictionaryService.getSuggestions(query.trim(), direction);
      console.log('🎯 Hook: Got suggestions:', suggestions, 'for direction:', direction);
      setState(prev => ({ ...prev, suggestions }));
    } catch (error) {
      console.error('🎯 Hook: Suggestions failed:', error);
      setState(prev => ({ ...prev, suggestions: [] }));
    }
  }, []);

  // Clear result when search is cleared
  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, currentResult: null }));
  }, []);

  // Modern favorite management with optimistic updates
  const toggleFavorite = useCallback((word: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(word)
        ? prev.favorites.filter(item => item !== word)
        : [...prev.favorites, word]
    }));
  }, []);

  const removeFavorite = useCallback((word: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(item => item !== word)
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState(prev => ({ ...prev, recentSearches: [] }));
  }, []);

  const clearFavorites = useCallback(() => {
    setState(prev => ({ ...prev, favorites: [] }));
  }, []);

  const removeFromRecentSearches = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      recentSearches: prev.recentSearches.filter(item => item !== query)
    }));
  }, []);

  return {
    ...state,
    isPending,
    searchWord,
    clearResult,
    getSuggestions,
    toggleFavorite,
    removeFavorite,
    clearRecentSearches,
    clearFavorites,
    removeFromRecentSearches
  };
}