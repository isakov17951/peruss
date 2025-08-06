import { useState, useCallback, useRef } from 'react';
import { WordRepository } from '../repositories/WordRepository';
import { SEARCH_CONSTANTS, ERROR_MESSAGES } from '../constants/app';
import type { Translation, Direction } from '../types/dictionary';

interface SearchState {
  isLoading: boolean;
  currentResult: Translation | null;
  suggestions: string[];
  error: string | null;
}

export function useSearch() {
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    currentResult: null,
    suggestions: [],
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchWord = useCallback(async (query: string, direction: Direction) => {
    if (!query.trim()) {
      setSearchState(prev => ({ ...prev, currentResult: null, error: null }));
      return;
    }

    console.log('🎯 useSearch: Starting search for:', query, 'direction:', direction);

    // Отменяем предыдущий запрос если он есть
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setSearchState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const isRussian = direction === 'ru-fa';
      const { data: wordData, error } = await WordRepository.findWordWithTranslations(
        query.trim(), 
        isRussian
      );

      if (error) {
        console.error('🎯 useSearch: Repository error:', error);
        setSearchState(prev => ({
          ...prev,
          isLoading: false,
          currentResult: null,
          error: ERROR_MESSAGES.SEARCH_FAILED
        }));
        return;
      }

      if (!wordData) {
        console.log('🎯 useSearch: Word not found');
        setSearchState(prev => ({
          ...prev,
          isLoading: false,
          currentResult: null,
          error: direction === 'ru-fa' ? ERROR_MESSAGES.WORD_NOT_FOUND : ERROR_MESSAGES.WORD_NOT_FOUND_FA
        }));
        return;
      }

      // Формируем результат для UI
      const result: Translation = {
        word: wordData.word,
        phonetic: wordData.phonetic,
        meanings: [{
          partOfSpeech: wordData.part_of_speech,
          definitions: wordData.translation 
            ? [wordData.translation]
            : wordData.translations?.map(t => t.definition) || [
                direction === 'ru-fa' ? ERROR_MESSAGES.TRANSLATION_NOT_FOUND : ERROR_MESSAGES.TRANSLATION_NOT_FOUND_FA
              ],
          examples: wordData.examples?.map(ex => ex.example_text).slice(0, SEARCH_CONSTANTS.MAX_EXAMPLES) || []
        }]
      };

      console.log('🎯 useSearch: Search successful:', result);
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        currentResult: result,
        error: null
      }));

    } catch (error) {
      console.error('🎯 useSearch: Unexpected error:', error);
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        currentResult: null,
        error: ERROR_MESSAGES.GENERIC_ERROR
      }));
    }
  }, []);

  const getSuggestions = useCallback(async (query: string, direction: Direction) => {
    // Очищаем предыдущий таймер
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    console.log('🎯 useSearch: Getting suggestions for:', query, 'direction:', direction);

    // Debounce для оптимизации
    suggestionsTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: suggestions, error } = await WordRepository.findSuggestions(
          query.trim(), 
          direction, 
          SEARCH_CONSTANTS.MAX_SUGGESTIONS
        );

        if (error) {
          console.error('🎯 useSearch: Suggestions error:', error);
          setSearchState(prev => ({ ...prev, suggestions: [] }));
          return;
        }

        console.log('🎯 useSearch: Got suggestions:', suggestions);
        setSearchState(prev => ({ ...prev, suggestions: suggestions || [] }));

      } catch (error) {
        console.error('🎯 useSearch: Suggestions unexpected error:', error);
        setSearchState(prev => ({ ...prev, suggestions: [] }));
      }
    }, SEARCH_CONSTANTS.DEBOUNCE_DELAY);
  }, []);

  const clearResult = useCallback(() => {
    setSearchState(prev => ({ 
      ...prev, 
      currentResult: null, 
      error: null 
    }));
  }, []);

  const clearError = useCallback(() => {
    setSearchState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup при размонтировании
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
  }, []);

  return {
    ...searchState,
    searchWord,
    getSuggestions,
    clearResult,
    clearError,
    cleanup
  };
}