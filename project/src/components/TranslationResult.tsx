import React from 'react';
import { Volume2, Heart, Copy, Star, Search } from 'lucide-react';

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

interface TranslationResultProps {
  result: Translation | null;
  isLoading: boolean;
  direction: 'ru-fa' | 'fa-ru';
  onFavorite: (word: string) => void;
  isFavorite: boolean;
}

export default function TranslationResult({ 
  result, 
  isLoading, 
  direction, 
  onFavorite, 
  isFavorite 
}: TranslationResultProps) {
  const isRtl = direction === 'fa-ru';

  const playPronunciation = () => {
    if (result?.word) {
      // This would integrate with a TTS service
      console.log('Playing pronunciation for:', result.word);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="text-gray-400 mb-2">
          <Search className="w-12 h-12 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">Ready to translate</h3>
        <p className="text-gray-500">
          {direction === 'ru-fa' 
            ? 'Enter a Russian word or phrase to get started' 
            : 'کلمه یا عبارت فارسی را وارد کنید'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Word Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <h2 className={`text-2xl font-bold text-gray-900 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
              {result.word}
            </h2>
            {result.phonetic && (
              <span className="text-gray-600 text-lg">/{result.phonetic}/</span>
            )}
          </div>
          
          <div className={`flex items-center space-x-2 ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              onClick={playPronunciation}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Play pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => copyToClipboard(result.word)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Copy word"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => onFavorite(result.word)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isFavorite 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Meanings */}
      <div className="p-6">
        <div className="space-y-6">
          {result.meanings.map((meaning, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                  {meaning.partOfSpeech}
                </span>
              </div>
              
              <div className="space-y-3">
                {meaning.definitions.map((definition, defIndex) => (
                  <div key={defIndex} className={`${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                    <p className="text-gray-900 text-lg leading-relaxed mb-2">
                      <span className="text-gray-600 font-medium mr-2">{defIndex + 1}.</span>
                      {definition}
                    </p>
                    
                    {meaning.examples && meaning.examples[defIndex] && (
                      <div className="ml-6 p-3 bg-gray-50 rounded-lg border-l-2 border-gray-300">
                        <p className="text-gray-700 italic" dir={isRtl ? 'rtl' : 'ltr'}>
                          "{meaning.examples[defIndex]}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}