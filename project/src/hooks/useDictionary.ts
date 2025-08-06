import { useState, useEffect, useCallback, useMemo, useTransition, useDeferredValue } from 'react';
import { DictionaryService } from '../services/dictionaryService';
import { SEARCH_CONSTANTS, STORAGE_KEYS, ERROR_MESSAGES } from '../constants/app';
import type { Translation, Direction } from '../types/dictionary';

interface DictionaryOptions {
  enableModernFeatures?: boolean;
  debounceMs?: number;
  maxRecentSearches?: number;
  maxFavorites?: number;
}

interface DictionaryState {
  isLoading: boolean;
  currentResult: Translation | null;
  recentSearches: string[];
  favorites: string[];
  suggestions: string[];
  error: string | null;
}

interface SearchError {
  code: string;
  message: string;
  userMessage: string;
}

export function useDictionary(options: DictionaryOptions = {}) {
  const {
    enableModernFeatures = true,
    debounceMs = SEARCH_CONSTANTS.DEBOUNCE_DELAY,
    maxRecentSearches = SEARCH_CONSTANTS.MAX_RECENT_SEARCHES,
    maxFavorites = 100
  } = options;

  // Базовое состояние
  const [state, setState] = useState<DictionaryState>({
    isLoading: false,
    currentResult: null,
    recentSearches: [],
    favorites: [],
    suggestions: [],
    error: null
  });

  // Современные React возможности (условно)
  const [isPending, startTransition] = enableModernFeatures 
    ? useTransition() 
    : [false, (fn: () => void) => fn()];

  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = enableModernFeatures 
    ? useDeferredValue(searchQuery) 
    : searchQuery;

  // Загрузка данных из localStorage
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [savedSearches, savedFavorites] = await Promise.all([
          localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
          localStorage.getItem(STORAGE_KEYS.FAVORITES)
        ]);

        setState(prev => ({
          ...prev,
          recentSearches: savedSearches ? JSON.parse(savedSearches) : [],
          favorites: savedFavorites ? JSON.parse(savedFavorites) : []
        }));
      } catch (error) {
        console.error('Failed to load persisted data:', error);
      }
    };

    loadPersistedData();
  }, []);

  // Сохранение в localStorage с debounce
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(state.recentSearches));
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, SEARCH_CONSTANTS.STORAGE_SAVE_DELAY);

    return () => clearTimeout(saveTimeout);
  }, [state.recentSearches, state.favorites]);

  // Мемоизированная функция создания ошибки
  const createSearchError = useCallback((error: unknown, code: string = 'SEARCH_FAILED'): SearchError => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      code,
      message,
      userMessage: ERROR_MESSAGES.SEARCH_FAILED
    };
  }, []);

  // Валидация поискового запроса
  const validateQuery = useCallback((query: string): { isValid: boolean; error?: string } => {
    const trimmed = query.trim();
    
    if (!trimmed) {
      return { isValid: false, error: 'Поисковый запрос не может быть пустым' };
    }
    
    if (trimmed.length > 100) {
      return { isValid: false, error: 'Слишком длинный поисковый запрос' };
    }
    
    return { isValid: true };
  }, []);

  // Проверка качества результата
  const isValidResult = useCallback((result: Translation | null): boolean => {
    if (!result || !result.meanings.length) return false;
    
    return result.meanings.some(meaning => 
      meaning.definitions.some(def => 
        !def.includes('не найден') && 
        !def.includes('یافت نشد') &&
        !def.includes('Перевод не найден') &&
        !def.includes('ترجمه در پایگاه داده یافت نشد')
      )
    );
  }, []);

  // Основная функция поиска
  const searchWord = useCallback(async (query: string, direction: Direction) => {
    const validation = validateQuery(query);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.error || null }));
      return;
    }

    const trimmedQuery = query.trim();
    console.log('🎯 useDictionary: Starting search for:', trimmedQuery, 'direction:', direction);

    const updateState = (updater: (prev: DictionaryState) => DictionaryState) => {
      if (enableModernFeatures) {
        startTransition(() => setState(updater));
      } else {
        setState(updater);
      }
    };

    updateState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await DictionaryService.searchWord(trimmedQuery, direction);
      console.log('🎯 useDictionary: Search result:', result);
      
      updateState(prev => {
        const newState = {
          ...prev,
          isLoading: false,
          currentResult: result,
          error: null
        };

        // Добавляем в историю только успешные поиски
        if (isValidResult(result)) {
          const filteredSearches = prev.recentSearches.filter(item => item !== trimmedQuery);
          newState.recentSearches = [trimmedQuery, ...filteredSearches].slice(0, maxRecentSearches);
        }

        return newState;
      });

    } catch (error) {
      console.error('🎯 useDictionary: Search failed:', error);
      const searchError = createSearchError(error);
      
      updateState(prev => ({
        ...prev,
        isLoading: false,
        currentResult: null,
        error: searchError.userMessage
      }));
    }
  }, [validateQuery, enableModernFeatures, startTransition, isValidResult, maxRecentSearches, createSearchError]);

  // Получение подсказок с debounce
  const getSuggestions = useCallback(async (query: string, direction: Direction) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    console.log('🎯 useDictionary: Getting suggestions for:', query, 'direction:', direction);
    
    try {
      const suggestions = await DictionaryService.getSuggestions(query.trim(), direction);
      console.log('🎯 useDictionary: Got suggestions:', suggestions);
      setState(prev => ({ ...prev, suggestions: suggestions || [] }));
    } catch (error) {
      console.error('🎯 useDictionary: Suggestions failed:', error);
      setState(prev => ({ ...prev, suggestions: [] }));
    }
  }, []);

  // Debounced версия getSuggestions
  const debouncedGetSuggestions = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (query: string, direction: Direction) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        getSuggestions(query, direction);
      }, debounceMs);
    };
  }, [getSuggestions, debounceMs]);

  // Управление избранным
  const toggleFavorite = useCallback((word: string) => {
    if (!word.trim()) return;

    setState(prev => {
      const isFavorite = prev.favorites.includes(word);
      const newFavorites = isFavorite
        ? prev.favorites.filter(item => item !== word)
        : [...prev.favorites, word].slice(0, maxFavorites);

      return { ...prev, favorites: newFavorites };
    });
  }, [maxFavorites]);

  const addToFavorites = useCallback((word: string) => {
    if (!word.trim() || state.favorites.includes(word)) return;
    
    setState(prev => ({
      ...prev,
      favorites: [...prev.favorites, word].slice(0, maxFavorites)
    }));
  }, [state.favorites, maxFavorites]);

  const removeFromFavorites = useCallback((word: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(item => item !== word)
    }));
  }, []);

  // Управление историей поиска
  const removeFromRecentSearches = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      recentSearches: prev.recentSearches.filter(item => item !== query)
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState(prev => ({ ...prev, recentSearches: [] }));
  }, []);

  const clearFavorites = useCallback(() => {
    setState(prev => ({ ...prev, favorites: [] }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Вспомогательные функции
  const isFavorite = useCallback((word: string) => {
    return state.favorites.includes(word);
  }, [state.favorites]);

  const getSearchStats = useCallback(() => {
    return {
      totalSearches: state.recentSearches.length,
      totalFavorites: state.favorites.length,
      hasCurrentResult: !!state.currentResult,
      suggestionsCount: state.suggestions.length
    };
  }, [state]);

  // Очистка ресурсов
  const cleanup = useCallback(() => {
    setState({
      isLoading: false,
      currentResult: null,
      recentSearches: [],
      favorites: [],
      suggestions: [],
      error: null
    });
  }, []);

  return {
    // Состояние
    ...state,
    isPending,
    
    // Основные функции
    searchWord,
    getSuggestions: debouncedGetSuggestions,
    
    // Управление избранным
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    isFavorite,
    
    // Управление историей
    removeFromRecentSearches,
    clearRecentSearches,
    
    // Утилиты
    clearError,
    getSearchStats,
    cleanup,
    
    // Внутренние функции для тестирования
    _internal: {
      validateQuery,
      isValidResult,
      createSearchError
    }
  };
}