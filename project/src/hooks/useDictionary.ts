import { useState, useEffect, useCallback } from 'react';

interface Translation {
  word: string;
  pronunciation?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: string[];
    examples?: string[];
  }>;
  phonetic?: string;
}

// Mock data for demonstration
const mockData: Record<string, Translation> = {
  // Russian words
  'привет': {
    word: 'привет',
    phonetic: 'priˈvʲet',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: ['سلام، درود'],
        examples: ['Привет, как дела? - سلام، چطوری؟']
      }
    ]
  },
  'дом': {
    word: 'дом',
    phonetic: 'dom',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: ['خانه، منزل'],
        examples: ['Мой дом очень красивый - خانه من خیلی زیبا است']
      }
    ]
  },
  'любовь': {
    word: 'любовь',
    phonetic: 'lʲuˈbofʲ',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: ['عشق، محبت'],
        examples: ['Любовь к семье - عشق به خانواده']
      }
    ]
  },
  // Persian words
  'سلام': {
    word: 'سلام',
    phonetic: 'sæˈlɒːm',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: ['привет, здравствуйте'],
        examples: ['سلام برادر - привет, брат']
      }
    ]
  },
  'خانه': {
    word: 'خانه',
    phonetic: 'xɒːˈne',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: ['дом, жилище'],
        examples: ['خانه بزرگ - большой дом']
      }
    ]
  },
  'عشق': {
    word: 'عشق',
    phonetic: 'eʃɣ',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: ['любовь, страсть'],
        examples: ['عشق واقعی - настоящая любовь']
      }
    ]
  }
};

export function useDictionary() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<Translation | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('dictionary-recent-searches');
    const savedFavorites = localStorage.getItem('dictionary-favorites');
    
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('dictionary-recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem('dictionary-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const searchWord = useCallback(async (query: string, direction: 'ru-fa' | 'fa-ru') => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = mockData[query.toLowerCase()] || mockData[query];
    setCurrentResult(result || null);
    
    // Add to recent searches if found
    if (result) {
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item !== query);
        return [query, ...filtered].slice(0, 10); // Keep only last 10 searches
      });
    }
    
    setIsLoading(false);
  }, []);

  const getSuggestions = useCallback((query: string, direction: 'ru-fa' | 'fa-ru') => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const allWords = Object.keys(mockData);
    const matches = allWords.filter(word => 
      word.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(matches);
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