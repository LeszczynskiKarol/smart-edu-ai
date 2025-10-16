// src/components/OrderStatusItem.tsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { OrderItem } from '../types/order';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { useTracking } from '@/hooks/useTracking';

interface OrderStatusItemProps {
  item: OrderItem;
  orderNumber: string;
  orderId: string;
  isExpanded: boolean;
  progress: number;
  isCompleted: boolean;
  onToggle: () => void;
  onHide: (orderId: string, itemId: string) => void;
  timeRemaining?: string;
}

const OrderStatusItem: React.FC<OrderStatusItemProps> = ({
  item,
  orderNumber,
  orderId,
  isExpanded,
  progress,
  onToggle,
  onHide,
  timeRemaining,
}) => {
  const t = useTranslations('orderStatus');
  const isCompleted = item.status === 'zakończone';
  const [isHidden, setIsHidden] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [progressColor, setProgressColor] = useState('text-gray-600');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const { theme } = useTheme();
  const { trackInteraction } = useTracking('OrderStatusItem');

  const getCustomEstimatedCompletionTime = (item: OrderItem) => {
    if (!item.startTime) return item.estimatedCompletionTime;

    const startTime = new Date(item.startTime);

    if (item.contentType.toLowerCase().includes('magister')) {
      // 90 minut dla prac magisterskich
      return new Date(startTime.getTime() + 90 * 60 * 1000).toISOString();
    } else if (item.contentType.toLowerCase().includes('licenc')) {
      // 60 minut dla prac licencjackich - POPRAWIONE!
      return new Date(startTime.getTime() + 60 * 60 * 1000).toISOString();
    }

    return item.estimatedCompletionTime;
  };

  const handleHide = async () => {
    setIsHidden(true);
    await onHide(orderId, item._id);
  };

  // Efekt dla precyzyjnego odliczania czasu
  useEffect(() => {
    const customEstimatedTime = getCustomEstimatedCompletionTime(item);
    if (!customEstimatedTime || isCompleted) return;

    const calculateRemainingTime = () => {
      const end = new Date(customEstimatedTime).getTime();
      const now = Date.now();
      const diff = end - now;
      return Math.max(0, Math.floor(diff / 1000));
    };

    setRemainingSeconds(calculateRemainingTime());

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime();
      setRemainingSeconds(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [item, isCompleted]);

  // NAPRAWIONY efekt dla paska postępu - tylko na podstawie CZASU
  useEffect(() => {
    if (isCompleted) {
      setDisplayProgress(100);
      return;
    }

    const customEstimatedTime = getCustomEstimatedCompletionTime(item);
    if (!item.startTime || !customEstimatedTime) {
      setDisplayProgress(0);
      return;
    }

    const updateProgress = () => {
      const startTime = new Date(item.startTime!).getTime();
      const endTime = new Date(customEstimatedTime).getTime();
      const currentTime = Date.now();
      const totalDuration = endTime - startTime;
      const elapsedTime = currentTime - startTime;

      // Oblicz postęp na podstawie TYLKO czasu (0-98%)
      const calculatedProgress = (elapsedTime / totalDuration) * 98;

      // Ogranicz do max 98% (ostatnie 2% zostają dla statusu "zakończone")
      const finalProgress = Math.max(0, Math.min(98, calculatedProgress));

      setDisplayProgress(finalProgress);
    };

    // Aktualizuj co 100ms dla płynności
    const intervalId = setInterval(updateProgress, 100);
    updateProgress();

    return () => clearInterval(intervalId);
  }, [item, isCompleted]);

  // Formatowanie czasu w formacie M:SS
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return t('almostDone');
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isCompleted) {
      setProgressColor('text-green-500');
    } else if (displayProgress >= 98) {
      setProgressColor('text-blue-500');
    } else {
      setProgressColor('text-gray-600');
    }
  }, [displayProgress, isCompleted]);

  if (isHidden) return null;

  return (
    <motion.div
      layout
      className={`
                py-3 px-4
                transition-all 
                duration-500
                ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}
            `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex flex-col gap-3">
        {/* Nagłówek z ikoną statusu i tytułem */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {isCompleted ? (
                <CheckCircle2 className="text-green-500" size={20} />
              ) : (
                <Loader2 className="animate-spin text-blue-500" size={20} />
              )}
            </motion.div>
            <span className="font-medium truncate max-w-[180px]">
              {item.topic || t('untitledText')}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </motion.button>
        </div>

        {/* Rozwijane szczegóły */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-gray-800/50 dark:bg-gray-700 rounded-lg space-y-1.5 backdrop-blur-sm">
                {!item.contentType.toLowerCase().includes('licencja') &&
                  !item.contentType.toLowerCase().includes('magister') && (
                    <p className="text-sm text-gray-200 dark:text-gray-300">
                      {t('textLength')}: {item.length.toLocaleString()}{' '}
                      {t('characters')}
                    </p>
                  )}

                <p className="text-sm text-gray-200 dark:text-gray-300">
                  {t('language')}: {t(`languages.${item.language}`)}
                </p>
                <p className="text-sm text-gray-200 dark:text-gray-300">
                  {t('contentType')}: {t(`contentTypes.${item.contentType}`)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pasek postępu */}
        <div className="mt-2 relative">
          <motion.div className="flex justify-between items-center mb-1" layout>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-grow mr-3">
              <motion.div
                className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div
              className={`text-sm font-medium transition-colors duration-300 min-w-[45px] text-right ${progressColor}`}
            >
              {Math.round(displayProgress)}%
            </div>
          </motion.div>
        </div>

        {/* Status i przyciski akcji */}
        <div className="flex justify-between items-center">
          <span
            className={`text-sm font-medium ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}
          >
            {isCompleted
              ? t('completed')
              : formatTimeRemaining(remainingSeconds)}
          </span>
          {isCompleted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHide}
              className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full"
              title={t('hideItem')}
            >
              <X size={14} />
            </motion.button>
          )}
        </div>

        {/* Przycisk View */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Link
              href={`/dashboard/orders/${orderId}`}
              onClick={() => {
                trackInteraction('view_order_click', {
                  orderId,
                  itemId: item._id,
                  orderNumber,
                  itemStatus: item.status,
                });
              }}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span className="font-medium">{t('view')}</span>
              <ExternalLink size={18} />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderStatusItem;
