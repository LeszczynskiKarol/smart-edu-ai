// src/components/examples/ExampleSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ExampleSidebarProps {
  locale: string;
}

export default function ExampleSidebar({ locale }: ExampleSidebarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const content = {
    pl: {
      badge: 'Wygenerowane przez AI',
      title: 'Ta praca została wygenerowana w Smart-Edu.AI',
      description: 'Zarejestruj się i wygeneruj dowolną pracę dla siebie!',
      cta: 'Załóż darmowe konto',
      features: [
        'Prace licencjackie i magisterskie',
        'Referaty i eseje',
        'Generowanie w 5-45 min',
        'Profesjonalne formatowanie',
      ],
    },
    en: {
      badge: 'AI Generated',
      title: 'This work was generated in 45 min by Smart-Edu.AI',
      description: 'Sign up and generate any work for yourself!',
      cta: 'Start for free',
      features: [
        'Bachelor & Master theses',
        'Reports and essays',
        'Generated in 5-45 min',
        'Professional formatting',
      ],
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div
      className={`transition-all duration-300 ${isSticky ? 'lg:sticky lg:top-20' : ''}`}
    >
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl shadow-xl p-6 border-2 border-blue-200 dark:border-blue-700">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
            <Sparkles className="w-3 h-3" />
            {t.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {t.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">{t.description}</p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {t.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-blue-500 mt-1">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href={`/${locale}/register`} className="block w-full">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
            {t.cta}
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
