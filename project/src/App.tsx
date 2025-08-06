import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ModernSearchInput from './components/ModernSearchInput';
import ModernTranslationResult from './components/ModernTranslationResult';
import Favorites from './components/Favorites';
import VirtualKeyboard from './components/VirtualKeyboard';
import { Clock, Search, Sparkles, X } from 'lucide-react';
import { useModernDictionary } from './hooks/useModernDictionary';
import type { Direction } from './types/dictionary';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [direction, setDirection] = useState<Direction>('ru-fa');
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [keyboardLanguage, setKeyboardLanguage] = useState<'ru' | 'fa'>('ru');
  
  const {
    isLoading,
    isPending,
    currentResult,
    recentSearches,
    favorites,
    suggestions,
    searchWord,
    getSuggestions,
    toggleFavorite,
    removeFavorite,
    clearRecentSearches,
    clearFavorites,
    removeFromRecentSearches
  } = useModernDictionary();

  // Get suggestions as user types
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getSuggestions(searchQuery, direction);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, direction, getSuggestions]);

  const handleSearch = (query: string) => {
    searchWord(query, direction);
    setActiveTab('search');
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    // Clear result when search input is cleared
    if (!value.trim()) {
      // Clear the current result to hide the translation card
      // This will be handled by the hook's internal state management
    }
  };

  const handleSearchFromHistory = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleDirectionChange = (newDirection: Direction) => {
    setDirection(newDirection);
    setSearchQuery('');
    getSuggestions('', newDirection);
    // Update keyboard language based on direction
    setKeyboardLanguage(newDirection === 'ru-fa' ? 'ru' : 'fa');
  };

  const handleVirtualKeyboard = () => {
    setShowVirtualKeyboard(true);
    // Scroll to show header, search input and keyboard
    setTimeout(() => {
      const searchSection = document.querySelector('.search-section');
      if (searchSection) {
        const headerHeight = 80; // Approximate header height
        const offset = searchSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: Math.max(0, offset),
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleKeyboardClose = () => {
    setShowVirtualKeyboard(false);
    // Optional: scroll back to top when closing keyboard
    if (window.pageYOffset > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
      handleSearch(searchQuery);
    } else if (key === 'Backspace') {
      setSearchQuery(prev => prev.slice(0, -1));
    } else if (key === ' ') {
      setSearchQuery(prev => prev + ' ');
    } else {
      setSearchQuery(prev => prev + key);
    }
  };

  const handleKeyboardLanguageChange = (language: 'ru' | 'fa') => {
    setKeyboardLanguage(language);
    // Also update the main direction
    const newDirection = language === 'ru' ? 'ru-fa' : 'fa-ru';
    setDirection(newDirection);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-400/15 to-gray-400/15 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Search Section */}
        <div className="mb-6 sm:mb-12 relative search-section">
          <ModernSearchInput
            value={searchQuery}
            onChange={handleInputChange}
            onSearch={handleSearch}
            direction={direction}
            suggestions={suggestions}
            isLoading={isLoading}
            isPending={isPending}
            onVirtualKeyboard={handleVirtualKeyboard}
          />
          
          {/* Virtual Keyboard positioned under search */}
          <VirtualKeyboard
            isVisible={showVirtualKeyboard}
            onClose={handleKeyboardClose}
            onKeyPress={handleKeyPress}
            language={keyboardLanguage}
            onLanguageChange={handleKeyboardLanguageChange}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-4 sm:mb-12">
          <div className="flex bg-white/80 backdrop-blur-sm rounded-md sm:rounded-2xl p-0.5 sm:p-2 shadow-sm sm:shadow-md border border-gray-200">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-2 sm:px-8 py-1.5 sm:py-3 rounded-sm sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span className="sm:hidden">Поиск</span>
              <span className="hidden sm:inline">Поиск и результаты</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-2 sm:px-8 py-1.5 sm:py-3 rounded-sm sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span className="sm:hidden">Избранное</span>
              <span className="hidden sm:inline">Избранное ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-3 sm:space-y-8">
          {activeTab === 'search' ? (
            <>
              {/* Translation Result */}
              <ModernTranslationResult
                result={currentResult}
                isLoading={isLoading}
                isPending={isPending}
                direction={direction}
                onFavorite={toggleFavorite}
                isFavorite={currentResult ? favorites.includes(currentResult.word) : false}
              />

              {/* Recent Searches - Always show when no result */}
              {!isLoading && !currentResult && (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-3xl shadow-sm sm:shadow-2xl border border-dashed border-blue-300 p-3 sm:p-8 max-w-6xl mx-auto relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-5 -right-5 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-5 -left-5 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 sm:mb-6">
                      {recentSearches.length > 0 && (
                        <button
                          onClick={clearRecentSearches}
                          className="px-2 sm:px-6 py-1 sm:py-3 text-xs sm:text-sm text-blue-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 border border-blue-300 hover:border-blue-500 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-lg transform hover:scale-105 ml-auto"
                        >
                          Очистить все
                        </button>
                      )}
                    </div>
                    
                    {recentSearches.length > 0 ? (
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
                                onClick={() => handleSearchFromHistory(search)}
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
                    ) : (
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
                    )}
                    
                    {/* Statistics */}
                    {recentSearches.length > 0 && (
                      <div className="mt-2 sm:mt-6 text-center">
                        <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 sm:px-6 py-1 sm:py-3 rounded-full border border-blue-200">
                          <Search className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="text-blue-700 font-medium text-xs sm:text-sm">
                            {recentSearches.length} {recentSearches.length === 1 ? 'поиск' : recentSearches.length < 5 ? 'поиска' : 'поисков'} в истории
                          </span>
                          <Sparkles className="w-2 h-2 sm:w-4 sm:h-4 text-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Favorites Tab */
            <Favorites
              favorites={favorites}
              onFavoriteClick={handleSearchFromHistory}
              onRemoveFavorite={removeFavorite}
              onClearAll={clearFavorites}
              direction={direction}
            />
          )}
        </div>
      </main>

    </div>
  );
}

export default App;