// src/components/dashboard/AbandonedCartModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, Clock, Tag, ShoppingCart, Percent } from 'lucide-react';

interface AbandonedOrderData {
  orderId: string;
  orderNumber: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  currency: string;
  itemsCount: number;
  items: Array<{
    topic: string;
    length: number;
    contentType: string;
  }>;
  expiresAt: string;
}

interface AbandonedCartModalProps {
  onClose: () => void;
  analyticalSessionId?: string;
  forceLoad?: boolean;
}

export default function AbandonedCartModal({
  onClose,
  analyticalSessionId,
  forceLoad = false,
}: AbandonedCartModalProps) {
  const t = useTranslations('abandonedCart.modal');
  const router = useRouter();

  const [orderData, setOrderData] = useState<AbandonedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [error, setError] = useState<string | null>(null);

  const fetchAbandonedOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onClose();
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/abandoned-cart/check${forceLoad ? '?force=true' : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ [AbandonedCart] Response NOT OK:', errorText);
        setError(`API Error: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setOrderData(data.data);
        const expiresAt = new Date(data.data.expiresAt).getTime();
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(secondsLeft);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('💥 [AbandonedCart] Fetch error:', err);
      setError(
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  }, [onClose, forceLoad]);

  useEffect(() => {
    fetchAbandonedOrder();
  }, [fetchAbandonedOrder]);

  useEffect(() => {
    if (!orderData) return;
    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onClose, orderData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyDiscount = async () => {
    if (!orderData) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/abandoned-cart/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            analyticalSessionId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.paidFromBalance) {
          router.push('/dashboard?payment_success=true&from_balance=true');
          onClose();
        } else if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      } else {
        setError(data.message || t('error'));
      }
    } catch (err) {
      console.error('Error applying discount:', err);
      setError(t('error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async () => {
    if (orderData) {
      try {
        const token = localStorage.getItem('token');
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/abandoned-cart/dismiss`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: orderData.orderId,
            }),
          }
        );
      } catch (err) {
        console.error('Error dismissing order:', err);
      }
    }

    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    window.dispatchEvent(new CustomEvent('abandonedCartDismissed'));
    onClose();
  };

  const formatPrice = (price: number, currency: string) => {
    return currency === 'PLN'
      ? `${price.toFixed(2)} zł`
      : `$${price.toFixed(2)}`;
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              {t('loading')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error && !orderData) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            {t('error')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            {t('errorDetails')}
          </p>
          <button
            onClick={handleDismiss}
            className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) return null;

  const savings = orderData.originalPrice - orderData.discountedPrice;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{t('title')}</h2>
          </div>
          <p className="text-white/90 text-lg">{t('subtitle')}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Timer */}
          <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border-2 border-amber-200 dark:border-amber-700">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div className="text-center">
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                {t('expiresIn')}
              </span>
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 ml-2 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Podsumowanie cen */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <span>{t('originalPrice')}</span>
                <span className="line-through text-lg">
                  {formatPrice(orderData.originalPrice, orderData.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <Tag className="w-4 h-4" />
                  {t('savings')}
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                  -{formatPrice(savings, orderData.currency)} (-
                  {orderData.discount}%)
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('discountedPrice')}
                  </span>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(orderData.discountedPrice, orderData.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info o zamówieniu */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('itemsCount', { count: orderData.itemsCount })}
              </span>
            </div>
            {orderData.items.slice(0, 2).map((item, idx) => (
              <p
                key={idx}
                className="text-sm text-gray-500 dark:text-gray-400 truncate pl-6"
              >
                • {item.topic}
              </p>
            ))}
            {orderData.items.length > 2 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 pl-6">
                {t('moreItems', { count: orderData.items.length - 2 })}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleApplyDiscount}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-lg"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('processing')}
                </span>
              ) : (
                t('acceptButton')
              )}
            </button>

            <button
              onClick={handleDismiss}
              disabled={processing}
              className="w-full py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              {t('dismissButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
