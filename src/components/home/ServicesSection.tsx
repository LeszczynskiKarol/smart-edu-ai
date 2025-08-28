// src/components/home/ServicesSection.tsx

'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
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

const ServicesSection: React.FC = () => {
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

  const services: Service[] = [
    {
      id: '1',
      titleKey: 'articles',
      descriptionKey: 'articles',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      category: 'content',
    },

    {
      id: '2',
      titleKey: 'descriptions',
      descriptionKey: 'descriptions',
      icon: <ShoppingBagIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '3',
      titleKey: 'category',
      descriptionKey: 'category',
      icon: <FolderIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '4',
      titleKey: 'business',
      descriptionKey: 'business',
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '5',
      titleKey: 'social',
      descriptionKey: 'social',
      icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '6',
      titleKey: 'reports',
      descriptionKey: 'reports',
      icon: <ChartBarIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '7',
      titleKey: 'emails',
      descriptionKey: 'emails',
      icon: <EnvelopeIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '8',
      titleKey: 'landing',
      descriptionKey: 'landing',
      icon: <GlobeAltIcon className="h-6 w-6" />,
      category: 'content',
    },
    {
      id: '9',
      titleKey: 'pr',
      descriptionKey: 'pr',
      icon: <NewspaperIcon className="h-6 w-6" />,
      category: 'content',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 
                               ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('title')}
        </motion.h2>

        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ServiceCard
                  service={service} /*onSelect={handleServiceSelect}*/
                />
              </motion.div>
            ))}
          </motion.div>
          <div className="flex flex-col items-center">
            <Link href="/examples">
              <button className="mt-10 px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700">
                {t('footer')}
              </button>
            </Link>
          </div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServicesSection;
