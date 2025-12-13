// src/components/dashboard/AbandonedCartBanner.tsx
'use client';

import { ChevronRight, Clock, Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface AbandonedCartBannerProps {
  onOpenModal: () => void;
}

interface BannerData {
  orderId: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  currency: string;
  itemsCount: number;
  expiresAt: string;
}

export default function AbandonedCartBanner({
  onOpenModal,
}: AbandonedCartBannerProps) {
  const t = useTranslations('abandonedCart.banner');
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const checkForAbandonedOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/abandoned-cart/check`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        // Oblicz pozostały czas
        const expiresAt = new Date(data.data.expiresAt).getTime();
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

        // Jeśli czas już minął, nie pokazuj banera
        if (secondsLeft <= 0) {
          setIsVisible(false);
          return;
        }

        setBannerData(data.data);
        setTimeLeft(secondsLeft);

        if (data.dismissed && data.canReactivate) {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking abandoned order:', error);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsVisible(false); // Ukryj baner gdy czas minie
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeLeft]);

  useEffect(() => {
    const handleDismissed = () => {
      checkForAbandonedOrder();
    };

    window.addEventListener('abandonedCartDismissed', handleDismissed);
    return () =>
      window.removeEventListener('abandonedCartDismissed', handleDismissed);
  }, [checkForAbandonedOrder]);

  useEffect(() => {
    if (sessionStorage.getItem('abandonedCartBannerDismissed')) {
      setIsVisible(false);
    }
  }, []);

  const handleOpenModal = () => {
    setIsVisible(false);
    onOpenModal();
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('abandonedCartBannerDismissed', 'true');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !bannerData || isDismissed) return null;

  const formatPrice = (price: number, currency: string) => {
    return currency === 'PLN'
      ? `${price.toFixed(2)} zł`
      : `$${price.toFixed(2)}`;
  };

  const savings = bannerData.originalPrice - bannerData.discountedPrice;

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-lg">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{t('title')}</p>
            <p className="text-sm text-white/80">
              {t('savings', {
                amount: formatPrice(savings, bannerData.currency),
              })}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-white font-mono font-bold text-lg">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            {t('viewOffer')}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleDismissBanner}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
