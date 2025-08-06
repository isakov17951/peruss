import type { Direction } from '../types/dictionary';

export const formatPhonetic = (phonetic?: string): string => {
  if (!phonetic) return '';
  
  const trimmed = phonetic.trim();
  
  // Добавляем слэши если их нет
  if (!trimmed.startsWith('/') && !trimmed.endsWith('/')) {
    return `/${trimmed}/`;
  }
  
  return trimmed;
};

export const getDifficultyStyle = (difficulty: string): string => {
  const normalizedDifficulty = difficulty.toLowerCase();
  
  switch (normalizedDifficulty) {
    case 'начальный':
    case 'beginner':
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'средний':
    case 'intermediate':
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'продвинутый':
    case 'advanced':
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
};

export const formatPartOfSpeech = (partOfSpeech: string): string => {
  const translations: Record<string, string> = {
    'noun': 'существительное',
    'verb': 'глагол',
    'adjective': 'прилагательное',
    'adverb': 'наречие',
    'preposition': 'предлог',
    'conjunction': 'союз',
    'interjection': 'междометие',
    'pronoun': 'местоимение'
  };
  
  return translations[partOfSpeech.toLowerCase()] || partOfSpeech;
};

export const getDirectionLabel = (direction: Direction): string => {
  return direction === 'ru-fa' ? 'Русский → Персидский' : 'Персидский → Русский';
};

export const getOppositeDirection = (direction: Direction): Direction => {
  return direction === 'ru-fa' ? 'fa-ru' : 'ru-fa';
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ч назад`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} дн назад`;
  }
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
};

export const isRTL = (text: string): boolean => {
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return rtlRegex.test(text);
};

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};