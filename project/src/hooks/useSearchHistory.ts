import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, SEARCH_CONSTANTS } from '../constants/app';
import type { Direction } from '../types/dictionary';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  direction: Direction;
}

interface SearchHistoryState {
  recentSearches: string[];
  searchHistory: SearchHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSearchHistory() {
  const [state, setState] = useState<SearchHistoryState>({
    recentSearches: [],
    searchHistory: [],
    isLoading: false,
    error: null
  });

  // Загрузка истории из localStorage при инициализации
  useEffect(() => {
    const loadHistory = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const [recentSearches, searchHistory] = await Promise.all([
          localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
          localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
        ]);

        setState(prev => ({
          ...prev,
          recentSearches: recentSearches ? JSON.parse(recentSearches) : [],
          searchHistory: searchHistory ? JSON.parse(searchHistory) : [],
          isLoading: false,
          error: null
        }));
      } catch (error) {
        console.error('💥 useSearchHistory: Failed to load history:', error);
        setState(prev => ({
          ...prev,
          recentSearches: [],
          searchHistory: [],
          isLoading: false,
          error: 'Не удалось загрузить историю поиска'
        }));
      }
    };

    loadHistory();
  }, []);

  // Сохранение в localStorage с debounce
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(state.recentSearches));
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(state.searchHistory));
      } catch (error) {
        console.error('💥 useSearchHistory: Failed to save history:', error);
        setState(prev => ({
          ...prev,
          error: 'Не удалось сохранить историю поиска'
        }));
      }
    }, SEARCH_CONSTANTS.STORAGE_SAVE_DELAY);

    return () => clearTimeout(saveTimeout);
  }, [state.recentSearches, state.searchHistory]);

  const addToHistory = useCallback((query: string, direction: Direction, wasSuccessful: boolean = true) => {
    if (!query.trim() || !wasSuccessful) return;

    const timestamp = Date.now();

    setState(prev => {
      // Обновляем недавние поиски
      const filteredRecent = prev.recentSearches.filter(item => item !== query);
      const newRecentSearches = [query, ...filteredRecent].slice(0, SEARCH_CONSTANTS.MAX_RECENT_SEARCHES);

      // Обновляем полную историю
      const newHistoryItem: SearchHistoryItem = { query, timestamp, direction };
      const newSearchHistory = [newHistoryItem, ...prev.searchHistory].slice(0, SEARCH_CONSTANTS.MAX_SEARCH_HISTORY);

      return {
        ...prev,
        recentSearches: newRecentSearches,
        searchHistory: newSearchHistory,
        error: null
      };
    });
  }, []);

  const removeFromRecentSearches = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      recentSearches: prev.recentSearches.filter(item => item !== query),
      error: null
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState(prev => ({
      ...prev,
      recentSearches: [],
      error: null
    }));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchHistory: [],
      error: null
    }));
  }, []);

  const clearAllHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      recentSearches: [],
      searchHistory: [],
      error: null
    }));
  }, []);

  const getSearchStats = useCallback(() => {
    const totalSearches = state.searchHistory.length;
    const uniqueQueries = new Set(state.searchHistory.map(item => item.query)).size;
    const russianSearches = state.searchHistory.filter(item => item.direction === 'ru-fa').length;
    const persianSearches = state.searchHistory.filter(item => item.direction === 'fa-ru').length;

    return {
      totalSearches,
      uniqueQueries,
      russianSearches,
      persianSearches,
      recentCount: state.recentSearches.length
    };
  }, [state.searchHistory, state.recentSearches]);

  const getRecentByDirection = useCallback((direction: Direction) => {
    return state.searchHistory
      .filter(item => item.direction === direction)
      .map(item => item.query)
      .slice(0, 5); // Последние 5 для каждого направления
  }, [state.searchHistory]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    recentSearches: state.recentSearches,
    searchHistory: state.searchHistory,
    isLoading: state.isLoading,
    error: state.error,
    addToHistory,
    removeFromRecentSearches,
    clearRecentSearches,
    clearSearchHistory,
    clearAllHistory,
    getSearchStats,
    getRecentByDirection,
    clearError
  };
}