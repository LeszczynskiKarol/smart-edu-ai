// src/components/page/VideoSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface VideoSectionProps {
  title: string;
  description: string;
  url?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  title,
  description,
  url,
}) => {
  const { theme } = useTheme();

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-[#1f2937]'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className={`text-center mb-12 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {description}
        </motion.p>

        {url && (
          <motion.div className="w-full max-w-[1000px] aspect-video mx-auto">
            <iframe
              className="w-full h-full rounded-lg shadow-xl"
              src={url}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
