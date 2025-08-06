import React from 'react';
import { Clock, Search, Sparkles, X } from 'lucide-react';
import type { Direction } from '../types/dictionary';

interface HistoryManagerProps {
  onSearchFromHistory: (query: string) => void;
  direction: Direction;
  recentSearches: string[];
  removeFromRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
}

export function HistoryManager({ 
  onSearchFromHistory, 
  direction,
  recentSearches,
  removeFromRecentSearches,
  clearRecentSearches
}: HistoryManagerProps) {

  if (recentSearches.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-3xl shadow-sm sm:shadow-2xl border border-dashed border-blue-300 p-3 sm:p-8 max-w-6xl mx-auto relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-5 -right-5 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 -left-5 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center py-4 sm:py-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Clock className="w-8 h-8 sm:w-16 sm:h-16 text-blue-300 animate-pulse" />
                <Sparkles className="w-2.5 h-2.5 sm:w-6 sm:h-6 text-blue-400 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-bounce" />
              </div>
            </div>
            <h4 className="text-base sm:text-2xl font-bold text-blue-700 mb-2 sm:mb-4">История поиска пуста</h4>
            <p className="text-blue-600 text-xs sm:text-lg max-w-md mx-auto leading-relaxed mb-3 sm:mb-6">
              Начните поиск слов, и они появятся здесь для быстрого доступа к переводам
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-500">
              <Search className="w-2.5 h-2.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Поищите слово → Оно сохранится → Быстрый повторный поиск</span>
              <span className="text-xs font-medium sm:hidden">Поищите слово</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-3xl shadow-sm sm:shadow-2xl border border-dashed border-blue-300 p-3 sm:p-8 max-w-6xl mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-5 -right-5 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-5 -left-5 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-6">
          <h3 className="text-lg sm:text-2xl font-bold flex items-center">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-lg">
              <Clock className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Недавние поиски
            </span>
          </h3>
          <button
            onClick={clearRecentSearches}
            className="px-2 sm:px-6 py-1 sm:py-3 text-xs sm:text-sm text-blue-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 border border-blue-300 hover:border-blue-500 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-lg transform hover:scale-105"
          >
            Очистить все
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-3">
          {recentSearches.map((search, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-md sm:rounded-2xl p-1.5 sm:p-4 transition-all duration-300 border border-dashed border-blue-200 hover:border-blue-400 hover:shadow-sm sm:hover:shadow-lg transform hover:scale-[1.01] sm:hover:scale-105 cursor-pointer"
            >
              {/* Decorative elements */}
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60"></div>
              <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-40"></div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSearchFromHistory(search)}
                  className={`flex-1 text-left font-medium text-xs sm:text-base text-blue-700 group-hover:text-blue-800 transition-colors duration-200 ${
                    direction === 'fa-ru' ? 'text-right' : 'text-left'
                  } truncate ${/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(search) ? 'font-persian' : ''}`}
                  dir={direction === 'fa-ru' ? 'rtl' : 'ltr'}
                  title={search}
                >
                  {search}
                </button>
                <button
                  onClick={() => removeFromRecentSearches(search)}
                  className="ml-0.5 sm:ml-2 p-0.5 sm:p-1.5 text-blue-400 hover:text-white hover:bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-md sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        {/* Statistics */}
        <div className="mt-2 sm:mt-6 text-center">
          <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 sm:px-6 py-1 sm:py-3 rounded-full border border-blue-200">
            <Search className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-blue-500" />
            <span className="text-blue-700 font-medium text-xs sm:text-sm">
              {recentSearches.length} {recentSearches.length === 1 ? 'поиск' : recentSearches.length < 5 ? 'поиска' : 'поисков'} в истории
            </span>
            <Sparkles className="w-2 h-2 sm:w-4 sm:h-4 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}