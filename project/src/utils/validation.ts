import type { Result } from '../types/common';
import { LANGUAGE_DETECTION } from '../constants/app';

export const validateSearchQuery = (query: string): Result<string> => {
  const trimmed = query.trim();
  
  if (!trimmed) {
    return { success: false, error: 'Поисковый запрос не может быть пустым', code: 'EMPTY_QUERY' };
  }
  
  if (trimmed.length < 1) {
    return { success: false, error: 'Минимальная длина запроса: 1 символ', code: 'TOO_SHORT' };
  }
  
  if (trimmed.length > 100) {
    return { success: false, error: 'Максимальная длина запроса: 100 символов', code: 'TOO_LONG' };
  }
  
  // Проверка на недопустимые символы
  const invalidChars = /[<>{}[\]\\\/]/;
  if (invalidChars.test(trimmed)) {
    return { success: false, error: 'Запрос содержит недопустимые символы', code: 'INVALID_CHARS' };
  }
  
  return { success: true, data: trimmed };
};

export const validateDirection = (direction: string): Result<'ru-fa' | 'fa-ru'> => {
  if (direction !== 'ru-fa' && direction !== 'fa-ru') {
    return { success: false, error: 'Неверное направление перевода', code: 'INVALID_DIRECTION' };
  }
  
  return { success: true, data: direction };
};

export const validatePhonetic = (phonetic?: string): Result<string | undefined> => {
  if (!phonetic) {
    return { success: true, data: undefined };
  }
  
  const trimmed = phonetic.trim();
  
  if (trimmed.length > 200) {
    return { success: false, error: 'Фонетическая транскрипция слишком длинная', code: 'PHONETIC_TOO_LONG' };
  }
  
  return { success: true, data: trimmed };
};

export const detectLanguage = (text: string): 'ru' | 'fa' | 'unknown' => {
  if (LANGUAGE_DETECTION.PERSIAN_REGEX.test(text)) {
    return 'fa';
  } else if (LANGUAGE_DETECTION.RUSSIAN_REGEX.test(text)) {
    return 'ru';
  }
  
  return 'unknown';
};

export const validatePartOfSpeech = (partOfSpeech: string): Result<string> => {
  const validParts = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun'];
  
  if (!validParts.includes(partOfSpeech.toLowerCase())) {
    return { success: false, error: 'Неверная часть речи', code: 'INVALID_PART_OF_SPEECH' };
  }
  
  return { success: true, data: partOfSpeech.toLowerCase() };
};

export const validateConfidence = (confidence?: number): Result<number> => {
  if (confidence === undefined) {
    return { success: true, data: 100 }; // Default confidence
  }
  
  if (confidence < 1 || confidence > 100) {
    return { success: false, error: 'Уверенность должна быть от 1 до 100', code: 'INVALID_CONFIDENCE' };
  }
  
  return { success: true, data: confidence };
};