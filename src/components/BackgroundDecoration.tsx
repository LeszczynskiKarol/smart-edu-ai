// src/components/BackgroundDecoration.tsx
'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

const BackgroundDecoration: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{
                stopColor:
                  theme === 'dark' ? 'rgb(29, 78, 216)' : 'rgb(59, 130, 246)',
                stopOpacity: 0.1,
              }}
            />
            <stop
              offset="100%"
              style={{
                stopColor:
                  theme === 'dark' ? 'rgb(30, 64, 175)' : 'rgb(37, 99, 235)',
                stopOpacity: 0.1,
              }}
            />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L1000,0 L1000,1000 C900,950 800,1000 700,950 C600,900 500,850 400,900 C300,950 200,1000 100,950 L0,1000 Z"
          fill="url(#grad1)"
        />
        <path
          d="M0,1000 C100,950 200,1000 300,950 C400,900 500,850 600,900 C700,950 800,1000 900,950 L1000,1000 L1000,0 L0,0 Z"
          fill={
            theme === 'dark'
              ? 'rgba(30, 64, 175, 0.05)'
              : 'rgba(37, 99, 235, 0.05)'
          }
        />
      </svg>
    </div>
  );
};

export default BackgroundDecoration;
