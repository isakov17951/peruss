import { WordRepository } from '../repositories/WordRepository';
import { ERROR_MESSAGES, SEARCH_CONSTANTS } from '../constants/app';
import { createSuccess, createError, type AsyncResult } from '../types/common';
import type { Translation, Direction } from '../types/dictionary';
import type { WordWithTranslations } from '../types/database';


export class SearchService {
  /**
   * Поиск с fallback стратегией и правильной обработкой ошибок
   */
  static async searchWithFallback(query: string, direction: Direction): AsyncResult<Translation> {
    if (!query.trim()) {
      return createError('Пустой поисковый запрос');
    }

    console.log('🎯 SearchService: Starting search for:', query, 'direction:', direction);

    try {
      const isRussian = direction === 'ru-fa';
      const { data: wordData, error } = await WordRepository.findWordWithTranslations(
        query.trim(), 
        isRussian
      );

      if (error) {
        console.error('🎯 SearchService: Repository error:', error);
        return createError(ERROR_MESSAGES.CONNECTION_ERROR, 'DB_ERROR');
      }

      if (!wordData) {
        // Попробуем поиск в противоположном направлении как fallback
        console.log('🎯 SearchService: Trying fallback search...');
        const { data: fallbackData, error: fallbackError } = await WordRepository.findWordWithTranslations(
          query.trim(), 
          !isRussian
        );

        if (fallbackError || !fallbackData) {
          const errorMessage = direction === 'ru-fa' 
            ? ERROR_MESSAGES.WORD_NOT_FOUND 
            : ERROR_MESSAGES.WORD_NOT_FOUND_FA;
          return createError(errorMessage, 'WORD_NOT_FOUND');
        }

        // Используем fallback данные
        const fallbackResult = this.formatSearchResult(fallbackData);
        console.log('✅ SearchService: Fallback search successful');
        return createSuccess(fallbackResult);
      }

      // Основной результат найден
      const result = this.formatSearchResult(wordData);
      console.log('✅ SearchService: Search successful');
      return createSuccess(result);

    } catch (error) {
      console.error('💥 SearchService: Unexpected error:', error);
      return createError(ERROR_MESSAGES.GENERIC_ERROR, 'UNEXPECTED_ERROR');
    }
  }

  /**
   * Форматирование данных из БД в формат UI
   */
  static formatSearchResult(wordData: WordWithTranslations): Translation {
    console.log('🔄 SearchService: Formatting result:', wordData);

    // Собираем все примеры
    const allExamples = (wordData.examples?.map(ex => ex.example_text) || [])
      .slice(0, SEARCH_CONSTANTS.MAX_EXAMPLES);

    // Собираем все переводы
    let definitions: string[] = [];
    
    if (wordData.translation) {
      definitions.push(wordData.translation);
    }
    
    if (wordData.translations && wordData.translations.length > 0) {
      const translationDefs = wordData.translations.map(translation => translation.definition);
      definitions.push(...translationDefs);
    }

    // Если нет переводов, показываем сообщение
    if (definitions.length === 0) {
      definitions = ['Перевод не найден в базе данных'];
    }

    // Убираем дубликаты
    definitions = [...new Set(definitions)];

    const result: Translation = {
      word: wordData.word,
      phonetic: wordData.phonetic || undefined,
      meanings: [{
        partOfSpeech: wordData.part_of_speech,
        definitions,
        examples: allExamples
      }]
    };

    console.log('✅ SearchService: Formatted result:', result);
    return result;
  }

  /**
   * Получение подсказок с оптимизацией
   */
  static async getSuggestions(query: string, direction: Direction): AsyncResult<string[]> {
    if (!query.trim()) {
      return createSuccess([]);
    }

    console.log('🔍 SearchService: Getting suggestions for:', query, 'direction:', direction);

    try {
      const { data: suggestions, error } = await WordRepository.findSuggestions(
        query.trim(), 
        direction, 
        SEARCH_CONSTANTS.MAX_SUGGESTIONS
      );

      if (error) {
        console.error('❌ SearchService: Suggestions error:', error);
        return createError('Ошибка получения подсказок', 'SUGGESTIONS_ERROR');
      }

      console.log('✅ SearchService: Got suggestions:', suggestions?.length || 0);
      return createSuccess(suggestions || []);

    } catch (error) {
      console.error('💥 SearchService: Suggestions unexpected error:', error);
      return createError('Неожиданная ошибка при получении подсказок', 'UNEXPECTED_ERROR');
    }
  }

  /**
   * Валидация поискового запроса
   */
  static validateSearchQuery(query: string): { success: true; data: string } | { success: false; error: string; code?: string } {
    const trimmed = query.trim();
    
    if (!trimmed) {
      return createError('Поисковый запрос не может быть пустым');
    }

    if (trimmed.length < SEARCH_CONSTANTS.SEARCH_MIN_LENGTH) {
      return createError(`Минимальная длина запроса: ${SEARCH_CONSTANTS.SEARCH_MIN_LENGTH} символ`);
    }

    if (trimmed.length > 100) {
      return createError('Слишком длинный поисковый запрос');
    }

    return createSuccess(trimmed);
  }

  /**
   * Определение языка по тексту
   */
  static detectLanguage(text: string): 'ru' | 'fa' | 'unknown' {
    const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    const russianRegex = /[\u0400-\u04FF]/;

    if (persianRegex.test(text)) {
      return 'fa';
    } else if (russianRegex.test(text)) {
      return 'ru';
    }

    return 'unknown';
  }

  /**
   * Проверка здоровья сервиса
   */
  static async healthCheck(): AsyncResult<boolean> {
    try {
      const isHealthy = await WordRepository.healthCheck();
      return createSuccess(isHealthy);
    } catch (error) {
      console.error('💥 SearchService: Health check failed:', error);
      return createError('Сервис недоступен', 'SERVICE_UNAVAILABLE');
    }
  }
}