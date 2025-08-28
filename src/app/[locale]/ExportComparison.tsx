import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import ComparisonCard from './ComparisonCard';

const ExportComparison = () => {
  const componentRef = useRef(null);

  const handleExport = async () => {
    if (componentRef.current) {
      try {
        const canvas = await html2canvas(componentRef.current);
        const image = canvas.toDataURL('image/png');
        
        // Tworzenie linku do pobrania
        const link = document.createElement('a');
        link.href = image;
        link.download = 'porownanie.png';
        link.click();
      } catch (error) {
        console.error('Błąd podczas eksportu:', error);
      }
    }
  };

  return (
    <div>
      <div ref={componentRef}>
        <ComparisonCard />
      </div>
      <button 
        onClick={handleExport}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Eksportuj jako PNG
      </button>
    </div>
  );
};

export default ExportComparison;