import React from 'react';

interface HeaderProps {
}

export default function Header({}: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 safe-area-inset-top shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-start">
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <img 
              src="/peruss-logo (266 x 47 px) (512 x 512 px).png" 
              alt="Русско-Персидский Словарь Логотип"
              className="h-5 w-auto sm:h-8 lg:h-10 object-contain"
            />
            <div>
              <h1 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-slate-800">Peruss</h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}