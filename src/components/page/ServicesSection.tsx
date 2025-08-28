// src/components/page/ServicesSection.tsx

'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import {
  DocumentTextIcon,
  ShoppingBagIcon,
  FolderIcon,
  BuildingOfficeIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';

interface ServicesSectionProps {
  title: string;
  services: Array<{
    title: string;
    description: string;
    icon: string;
    price?: string;
  }>;
}

interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  category?: string;
}

const ServiceCard: React.FC<{
  service: Service;
  /*onSelect: (service: Service) => void;*/
}> = ({ service }) => {
  const { theme } = useTheme();
  const t = useTranslations('ServicesSection.services');

  return (
    <motion.div
      className={`p-6 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } transition-all duration-300 ease-in-out hover:scale-105`}
    >
      <div className="flex items-center mb-4">
        <div className="text-blue-500 mr-4">{service.icon}</div>
        <h3
          className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {t(`${service.titleKey}.title`)}
        </h3>
      </div>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {t(`${service.titleKey}.description`)}
      </p>
    </motion.div>
  );
};

const ServicesSection: React.FC<ServicesSectionProps> = ({
  title,
  services,
}) => {
  const { theme } = useTheme();
  const t = useTranslations('ServicesSection');
  const sectionRef = useRef<HTMLElement>(null);
  const { trackEvent } = useHomeTracking('ServicesSection');

  const handleServiceSelect = (service: Service) => {
    trackEvent('serviceInteraction', {
      action: 'select',
      serviceId: service.id,
      serviceTitle: t(`services.${service.titleKey}.title`),
      category: service.category,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 rounded-lg shadow-lg ${
                theme === 'dark' ? 'bg-gray-800 bg-opacity-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center mb-4">
                <DynamicIcon
                  icon={service.icon}
                  className={`mr-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />
                <h3
                  className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {service.title}
                </h3>
              </div>
              <p
                className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {service.description}
              </p>
              {service.price && (
                <div
                  className={`mt-4 font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {service.price}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
