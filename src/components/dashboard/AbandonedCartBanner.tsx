// src/components/dashboard/AbandonedCartBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tag, X, ChevronRight } from 'lucide-react';

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
}

export default function AbandonedCartBanner({
  onOpenModal,
}: AbandonedCartBannerProps) {
  const t = useTranslations('abandonedCart.banner');
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkForAbandonedOrder = async () => {
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
        setBannerData(data.data);
        if (data.dismissed && data.canReactivate) {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking abandoned order:', error);
    }
  };

  useEffect(() => {
    const handleDismissed = () => {
      checkForAbandonedOrder();
    };

    window.addEventListener('abandonedCartDismissed', handleDismissed);
    return () =>
      window.removeEventListener('abandonedCartDismissed', handleDismissed);
  }, []);

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

  if (!isVisible || !bannerData || isDismissed) return null;

  const formatPrice = (price: number, currency: string) => {
    return currency === 'PLN'
      ? `${price.toFixed(2)} zł`
      : `$${price.toFixed(2)}`;
  };

  const savings = bannerData.originalPrice - bannerData.discountedPrice;

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
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
