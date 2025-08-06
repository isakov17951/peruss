import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { SearchContainer } from './components/SearchContainer';
import { HistoryManager } from './components/HistoryManager';
import { FavoritesManager } from './components/FavoritesManager';
import ErrorBoundary from './components/ErrorBoundary';
import type { Direction } from './types/dictionary';

function App() {
  const [direction, setDirection] = useState<Direction>('ru-fa');
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  const handleSearchFromHistory = (query: string) => {
    setActiveTab('search');
    // The SearchContainer will handle the actual search
  };

  const handleDirectionChange = (newDirection: Direction) => {
    setDirection(newDirection);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 relative overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-400/15 to-gray-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
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
                <span className="hidden sm:inline">Избранное</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-3 sm:space-y-8">
            {activeTab === 'search' ? (
              <>
                <SearchContainer 
                  direction={direction}
                  onDirectionChange={handleDirectionChange}
                />
                <HistoryManager 
                  onSearchFromHistory={handleSearchFromHistory}
                  direction={direction}
                />
              </>
            ) : (
              <FavoritesManager
                onFavoriteClick={handleSearchFromHistory}
                direction={direction}
              />
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;