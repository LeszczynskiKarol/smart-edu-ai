// src/components/home/VideoSection.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Maximize2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale, useTranslations } from 'next-intl';

const VideoSection = () => {
  const { theme } = useTheme();
  const locale = useLocale();
  const t = useTranslations('Video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const videoId = '0bSepjA3yPM';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${
    isPlaying ? 1 : 0
  }&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&controls=0&showinfo=0`;

  const handlePlayStateChange = (newPlayingState: boolean) => {
    setIsPlaying(newPlayingState);
  };

  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowControls(false);
  }, []);

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 
            ${theme === 'dark' ? 'text-foreground' : 'text-foreground'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('headerVideo')}
        </motion.h2>

        <motion.div
          className="relative w-full max-w-[1000px] aspect-video mx-auto rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Video iframe */}
          <iframe
            src={embedUrl}
            title="Smart-Edu.ai"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Controls overlay */}
          <div
            className={`absolute inset-0 z-20 flex flex-col justify-between p-6 transition-opacity duration-300 
              ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Bottom controls */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePlayStateChange(!isPlaying)}
                  className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm 
                    transition-all transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>

                <button
                  className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm 
                  transition-all transform hover:scale-105"
                >
                  <Volume2 className="w-6 h-6 text-white" />
                </button>

                <div className="hidden sm:block w-32 md:w-64 h-1 bg-white/30 rounded-full">
                  <div className="h-full w-1/2 bg-primary rounded-full transition-all" />
                </div>
              </div>

              <button
                className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm 
                transition-all transform hover:scale-105"
              >
                <Maximize2 className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Play button overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer"
              onClick={() => handlePlayStateChange(true)}
            >
              <motion.div
                className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/90 
                  hover:bg-primary transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-10 h-10 text-white ml-1" />
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
