// src/components/carousel/CarouselExport.tsx
'use client';
import React from 'react';
import SlideExport from './SlideExport';
import { NotebookPen } from 'lucide-react';

export default function CarouselExport() {
  // Definiujemy zawartość każdego slajdu jako osobny komponent
  const slides = [
    // Slajd 1 - Hero
    {
      content: (
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
                <h1 className="text-6xl font-bold mb-6 text-blue-800 leading-tight">
                  Masz pracę do napisania?
                  <br />
                  <span className="text-blue-800">
                    Oszczędź sobie czasu i nerwów!
                  </span>
                </h1>
                <p className="text-2xl text-gray-700">
                  <b>Smart-Edu.AI</b> stworzy Twoją pracę w 5 minut!
                  <span className="inline-flex items-center gap-2 ml-2 bg-blue-600 text-white px-4 py-1 rounded-full">
                    Zobacz jak 👉
                  </span>
                </p>
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
      ),
      filename: 'slide-1-hero',
    },
    // Slajd 2 - Storytelling
    {
      content: (
        <div className="relative h-[600px] bg-gradient-to-br from-blue-800 to-blue-900">
          {/* ... zawartość drugiego slajdu ... */}
        </div>
      ),
      filename: 'slide-2-storytelling',
    },
    // itd. dla pozostałych slajdów...
  ];

  return (
    <div className="space-y-8">
      {slides.map((slide, index) => (
        <SlideExport
          key={index}
          slideContent={slide.content}
          filename={slide.filename}
        />
      ))}
    </div>
  );
}
