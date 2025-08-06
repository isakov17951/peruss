import React, { useMemo } from 'react';

interface FloatingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: string;
  opacity: string;
}

export default function FloatingWords() {
  const floatingWords = useMemo(() => {
    const words = [
      // Persian words
      'سلام', 'خانه', 'عشق', 'دوست', 'کتاب', 'آسمان', 'دریا', 'گل', 'نور', 'امید',
      'زندگی', 'خوشی', 'آرامش', 'زیبایی', 'دانش', 'هنر', 'موسیقی', 'شعر', 'رنگ', 'طبیعت',
      // Russian words
      'привет', 'дом', 'любовь', 'друг', 'книга', 'небо', 'море', 'цветок', 'свет', 'надежда',
      'жизнь', 'радость', 'покой', 'красота', 'знание', 'искусство', 'музыка', 'поэзия', 'цвет', 'природа'
    ];

    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      text: words[i % words.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 12 + Math.random() * 8, // 12-20 seconds (smoother)
      delay: Math.random() * 15, // 0-15 seconds delay
      size: ['text-lg', 'text-xl', 'text-2xl', 'text-3xl'][Math.floor(Math.random() * 4)],
      opacity: ['opacity-40', 'opacity-50', 'opacity-60'][Math.floor(Math.random() * 3)]
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {floatingWords.map((word) => (
        <div
          key={word.id}
          className={`absolute ${word.size} ${word.opacity} text-gray-400 font-medium select-none`}
          style={{
            left: `${word.x}%`,
            top: `${word.y}%`,
            animation: `floatUpDown ${word.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${word.delay}s`,
          }}
        >
          {word.text}
        </div>
      ))}
    </div>
  );
}