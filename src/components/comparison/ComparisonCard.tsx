// src/components/comparison/ComparisonCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { NotebookPen } from 'lucide-react';

const MarketingCarousel = () => {
  return (
    <Carousel
      showArrows={true}
      showStatus={false}
      showThumbs={false}
      infiniteLoop={true}
      showIndicators={false}
      className="max-w-6xl mt-0"
    >
      {/* Slajd - Języki */}
      <div className="relative h-[1200px] bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Subtelny pattern w tle */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="absolute top-8 right-8 z-30">
          <div className="flex items-center text-xl font-bold text-blue-600">
            <NotebookPen className="w-6 h-6 mr-2" />
            Smart-Edu.AI
          </div>
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col px-12 pt-24">
          {/* Nagłówek */}
          <h2 className="text-4xl font-bold text-blue-800 mb-16 text-center">
            Twórz prace w wielu językach!
          </h2>

          {/* Główny kontener - grid na dwie kolumny */}
          <div className="grid grid-cols-2 gap-12 w-full max-w-6xl mx-auto">
            {/* Lewa kolumna - Lista języków */}
            <div className="grid grid-cols-2 gap-4 content-center">
              {/* Języki */}
              {[
                { flag: '🇵🇱', name: 'Polski' },
                { flag: '🇬🇧', name: 'Angielski' },
                { flag: '🇩🇪', name: 'Niemiecki' },
                { flag: '🇺🇦', name: 'Ukraiński' },
                { flag: '🇫🇷', name: 'Francuski' },
                { flag: '🇪🇸', name: 'Hiszpański' },
                { flag: '🇷🇺', name: 'Rosyjski' },
                { flag: '🇵🇹', name: 'Portugalski' },
              ].map((lang) => (
                <div
                  key={lang.name}
                  className="bg-blue-50 p-4 rounded-xl border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <h3 className="text-lg font-bold text-blue-900">
                      {lang.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Prawa kolumna - Screenshot */}
            <div className="flex items-center">
              <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/images/language-selector.png"
                  alt="Wybór języka w aplikacji"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
              </div>
            </div>
          </div>

          {/* Dolna sekcja */}
          <div className="mt-auto pb-12 text-center">
            <p className="text-blue-600 text-xl">
              Polska aplikacja - światowe możliwości! 🌍
            </p>
          </div>
        </div>
      </div>

      {/* Slajd - Proces wyszukiwania */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
        {/* Efekt świetlny */}
        <div className="absolute inset-0">
          <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        </div>

        {/* Logo */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center text-xl font-bold text-white">
            <NotebookPen className="w-4 h-4 mr-2 text-blue-300" />
            Smart-Edu.AI
          </div>
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Jak <span className="text-blue-300">Smart-Edu.AI</span> znajduje
            <br />
            informacje do Twojej pracy?
          </h2>

          <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
            {/* Etap 1 */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 relative">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                1
              </div>
              <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                Weryfikacja wymagań
              </h3>
              <p className="text-blue-100 text-center">
                Analiza tematu i Twoich potrzeb
              </p>
            </div>

            {/* Etap 2 */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 relative">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                2
              </div>
              <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                Wyszukiwanie źródeł
              </h3>
              <p className="text-blue-100 text-center">
                Przeszukiwanie aktualnych zasobów
              </p>
            </div>

            {/* Etap 3 */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 relative">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                3
              </div>
              <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                Analiza treści
              </h3>
              <p className="text-blue-100 text-center">
                Przetwarzanie znalezionych informacji
              </p>
            </div>

            {/* Etap 4 */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 relative">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                4
              </div>
              <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-4xl">✍️</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                Generowanie tekstu
              </h3>
              <p className="text-blue-100 text-center">
                Tworzenie unikalnej treści
              </p>
            </div>
          </div>

          {/* Dolne info */}
          <div className="mt-12 text-center bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full">
            <p className="text-blue-100 text-xl">
              Zawsze aktualne dane w Twojej pracy zaliczeniowej! 🎯
            </p>
          </div>
        </div>
      </div>

      {/* Slajd 1 - Proces twórczy */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center px-20">
          <h2 className="text-5xl font-bold text-white mb-8 text-center">
            Smart-Edu.AI
          </h2>
          <h2 className="text-4xl font-bold text-white mb-16 text-center">
            - Twoja pomoc w pisaniu pracy!
          </h2>

          <div className="grid grid-cols-3 gap-12 w-full max-w-5xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6">
                <span className="text-4xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Inspiracja</h3>
              <p className="text-blue-100">
                Poznaj różne ujęcia tematu i zbierz pomysły
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Analiza</h3>
              <p className="text-blue-100">
                Przestudiuj strukturę i argumentację
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Twórcza praca
              </h3>
              <p className="text-blue-100">
                Dodaj własne przemyślenia i przykłady
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd 2 - Praktyczne wykorzystanie */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center px-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Jak wykorzystać wygenerowany tekst?
          </h2>

          <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-4 text-white mb-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <p className="text-xl">Wykorzystaj jako punkt wyjścia</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-4 text-white mb-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <p className="text-xl">Zbadaj źródła i argumenty</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-4 text-white mb-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <p className="text-xl">Dostosuj styl do swoich potrzeb</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-4 text-white mb-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <p className="text-xl">Dodaj własną perspektywę</p>
              </div>
            </div>
          </div>

          <p className="text-blue-100 mt-8 text-center text-lg">
            Pamiętaj: AI to narzędzie wspierające Twoją kreatywność!
          </p>
        </div>
      </div>

      {/* Slajd 1 - Hero z obrazkiem */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-700 to-blue-900">
        {/* Zdjęcie studenta z overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/student.jpg"
              className="w-full h-full object-cover opacity-75 transform -translate-x-1/4"
              alt="Student przy biurku"
            />
          </div>
        </div>

        {/* Biała nakładka geometryczna */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-white opacity-95 clip-path-polygon-[0_0,_100%_0,_100%_100%,_20%_100%]" />
        </div>

        {/* Elementy dekoracyjne */}
        <div className="absolute top-8 left-8 grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white/20 rounded-full" />
          ))}
        </div>

        {/* Logo w prawym górnym rogu */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center justify-center text-1xl font-bold text-gray-800 mb-6">
            <NotebookPen className="w-4 h-4 mr-2 text-blue-600" />
            Smart-Edu.AI
          </div>
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto w-full px-8">
            <div className="ml-auto w-[60%]">
              <h1 className="text-8xl font-bold mb-6 text-blue-800 leading-tight">
                Masz pracę do napisania?
              </h1>
            </div>
          </div>
        </div>

        {/* Dolne elementy dekoracyjne */}
        <div className="absolute bottom-8 left-8">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-12 h-1 bg-white rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-[600px] bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        {/* Efekt świetlny */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-spin-slow">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/30 to-transparent blur-3xl transform rotate-12" />
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-8">
          {/* Ikona */}
          <div className="mb-8">
            <NotebookPen className="w-16 h-16 text-white" />
          </div>

          {/* Główny tekst */}
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Masz pracę do napisania?
            <br />
            <span className="text-blue-200">
              AI napisze ją za Ciebie w 5 minut!
            </span>
          </h1>

          {/* Cechy */}
          <div className="grid grid-cols-2 gap-4 max-w-xl mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
              <span className="text-white">Wypracowania</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
              <span className="text-white">Referaty</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
              <span className="text-white">Eseje</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
              <span className="text-white">Analizy</span>
            </div>
          </div>

          {/* Cena */}
          <div className="text-2xl font-bold text-white">
            Tylko 3,99 zł / 150 słów
          </div>
        </div>

        {/* Dekoracyjne elementy */}
        <div className="absolute bottom-8 left-8 grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white/20 rounded-full" />
          ))}
        </div>
      </div>

      <div className="relative h-[250px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        {/* Efekt świetlny w tle */}
        <div className="absolute inset-0">
          <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_50%)]" />
        </div>

        {/* Logo w prawym górnym rogu */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center justify-center text-xl font-bold text-white">
            <NotebookPen className="w-4 h-4 mr-2 text-blue-300" />
            Smart-Edu.AI
          </div>
        </div>

        {/* Główny tytuł */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-8">
          <div className="text-center space-y-4">
            {/* Główny tekst */}
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              {/* Tu wstawisz swój tekst */}
              Tytuł Twojej Pracy
            </h1>

            {/* Podtytuł/badge */}
            <div className="flex justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-lg">✨ Smart-Edu.AI</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-lg">⚡️ 5 minut</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dekoracyjne kropki na dole */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-blue-100 rounded-full animate-pulse delay-200" />
          </div>
        </div>
      </div>
      {/* Slajd 1: Przykładowe prace - przegląd */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-700 to-blue-900">
        <div className="absolute inset-0">
          <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        </div>

        {/* Logo */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center text-xl font-bold text-white">
            <NotebookPen className="w-4 h-4 mr-2 text-blue-300" />
            Smart-Edu.AI
          </div>
        </div>

        <div className="relative z-20 h-full flex">
          {/* Lewa strona - Kolaż ze screenshotów */}
          <div className="w-1/2 p-8 flex items-center justify-center">
            <div className="relative w-full h-[500px] grid grid-cols-2 gap-4">
              {/* Główny, duży screenshot */}
              <div className="col-span-2 relative rounded-xl overflow-hidden shadow-2xl h-64">
                <img
                  src="/images/1.png"
                  alt="Przykład pracy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Dwa mniejsze screenshoty obok siebie */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/images/2.png"
                  alt="Przykład pracy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/images/3.png"
                  alt="Przykład pracy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* Prawa strona - Tekst */}
          <div className="w-1/2 p-12 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white mb-8">
              Od wypracowania po pracę magisterską
            </h2>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="flex items-center gap-4 text-2xl text-white mb-2">
                  <span>📚</span>
                  <h3 className="font-bold">Szkoła podstawowa</h3>
                </div>
                <p className="text-blue-100">
                  Wypracowania, opowiadania, charakterystyki
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="flex items-center gap-4 text-2xl text-white mb-2">
                  <span>🎓</span>
                  <h3 className="font-bold">Szkoła średnia</h3>
                </div>
                <p className="text-blue-100">Rozprawki, analizy, referaty</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="flex items-center gap-4 text-2xl text-white mb-2">
                  <span>🎯</span>
                  <h3 className="font-bold">Studia</h3>
                </div>
                <p className="text-blue-100">
                  Prace licencjackie, projekty badawcze
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd 2: Możliwości */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-800 to-blue-900">
        <div className="absolute inset-0">
          <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="relative z-20 h-full p-12 flex flex-col items-center">
          <h2 className="text-5xl font-bold text-white mb-12 text-center">
            <span className="text-blue-300">Smart-Edu.AI</span>
          </h2>

          <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
            {/* Lewa kolumna */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Dowolna długość
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xl text-blue-100">
                    <span className="text-blue-300">→</span>
                    Od krótkich wypracowań
                  </div>
                  <div className="flex items-center gap-3 text-xl text-blue-100">
                    <span className="text-blue-300">→</span>
                    Po kilkunastostronicowe prace
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <h3 className="text-3xl font-bold text-white mb-4">5 minut</h3>
                <div className="text-xl text-blue-100">
                  Bez względu na długość czy poziom zaawansowania
                </div>
              </div>
            </div>

            {/* Prawa kolumna */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Każdy temat
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xl text-blue-100">
                    <span className="text-blue-300">→</span>
                    Humanistyczne
                  </div>
                  <div className="flex items-center gap-3 text-xl text-blue-100">
                    <span className="text-blue-300">→</span>
                    Ścisłe
                  </div>
                  <div className="flex items-center gap-3 text-xl text-blue-100">
                    <span className="text-blue-300">→</span>
                    Specjalistyczne
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Przystępna cena
                </h3>
                <div className="text-xl text-blue-100">
                  Tylko 3,99 zł za 150 słów
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Slajd 1.5 - Storytelling */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-800 to-blue-900">
        {/* Tło z gradientem i efektem */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/student2.jpg"
              className="w-full h-full object-cover opacity-75 transform -translate-x-1/4"
              alt="Zestresowany student"
            />
          </div>
        </div>

        {/* Biała nakładka geometryczna z prawej */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[55%] h-full bg-white opacity-95 clip-path-polygon-[0_0,_100%_0,_100%_100%,_15%_100%]" />
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto w-full px-4">
            <div className="ml-auto w-[50%] space-y-2">
              {/* Nagłówek główny */}
              <h2 className="text-6xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Deadline się zbliża, a Ty dalej w lesie?
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd - Rozwiązanie problemu */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-100 to-blue-200">
        {/* Tło z obrazem */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/student-idea.jpg"
            className="w-full h-full object-cover opacity-90"
            alt="Student z pomysłem"
          />
        </div>

        {/* Główna treść - kontener */}
        <div className="relative z-20 h-full w-full">
          <div className="h-full max-w-6xl mx-auto px-8 flex items-center justify-center">
            {/* Box z tekstem */}
            <div className="w-[500px] flex flex-col justify-center">
              {' '}
              {/* zmieniona szerokość na stałą wartość */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Przezroczyste tło */}
                <div className="absolute inset-0 bg-white/100"></div>
                {/* Nieprzezroczysta zawartość */}
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-center text-3xl font-bold text-gray-800 mb-6">
                    <NotebookPen className="w-8 h-8 mr-2 text-blue-600" />
                    Smart-Edu.AI
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-6">
                    Sztuczna inteligencja stworzona specjalnie dla uczniów i
                    studentów
                  </p>

                  {/* Benefity w gridzie */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-lg text-gray-700">Praca w 5 min</p>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-lg text-gray-700">Zero stresu</p>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-lg text-gray-700">Niski koszt</p>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-lg text-gray-700">Wysoka jakość</p>
                    </div>
                  </div>

                  <p className="text-lg text-gray-700">
                    AI przeanalizuje Twoje wymagania i stworzy idealną pracę,
                    dopasowaną do Twoich potrzeb.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd otwierający - Porównanie z ChatGPT */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Tło z gradientem */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900">
          {/* Efekt świetlny */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/30 to-transparent blur-3xl transform rotate-12" />
          </div>
        </div>

        {/* Logo w prawym górnym rogu */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center justify-center text-xl font-bold text-white">
            <NotebookPen className="w-4 h-4 mr-2 text-blue-300" />
            Smart-Edu.AI
          </div>
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-8">
          {/* Nagłówek */}
          <h2 className="text-5xl font-bold text-white mb-8 max-w-4xl leading-tight">
            ChatGPT vs Smart-Edu.AI
            <br />
            <span className="text-blue-300">Poznaj różnicę!</span>
          </h2>

          {/* Podtytuł */}
          <p className="text-2xl text-blue-100 mb-12 max-w-3xl">
            Zobacz, dlaczego profesjonalny asystent do pisania prac to lepszy
            wybór niż zwykły chatbot
          </p>

          {/* Badges */}
          <div className="flex gap-6 mb-12">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-lg">Szybsze pisanie</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-lg">Lepsza jakość</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-lg">Aktualne źródła</span>
            </div>
          </div>

          {/* Strzałka w dół */}
          <div className="animate-bounce">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-2xl">↓</span>
            </div>
          </div>
        </div>

        {/* Elementy dekoracyjne na dole */}
        <div className="absolute bottom-8 left-8">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-12 h-1 bg-white/20 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Slajd 1 - Szybkość i efektywność */}
      <div className="relative h-[600px] overflow-hidden bg-white">
        {/* Główny kontener */}
        <div className="h-full grid grid-cols-2">
          {/* Lewa strona - ChatGPT */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-12">
            {/* Nagłówek ChatGPT */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">ChatGPT</h3>
            </div>

            {/* Lista problemów */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-white/80 p-6 rounded-xl shadow-sm">
                <span className="text-red-500 text-2xl font-bold">1.</span>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    Czasochłonne iteracje
                  </h4>
                  <p className="text-gray-600">
                    Wielokrotne wysyłanie promptów i ręczne łączenie fragmentów
                    tekstu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/80 p-6 rounded-xl shadow-sm">
                <span className="text-red-500 text-2xl font-bold">2.</span>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    Limit długości
                  </h4>
                  <p className="text-gray-600">
                    Konieczność dzielenia dłuższych prac na części i
                    samodzielnego łączenia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/80 p-6 rounded-xl shadow-sm">
                <span className="text-red-500 text-2xl font-bold">3.</span>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    Brak spójności
                  </h4>
                  <p className="text-gray-600">
                    Trudność w utrzymaniu jednolitego stylu między fragmentami
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prawa strona - Smart-Edu.AI */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-12">
            {/* Nagłówek Smart-Edu.AI */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <NotebookPen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-white">Smart-Edu.AI</h3>
            </div>

            {/* Lista zalet */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <span className="text-blue-300 text-2xl font-bold">1.</span>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Błyskawiczne pisanie
                  </h4>
                  <p className="text-blue-100">
                    Kompletna praca w 5 minut - wystarczy podać temat i długość
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <span className="text-blue-300 text-2xl font-bold">2.</span>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Dowolna długość
                  </h4>
                  <p className="text-blue-100">
                    Generowanie prac nawet na kilkanaście stron w jednym kroku
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <span className="text-blue-300 text-2xl font-bold">3.</span>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Idealna spójność
                  </h4>
                  <p className="text-blue-100">
                    Jednolity styl i płynne przejścia między sekcjami
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd 2 - Specjalizacja i dostosowanie */}
      <div className="relative h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Nagłówek */}
        <div className="pt-12 text-center">
          <h2 className="text-4xl font-bold text-gray-800">
            Narzędzie stworzone dla uczniów i studentów
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative mt-12 px-8 flex justify-center">
          <div className="w-full max-w-6xl grid grid-cols-5 gap-8">
            {/* ChatGPT */}
            <div className="col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-xl font-bold text-gray-800">ChatGPT</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="text-red-500">✕</span>
                    Ogólne narzędzie konwersacyjne
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="text-red-500">✕</span>
                    Brak znajomości formatów akademickich
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="text-red-500">✕</span>
                    Chaotyczna struktura tekstu
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Środkowa kolumna - elementy łączące */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="h-full w-1 bg-blue-200"></div>
              <div className="absolute -translate-y-1/2 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl">
                vs
              </div>
            </div>

            {/* Smart-Edu.AI */}
            <div className="col-span-2 space-y-6 ">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <NotebookPen className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Smart-Edu.AI</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <h4 className="font-semibold mb-2">
                      ✓ Specjalny generator
                    </h4>
                    <p className="text-blue-100 text-sm">
                      Stworzony specjalnie do pisania prac akademickich
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <h4 className="font-semibold mb-2">
                      ✓ Profesjonalna struktura
                    </h4>
                    <p className="text-blue-100 text-sm">
                      Automatyczne formatowanie zgodne z wymogami
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <h4 className="font-semibold mb-2">✓ Dowolność prac</h4>
                    <p className="text-blue-100 text-sm">
                      Napisze dla Ciebie każdy rodzaj pracy zaliczeniowej
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd 3 - Źródła wiedzy */}
      <div className="relative h-[600px] bg-gradient-to-br from-gray-900 to-blue-900 overflow-hidden">
        {/* Efekt świetlny w tle */}
        <div className="absolute inset-0">
          <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(25,119,242,0.1)_0%,transparent_50%)]" />
        </div>

        {/* Główna zawartość */}
        <div className="relative h-full flex flex-col items-center pt-8 px-8">
          {/* Nagłówek */}
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Źródła wiedzy
          </h2>

          {/* Karty z porównaniem */}
          <div className="w-full max-w-6xl grid grid-cols-2 gap-12 mt-8">
            {/* ChatGPT */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">ChatGPT</h3>
                  <p className="text-gray-400">Wiedza zamrożona w czasie</p>
                </div>
              </div>

              {/* Ilustracja ograniczeń */}
              <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-4xl mb-4">
                    🔒
                  </div>
                </div>
                <div className="text-center text-gray-400 mt-4">
                  Dane tylko do 2022 roku
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-red-500 text-xl">✕</span>
                  Brak dostępu do aktualnych źródeł
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-red-500 text-xl">✕</span>
                  Nieaktualne informacje i dane
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-red-500 text-xl">✕</span>
                  Niemożność weryfikacji źródeł
                </div>
              </div>
            </div>

            {/* Smart-Edu.AI */}
            <div className="bg-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-400/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center">
                  <span className="text-4xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Smart-Edu.AI
                  </h3>
                  <p className="text-blue-200">Dynamiczne wyszukiwanie</p>
                </div>
              </div>

              {/* Ilustracja aktywnego wyszukiwania */}
              <div className="bg-blue-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-3xl">
                    📱
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-3xl">
                    💻
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-3xl">
                    📰
                  </div>
                </div>
                <div className="text-center text-blue-200 mt-4">
                  Bieżące dane z internetu
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-100">
                  <span className="text-blue-300 text-xl">✓</span>
                  Aktualne informacje z sieci
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <span className="text-blue-300 text-xl">✓</span>
                  Weryfikowane źródła z internetu
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <span className="text-blue-300 text-xl">✓</span>
                  Najnowsze dane i statystyki
                </div>
              </div>

              {/* Badge wyróżniający */}
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                Zawsze aktualne źródła! 🎯
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd CTA - Zamknięcie */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Efekt świetlny */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        {/* Logo */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center justify-center text-xl font-bold text-white">
            <NotebookPen className="w-4 h-4 mr-2 text-blue-300" />
            Smart-Edu.AI
          </div>
        </div>

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-8">
          {/* Nagłówek */}
          <h2 className="text-6xl font-bold text-white mb-8 max-w-3xl leading-tight">
            Przestań się stresować
            <br />
            <span className="text-blue-200">pisaniem prac!</span>
          </h2>

          {/* Kluczowe benefity */}
          <div className="flex gap-6 mb-12">
            <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
              <span className="text-xl">⚡️</span>
              <span className="text-white">5 minut</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
              <span className="text-xl">💰</span>
              <span className="text-white">3,99 zł/150 słów</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
              <span className="text-xl">🎯</span>
              <span className="text-white">Zawsze na temat</span>
            </div>
          </div>

          {/* CTA */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur"></div>
            <button className="relative bg-white text-blue-600 px-12 py-6 rounded-full text-2xl font-bold shadow-lg">
              Załóż darmowe konto
            </button>
          </div>
        </div>

        {/* Dolny badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-blue-200 text-xl">
            Dołącz do tysięcy zadowolonych studentów! 🎓
          </p>
        </div>
      </div>

      {/* Slajd - Jak to działa */}
      <div className="relative h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Główna treść - kontener */}
        <div className="relative z-20 h-full w-full">
          <div className="h-full max-w-6xl mx-auto px-8 flex items-center gap-8">
            {/* Lewa strona - Screenshot aplikacji */}
            <div className="w-1/2 h-full flex items-center justify-center p-8">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/app-screenshot.jpg"
                  className="w-full h-full object-cover"
                  alt="Screenshot aplikacji Smart-Edu.AI"
                />
                {/* Nakładka z gradientem dla lepszego efektu */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>

            {/* Prawa strona - Instrukcja */}
            <div className="w-1/2 space-y-8">
              <h2 className="text-4xl font-bold text-gray-800">
                Jak działa Smart-Edu.AI?
              </h2>

              <div className="space-y-6">
                {/* Krok 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Wprowadź temat
                    </h3>
                    <p className="text-gray-600">
                      Podaj temat pracy i dodaj wytyczne, które pomogą AI lepiej
                      zrozumieć Twoje potrzeby.
                    </p>
                  </div>
                </div>

                {/* Krok 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      AI analizuje źródła
                    </h3>
                    <p className="text-gray-600">
                      Sztuczna inteligencja przeszukuje rzetelne źródła i bazę
                      wiedzy, aby zebrać potrzebne informacje i na ich podstawie
                      przygotować Twoją pracę.
                    </p>
                  </div>
                </div>

                {/* Krok 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Gotowa praca w 5 minut
                    </h3>
                    <p className="text-gray-600">
                      Otrzymujesz kompletną pracę gotową do pobrania w formacie
                      PDF lub DOCX. Możesz ją dowolnie edytować!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Slajd z porównaniem */}
      <div className="relative h-[600px] overflow-hidden">
        <div className="h-full grid grid-cols-2">
          {/* Lewa strona - tradycyjna metoda */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Elementy dekoracyjne */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/5 rounded-full blur-3xl" />

            {/* Treść */}
            <div className="relative z-10 p-12 h-full flex flex-col justify-center">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
                <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-red-500 rounded-full" />
                  😫 Tradycyjne metody
                </h3>

                <ul className="space-y-6">
                  <li className="flex items-center gap-4 text-xl text-white/90 bg-white/5 p-4 rounded-xl">
                    <span className="text-red-500 font-bold text-2xl">✕</span>
                    <span>Korepetycje: aż 80 zł/h</span>
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white/90 bg-white/5 p-4 rounded-xl">
                    <span className="text-red-500 font-bold text-2xl">✕</span>
                    <span>Strata 2-3h cennego czasu</span>
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white/90 bg-white/5 p-4 rounded-xl">
                    <span className="text-red-500 font-bold text-2xl">✕</span>
                    <span>Koszt: 160-240 zł!</span>
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white/90 bg-white/5 p-4 rounded-xl">
                    <span className="text-red-500 font-bold text-2xl">✕</span>
                    <span>I tak musisz napisać samodzielnie...</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Prawa strona - Smart-Edu.AI */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
            {/* Elementy dekoracyjne */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-300/20 rounded-full blur-3xl" />

            {/* Treść */}
            <div className="relative z-10 p-12 h-full flex flex-col justify-center">
              <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-400/30">
                {/* Badge */}
                <div className="absolute -top-4 right-8 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  BESTSELLER 🔥
                </div>

                <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-400 rounded-full" />
                  🚀 Smart-Edu.AI
                </h3>

                <ul className="space-y-6">
                  <li className="flex items-center gap-4 text-xl text-white bg-white/10 p-4 rounded-xl">
                    <span className="text-blue-300 font-bold text-2xl">✓</span>
                    <span>Tylko 3,99 zł/150 słów</span>
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white bg-white/10 p-4 rounded-xl">
                    <span className="text-blue-300 font-bold text-2xl">✓</span>
                    <span>Praca na 3 strony: 27,90 zł!</span>
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white bg-white/10 p-4 rounded-xl">
                    <span className="text-blue-300 font-bold text-2xl">✓</span>
                    <span>Gotowe w 5 minut</span>
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white bg-white/10 p-4 rounded-xl">
                    <span className="text-blue-300 font-bold text-2xl">✓</span>
                    <span>Praca gotowa do oddania</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slajd 4 - CTA */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Zdjęcie studenta z overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/student-happy.jpg"
              className="w-full h-full object-cover opacity-20"
              alt="Szczęśliwy student"
            />
          </div>
        </div>

        {/* Nakładka gradientowa */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-950/80" />

        {/* Główna treść */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center">
          {/* Górny napis */}
          <h2 className="text-6xl font-bold text-white mb-6 max-w-4xl">
            Zapomnij o stresie i&nbsp;nieprzespanych nocach
            <br />
            <span className="text-blue-300">
              Stwórz pracę <br />
              w&nbsp;Smart-Edu.AI!
            </span>
          </h2>

          {/* Podtytuł */}
          <p className="text-2xl text-blue-100 mb-12 max-w-2xl">
            Oszczędź czas i nerwy dzięki sztucznej inteligencji do generowania
            prac pisemnych
          </p>

          {/* Przycisk CTA */}
          <motion.a
            href="/register"
            className="group relative inline-flex items-center justify-center bg-white text-blue-600 px-12 py-6 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">
              Załóż darmowe konto <br />
              na Smart-Edu.AI
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </motion.a>
        </div>
      </div>
    </Carousel>
  );
};

export default MarketingCarousel;
