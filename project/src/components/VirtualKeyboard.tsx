import React, { useState, useCallback } from 'react';
import { X, Globe } from 'lucide-react';

interface VirtualKeyboardProps {
  isVisible: boolean;
  onClose: () => void;
  onKeyPress: (key: string) => void;
  language: 'ru' | 'fa';
  onLanguageChange: (language: 'ru' | 'fa') => void;
}

const russianLayout = [
  ['ё', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
  ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']
];

const persianLayout = [
  ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰', '-', '='],
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', '.']
];

export default function VirtualKeyboard({
  isVisible,
  onClose,
  onKeyPress,
  language,
  onLanguageChange
}: VirtualKeyboardProps) {
  const [isShifted, setIsShifted] = useState(false);

  const currentLayout = language === 'ru' ? russianLayout : persianLayout;

  const handleKeyClick = useCallback((key: string) => {
    onKeyPress(key);
  }, [onKeyPress]);

  const handleBackspace = useCallback(() => {
    onKeyPress('Backspace');
  }, [onKeyPress]);

  const handleSpace = useCallback(() => {
    onKeyPress(' ');
  }, [onKeyPress]);

  const handleEnter = useCallback(() => {
    onKeyPress('Enter');
    onClose();
  }, [onKeyPress, onClose]);

  const handleShift = useCallback(() => {
    setIsShifted(prev => !prev);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block absolute top-full left-0 right-0 mt-4 z-40">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 w-full animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div></div>
          <button
            onClick={onClose}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Enhanced Keyboard */}
        <div className="p-6">
          <div className="space-y-3">
            {currentLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-2">
                {row.map((key, keyIndex) => (
                  <button
                    key={keyIndex}
                    onClick={() => handleKeyClick(key)}
                    className={`min-w-[3rem] h-12 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300 rounded-xl border border-gray-200 hover:border-gray-300 font-medium text-lg transition-all duration-150 hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5 ${
                      language === 'fa' ? 'font-persian font-bold' : 'font-bold'
                    }`}
                    dir={language === 'fa' ? 'rtl' : 'ltr'}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}

            {/* Enhanced Bottom row with special keys */}
            <div className="flex justify-center space-x-2 mt-4">
              {/* Language switcher with globe icon */}
              <button
                onClick={() => onLanguageChange(language === 'ru' ? 'fa' : 'ru')}
                className="px-4 h-12 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300 rounded-xl border border-gray-200 hover:border-gray-300 font-medium transition-all duration-150 hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5 flex items-center space-x-2"
                title={`Переключить на ${language === 'ru' ? 'فارسی' : 'русский'}`}
              >
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {language === 'ru' ? '🇷🇺' : '🇮🇷'}
                </span>
              </button>
              <button
                onClick={handleShift}
                className={`px-6 h-12 rounded-xl border font-medium transition-all duration-150 hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5 ${
                  isShifted
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300 shadow-md'
                    : 'bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>⇧</span>
                  <span>Shift</span>
                </span>
              </button>
              <button
                onClick={handleSpace}
                className="flex-1 max-w-md h-12 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300 rounded-xl border border-gray-200 hover:border-gray-300 font-medium transition-all duration-150 hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>⎵</span>
                  <span>Пробел</span>
                </span>
              </button>
              <button
                onClick={handleEnter}
                className="px-6 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white rounded-xl font-medium transition-all duration-150 hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
              >
                <span className="flex items-center space-x-1">
                  <span>⏎</span>
                  <span>Enter</span>
                </span>
              </button>
              <button
                onClick={handleBackspace}
                className="px-6 h-12 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 active:from-red-200 active:to-red-300 text-red-700 rounded-xl border border-red-200 hover:border-red-300 font-medium transition-all duration-150 hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
              >
                <span className="flex items-center space-x-1">
                  <span>⌫</span>
                  <span>Del</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}