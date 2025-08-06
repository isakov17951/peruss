import React from 'react';
import { Clock, X, Search, Sparkles } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSearchClick: (query: string) => void;
  onClearAll: () => void;
  onRemoveSearch: (query: string) => void;
  direction: 'ru-fa' | 'fa-ru';
}

export default function RecentSearches({ 
  searches, 
  onSearchClick, 
  onClearAll, 
  onRemoveSearch, 
  direction 
}: RecentSearchesProps) {
  const isRtl = direction === 'fa-ru';

  if (searches.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl border-2 border-dashed border-emerald-200 p-16 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Search className="w-16 h-16 text-emerald-300 animate-pulse" />
              <Sparkles className="w-6 h-6 text-emerald-400 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-700 mb-4">Готов к переводу</h3>
          <p className="text-emerald-600 text-lg max-w-md mx-auto leading-relaxed mb-6">
            {direction === 'ru-fa' 
              ? 'Введите русское слово или фразу для получения перевода на персидский язык' 
              : 'شروع به جستجوی کلمات فارسی کنید تا در اینجا برای دسترسی سریع ظاهر شوند'}
          </p>
          <div className="flex items-center justify-center space-x-2 text-emerald-500">
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">Начните вводить → Получите перевод → Добавьте в избранное</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-dashed border-blue-300 p-8 max-w-6xl mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Недавние поиски
            </span>
          </h3>
          <button
            onClick={onClearAll}
            className="px-6 py-3 text-sm text-blue-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 border border-blue-300 hover:border-blue-500 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-lg transform hover:scale-105"
          >
            Очистить все
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {searches.map((search, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl p-4 transition-all duration-300 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:shadow-xl transform hover:scale-105 cursor-pointer"
            >
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-40"></div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSearchClick(search)}
                  className={`flex-1 text-left font-semibold text-blue-700 group-hover:text-blue-800 transition-colors duration-200 ${
                    isRtl ? 'text-right' : 'text-left'
                  } truncate`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  title={search}
                >
                  {search}
                </button>
                <button
                  onClick={() => onRemoveSearch(search)}
                  className="ml-2 p-1.5 text-blue-400 hover:text-white hover:bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        {/* Statistics */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full border border-blue-200">
            <Search className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700 font-medium text-sm">
              {searches.length} {searches.length === 1 ? 'поиск' : searches.length < 5 ? 'поиска' : 'поисков'} в истории
            </span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}