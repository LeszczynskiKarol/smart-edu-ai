// src/components/comparison/ComparisonExport.tsx
'use client';
import React from 'react';
import ComparisonCard from './ComparisonCard';
import html2canvas from 'html2canvas';

export default function ComparisonExport() {
  const componentRef = React.useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (componentRef.current) {
      try {
        const canvas = await html2canvas(componentRef.current, {
          backgroundColor: '#ffffff',
          scale: 2, // Wyższa jakość
          useCORS: true,
          logging: true,
          removeContainer: true,
          allowTaint: true,
          foreignObjectRendering: false, // Wyłączamy rendering elementów foreign object
        });

        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'smart-edu-porownanie.png';
        link.click();
      } catch (error) {
        console.error('Błąd eksportu:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={componentRef} className="bg-white">
        <ComparisonCard />
      </div>
      <button
        onClick={handleExport}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Zapisz jako PNG
      </button>
    </div>
  );
}
