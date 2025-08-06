import React, { memo, useState, useCallback } from 'react';
import { Volume2, Heart, Copy, Star, Search, BookOpen, Clock, Zap, Check, VolumeX, Sparkles } from 'lucide-react';
import type { Translation, Direction } from '../types/dictionary';

interface ModernTranslationResultProps {
  result: Translation | null;
  isLoading: boolean;
  isPending?: boolean;
  direction: Direction;
  onFavorite: (word: string) => void;
  isFavorite: boolean;
}

const ModernTranslationResult = memo(function ModernTranslationResult({ 
  result, 
  isLoading, 
  isPending = false,
  direction, 
  onFavorite, 
  isFavorite 
}: ModernTranslationResultProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);
  const isRtl = direction === 'fa-ru';

  const playPronunciation = useCallback(async () => {
    if (!result?.word || !('speechSynthesis' in window)) return;

    setIsPlaying(true);
    
    try {
      const utterance = new SpeechSynthesisUtterance(result.word);
      utterance.lang = direction === 'ru-fa' ? 'ru-RU' : 'fa-IR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      setIsPlaying(false);
      console.error('Speech synthesis failed:', error);
    }
  }, [result?.word, direction]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, []);

  const handleFavoriteClick = useCallback(() => {
    setHeartPulse(true);
    onFavorite(result?.word || '');
    setTimeout(() => setHeartPulse(false), 600);
  }, [onFavorite, result?.word]);
  
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'начальный': return 'bg-green-100 text-green-800 border-green-200';
      case 'средний': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'продвинутый': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyIcon = (frequency?: string) => {
    switch (frequency) {
      case 'частое': return <Zap className="w-4 h-4 text-green-600" />;
      case 'редкое': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'очень редкое': return <Star className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  if (isLoading || isPending) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-gray-200 p-4 sm:p-8 animate-pulse">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32 sm:w-48"></div>
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32"></div>
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl"></div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="h-4 sm:h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-4 sm:h-6 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 sm:h-6 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-3xl border border-dashed border-emerald-200 p-8 sm:p-16 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-20 h-20 sm:w-40 sm:h-40 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-20 h-20 sm:w-40 sm:h-40 bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-300 animate-pulse" />
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-bounce" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 mb-3 sm:mb-4">Готов к переводу</h3>
          <p className="text-emerald-600 text-xs sm:text-lg max-w-md mx-auto leading-relaxed mb-4 sm:mb-6">
            Введите персидское или русское слово для получения перевода
          </p>
          <div className="flex items-center justify-center space-x-2 text-emerald-500">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Начните вводить → Получите перевод → Добавьте в избранное</span>
            <span className="text-xs font-medium sm:hidden">Начните поиск</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-gray-200 overflow-hidden hover:shadow-xl sm:hover:shadow-3xl transition-all duration-500">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 sm:px-8 py-4 sm:py-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex flex-col items-center">
              <h2 className="text-xl sm:text-3xl font-bold" dir={isRtl ? 'rtl' : 'ltr'}>
                <span className={isRtl ? 'font-persian' : ''}>{result.word}</span>
              </h2>
              
              {/* Phonetic transcription directly below the word */}
              {result.phonetic && (
                <div className="mt-1 sm:mt-2">
                  <span className="text-emerald-100 text-sm sm:text-lg font-mono bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                    /{result.phonetic}/
                  </span>
                </div>
              )}

              {/* Part of speech under transcription */}
              {result.meanings.length > 0 && (
                <div className="mt-1 sm:mt-2">
                  <span className="text-emerald-100 text-sm sm:text-lg font-mono bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                    {result.meanings[0].partOfSpeech}
                  </span>
                </div>
              )}
            </div>
            
            <div className={`flex items-center justify-center space-x-1.5 sm:space-x-3 ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button
                onClick={playPronunciation}
                disabled={isPlaying}
                className={`p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all duration-300 group ${
                  isPlaying ? 'animate-pulse bg-white/40 scale-110' : 'hover:scale-105 hover:rotate-12'
                }`}
                title="Воспроизвести произношение"
              >
                {isPlaying ? (
                  <VolumeX className="w-4 h-4 sm:w-6 sm:h-6 animate-bounce" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(result.word)}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  copySuccess 
                    ? 'bg-green-500 text-white scale-110 shadow-lg' 
                    : 'bg-white/20 hover:bg-white/30 hover:scale-105 hover:rotate-12'
                }`}
                title={copySuccess ? 'Скопировано!' : 'Копировать слово'}
              >
                {copySuccess ? (
                  <Check className="w-4 h-4 sm:w-6 sm:h-6 animate-in zoom-in duration-300" />
                ) : (
                  <Copy className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
                )}
                {copySuccess && (
                  <div className="absolute inset-0 bg-green-400/20 rounded-lg sm:rounded-xl animate-ping"></div>
                )}
              </button>
              <button
                onClick={handleFavoriteClick}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group relative ${
                  isFavorite 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/20 hover:bg-white/30'
                } ${heartPulse ? 'animate-pulse scale-125' : 'hover:scale-105'}`}
                title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Heart className={`w-4 h-4 sm:w-6 sm:h-6 transition-all duration-300 ${
                  isFavorite ? 'fill-current scale-110' : 'group-hover:scale-110'
                } ${heartPulse ? 'animate-bounce' : ''}`} />
                {isFavorite && (
                  <div className="absolute inset-0 bg-red-400/20 rounded-lg sm:rounded-xl animate-ping opacity-75"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="p-4 sm:p-8">
        <div className="space-y-4 sm:space-y-8">
          {result.meanings.map((meaning, index) => (
            <React.Fragment key={index}>
                  <div className="flex items-start space-x-2 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-bold rounded-full">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-3 sm:space-y-6">
                      {/* Definitions Section */}
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-sm sm:text-base font-semibold text-emerald-700 flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Переводы:
                        </h4>
                        {meaning.definitions.map((definition, defIndex) => (
                          <div key={defIndex} className={`${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                            <p className={`text-base sm:text-xl leading-relaxed font-medium ${isRtl ? 'font-persian' : ''} p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                              definition.includes('не найден') || definition.includes('یافت نشد') 
                                ? 'text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' 
                                : 'text-gray-900 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                            }`}>
                              <span className="text-emerald-600 font-bold mr-2">{defIndex + 1}.</span>
                              {definition}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Examples Section */}
                      {meaning.examples && meaning.examples.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="text-sm sm:text-base font-semibold text-blue-700 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Примеры использования:
                          </h4>
                          <div className="grid gap-2 sm:gap-3">
                            {meaning.examples.map((example, exampleIndex) => (
                              <div key={exampleIndex} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200">
                                <p className="text-gray-700 text-sm sm:text-lg leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
                                  <span className="text-blue-600 font-bold text-xs sm:text-sm mr-2">#{exampleIndex + 1}</span>
                                  <span className={`italic ${isRtl ? 'font-persian' : ''}`}>"{example}"</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
            </React.Fragment>
          ))}

          {/* Etymology Section */}
          {/* Additional Info Section */}
          <div className="mt-4 sm:mt-8 p-3 sm:p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg sm:rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Часть речи: <strong className="ml-1 text-gray-800">{result.meanings[0]?.partOfSpeech}</strong>
                </span>
                {result.phonetic && (
                  <span className="flex items-center">
                    <Volume2 className="w-4 h-4 mr-1" />
                    Транскрипция: <strong className="ml-1 text-gray-800 font-mono">/{result.phonetic}/</strong>
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {result.meanings.reduce((total, meaning) => total + meaning.definitions.length, 0)} переводов, {' '}
                {result.meanings.reduce((total, meaning) => total + (meaning.examples?.length || 0), 0)} примеров
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModernTranslationResult;