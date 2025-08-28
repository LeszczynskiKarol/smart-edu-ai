// src/components/carousel/SlideExport.tsx
'use client';
import React from 'react';
import html2canvas from 'html2canvas';

interface SlideExportProps {
  slideContent: React.ReactNode;
  filename: string;
}

export default function SlideExport({
  slideContent,
  filename,
}: SlideExportProps) {
  const slideRef = React.useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (slideRef.current) {
      try {
        const canvas = await html2canvas(slideRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: true,
          removeContainer: true,
          allowTaint: true,
          foreignObjectRendering: false,
        });

        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `${filename}.png`;
        link.click();
      } catch (error) {
        console.error('Błąd eksportu:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={slideRef} className="bg-white">
        {slideContent}
      </div>
      <button
        onClick={handleExport}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Zapisz {filename} jako PNG
      </button>
    </div>
  );
}
