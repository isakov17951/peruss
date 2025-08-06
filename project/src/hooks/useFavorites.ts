import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, SEARCH_CONSTANTS } from '../constants/app';

interface FavoritesState {
  favorites: string[];
  isLoading: boolean;
  error: string | null;
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>({
    favorites: [],
    isLoading: false,
    error: null
  });

  // Загрузка избранного из localStorage при инициализации
  useEffect(() => {
    const loadFavorites = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        const favorites = saved ? JSON.parse(saved) : [];
        
        setState(prev => ({
          ...prev,
          favorites,
          isLoading: false,
          error: null
        }));
      } catch (error) {
        console.error('💥 useFavorites: Failed to load favorites:', error);
        setState(prev => ({
          ...prev,
          favorites: [],
          isLoading: false,
          error: 'Не удалось загрузить избранное'
        }));
      }
    };

    loadFavorites();
  }, []);

  // Сохранение в localStorage с debounce
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
      } catch (error) {
        console.error('💥 useFavorites: Failed to save favorites:', error);
        setState(prev => ({
          ...prev,
          error: 'Не удалось сохранить избранное'
        }));
      }
    }, SEARCH_CONSTANTS.STORAGE_SAVE_DELAY);

    return () => clearTimeout(saveTimeout);
  }, [state.favorites]);

  const toggleFavorite = useCallback((word: string) => {
    if (!word.trim()) return;

    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(word)
        ? prev.favorites.filter(item => item !== word)
        : [...prev.favorites, word],
      error: null
    }));
  }, []);

  const addToFavorites = useCallback((word: string) => {
    if (!word.trim() || state.favorites.includes(word)) return;

    setState(prev => ({
      ...prev,
      favorites: [...prev.favorites, word],
      error: null
    }));
  }, [state.favorites]);

  const removeFromFavorites = useCallback((word: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(item => item !== word),
      error: null
    }));
  }, []);

  const clearFavorites = useCallback(() => {
    setState(prev => ({
      ...prev,
      favorites: [],
      error: null
    }));
  }, []);

  const isFavorite = useCallback((word: string) => {
    return state.favorites.includes(word);
  }, [state.favorites]);

  const getFavoritesCount = useCallback(() => {
    return state.favorites.length;
  }, [state.favorites]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    favorites: state.favorites,
    isLoading: state.isLoading,
    error: state.error,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
    getFavoritesCount,
    clearError
  };
}