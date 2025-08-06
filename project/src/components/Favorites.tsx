import React from 'react';
import { Heart, Trash2, Star, BookOpen, Search, X } from 'lucide-react';

interface FavoritesProps {
  favorites: string[];
  onFavoriteClick: (word: string) => void;
  onRemoveFavorite: (word: string) => void;
  onClearAll: () => void;
  direction: 'ru-fa' | 'fa-ru';
}

export default function Favorites({ 
  favorites, 
  onFavoriteClick, 
  onRemoveFavorite, 
  onClearAll, 
  direction 
}: FavoritesProps) {
  const isRtl = direction === 'fa-ru';

  if (favorites.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-lg sm:rounded-3xl border border-dashed border-red-200 p-4 sm:p-16 text-center relative overflow-hidden shadow-sm sm:shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-5 -right-5 sm:-top-20 sm:-right-20 w-12 h-12 sm:w-40 sm:h-40 bg-gradient-to-br from-red-200/40 to-rose-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-5 -left-5 sm:-bottom-20 sm:-left-20 w-12 h-12 sm:w-40 sm:h-40 bg-gradient-to-tr from-pink-200/40 to-red-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-32 sm:h-32 bg-gradient-to-r from-rose-200/20 to-red-200/20 rounded-full blur-2xl animate-gentle-float"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-3 sm:mb-6">
            <div className="relative">
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-r from-red-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Heart className="w-6 h-6 sm:w-12 sm:h-12 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-2 h-2 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
          
          <h3 className="text-base sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2 sm:mb-4">
            Избранные слова пусты
          </h3>
          
          <p className="text-red-600 mb-4 sm:mb-8 max-w-md mx-auto leading-relaxed text-xs sm:text-lg">
            Добавьте слова в избранное, нажав на иконку сердечка при переводе
          </p>
          
          <div className="flex items-center justify-center text-xs sm:text-sm text-red-500 bg-white/50 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-3 border border-red-200">
            <Search className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-red-400" />
            <span className="font-medium hidden sm:inline">Найдите слово → Нажмите</span>
            <span className="font-medium sm:hidden">Найдите слово</span>
            <Heart className="w-3 h-3 sm:w-5 sm:h-5 mx-1 sm:mx-2 text-red-500 animate-pulse" />
            <span className="font-medium hidden sm:inline">→ Добавьте в избранное</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-3xl shadow-sm sm:shadow-2xl border border-red-100 p-3 sm:p-12 max-w-4xl mx-auto relative overflow-hidden">
      {/* Background decoration for filled state */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-3 -right-3 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-32 sm:h-32 bg-gradient-to-br from-red-100/30 to-rose-100/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-3 -left-3 sm:-bottom-10 sm:-left-10 w-12 h-12 sm:w-32 sm:h-32 bg-gradient-to-tr from-pink-100/30 to-red-100/30 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-8">
          <h3 className="text-base sm:text-3xl font-bold flex items-center">
            <Heart className="w-4 h-4 sm:w-8 sm:h-8 text-red-500 mr-1.5 sm:mr-3" />
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Избранные слова
            </span>
          </h3>
          <button
            onClick={onClearAll}
            className="px-2 sm:px-6 py-1 sm:py-3 text-xs sm:text-sm text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 border border-red-300 hover:border-red-500 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-lg transform hover:scale-105"
          >
            Очистить все
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-4">
          {favorites.map((favorite, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 rounded-md sm:rounded-2xl p-2 sm:p-6 transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-sm sm:hover:shadow-xl transform hover:scale-[1.01] sm:hover:scale-105 cursor-pointer"
            >
              {/* Decorative elements */}
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-gradient-to-r from-red-400 to-rose-400 rounded-full opacity-60"></div>
              <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full opacity-40"></div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onFavoriteClick(favorite)}
                  className={`flex-1 text-left font-medium text-xs sm:text-lg text-red-700 group-hover:text-red-800 transition-colors duration-200 ${
                    isRtl ? 'text-right font-persian' : 'text-left'
                  }`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  {favorite}
                </button>
                <button
                  onClick={() => onRemoveFavorite(favorite)}
                  className="ml-0.5 sm:ml-3 p-0.5 sm:p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                >
                  <X className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-200/20 to-rose-200/20 rounded-md sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        {/* Statistics */}
        <div className="mt-3 sm:mt-8 text-center">
          <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-red-50 to-rose-50 px-3 sm:px-6 py-1.5 sm:py-3 rounded-full border border-red-200">
            <Heart className="w-3 h-3 sm:w-5 sm:h-5 text-red-500" />
            <span className="text-red-700 font-medium text-xs sm:text-base">
              {favorites.length} {favorites.length === 1 ? 'слово' : favorites.length < 5 ? 'слова' : 'слов'} в избранном
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}