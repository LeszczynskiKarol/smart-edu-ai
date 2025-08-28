// src/components/dashboard/TopUpModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoader } from '../../context/LoaderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useExchangeRate, formatCurrency } from '../../hooks/useExchangeRate';
import { useAnalytics } from '@/context/AnalyticsContext';

const MIN_AMOUNT_PLN = 20;
const MIN_AMOUNT_USD = 5;

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('topUpModal');
  const locale = useLocale();
  const [discount, setDiscount] = useState(0);
  const { showLoader, hideLoader } = useLoader();
  const { user } = useAuth();
  const { trackEvent, getSessionId } = useAnalytics();
  const { rate, loading: rateLoading } = useExchangeRate();
  const isUSD = locale === 'en';
  const [error, setError] = useState<string | null>(null);

  const getMinAmount = () => {
    return isUSD ? MIN_AMOUNT_USD : MIN_AMOUNT_PLN;
  };

  const formatAmount = (value: number): string => {
    return value.toFixed(2).replace('.', isUSD ? '.' : ',');
  };
  const [amount, setAmount] = useState(() => formatAmount(getMinAmount()));

  const handleAmountChange = (value: string) => {
    const cleanedValue = value.replace(/[^\d.,]/g, '');
    const parts = cleanedValue.split(isUSD ? '.' : ',');
    if (parts.length > 2) {
      parts[1] = parts.slice(1).join('');
      setAmount(parts.join(isUSD ? '.' : ','));
    } else {
      setAmount(cleanedValue);
    }
  };

  const parseAmount = (value: string): number => {
    return parseFloat(value.replace(',', '.')) || 0;
  };

  const getDiscountThresholds = () => {
    if (isUSD) {
      return {
        threshold1: 50, // 50 USD dla 10% rabatu
        threshold2: 125, // 125 USD dla 20% rabatu
      };
    }
    return {
      threshold1: 200, // 200 PLN dla 10% rabatu
      threshold2: 500, // 500 PLN dla 20% rabatu
    };
  };

  useEffect(() => {
    const { threshold1, threshold2 } = getDiscountThresholds();
    const amountNum = parseAmount(amount);
    if (amountNum >= threshold2) {
      setDiscount(20);
    } else if (amountNum >= threshold1) {
      setDiscount(10);
    } else {
      setDiscount(0);
    }
  }, [amount, rate]);

  const calculateDiscountedAmount = () => {
    const amountNum = parseAmount(amount);
    const appliedDiscount = Math.max(discount || 0);
    return amountNum * (1 - appliedDiscount / 100);
  };

  const handleBlur = () => {
    const numValue = parseFloat(amount.replace(',', '.'));
    if (!isNaN(numValue)) {
      setAmount(formatAmount(numValue));
    }
  };

  const handleIncrement = () => {
    const currentAmount = parseFloat(amount.replace(',', '.')) || 0;
    setAmount(formatAmount(currentAmount + 10));
  };

  const handleDecrement = () => {
    const currentAmount = parseFloat(amount.replace(',', '.')) || 0;
    const minAmount = getMinAmount();
    if (currentAmount > minAmount) {
      setAmount(formatAmount(Math.max(minAmount, currentAmount - 10)));
    }
  };

  const getDiscountMessage = () => {
    const { threshold1, threshold2 } = getDiscountThresholds();
    const amountNum = parseAmount(amount);
    if (amountNum < threshold1) {
      const remainingTo10Percent = threshold1 - amountNum;
      return t('discountRemaining.to10Percent', {
        amount: formatCurrency(remainingTo10Percent, locale),
      });
    } else if (amountNum < threshold2) {
      const remainingTo20Percent = threshold2 - amountNum;
      return t('discountRemaining.to20Percent', {
        amount: formatCurrency(remainingTo20Percent, locale),
      });
    }
    return null;
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const currentSessionId = getSessionId();

    trackEvent('click', {
      component: 'TopUpModal',
      action: 'topup_button_click',
      metadata: {
        amount: amount,
        currency: isUSD ? 'USD' : 'PLN',
        discountApplied: discount,
        finalAmount: calculateDiscountedAmount(),
        firstReferrer:
          document.referrer || sessionStorage.getItem('firstReferrer'),
        originalReferrer: sessionStorage.getItem('originalReferrer'),
      },
    });

    const originalAmount = parseAmount(amount);
    const minAmount = getMinAmount();

    if (originalAmount < minAmount) {
      setError(
        t('errors.minimumAmount', {
          amount: formatCurrency(minAmount, locale),
        })
      );
      return;
    }

    showLoader();

    const firstReferrer = sessionStorage.getItem('firstReferrer');
    const originalReferrer = sessionStorage.getItem('originalReferrer');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/top-up`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            originalAmount: originalAmount, // pełna kwota
            discountedAmount: calculateDiscountedAmount(), // kwota po rabacie
            appliedDiscount: discount,
            currency: isUSD ? 'USD' : 'PLN',
            analyticalSessionId: currentSessionId,
            firstReferrer: firstReferrer,
            originalReferrer: originalReferrer,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('top_up_currency', isUSD ? 'USD' : 'PLN');

        trackEvent('payment', {
          action: 'payment_pending',
          component: 'TopUpModal',
          metadata: {
            amount: originalAmount,
            currency: isUSD ? 'USD' : 'PLN',
            discountApplied: discount,
            conversionType: 'top_up',
          },
        });

        window.gtag('event', 'begin_checkout', {
          value: parseFloat(amount),
          currency: isUSD ? 'USD' : 'PLN',
          items: [
            {
              item_name: isUSD ? 'Account Top-up' : 'Doładowanie konta',
              value: parseFloat(amount),
            },
          ],
        });

        localStorage.setItem(
          'auth_token_temp',
          localStorage.getItem('token') || ''
        );
        localStorage.setItem('analytical_session_id', currentSessionId);
        localStorage.setItem('payment_pending', 'true');
        window.location.href = data.paymentUrl;
      } else {
        setError(data.message || t('errors.general'));
      }
    } catch (error) {
      console.error('Error during top-up:', error);
      setError(t('errors.tryAgain'));
    } finally {
      hideLoader();
    }
  };

  if (!isOpen) return null;

  const showDiscountMessage = parseFloat(amount) > 0;
  const appliedDiscount = Math.max(discount || 0);
  const discountMessage = getDiscountMessage();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalVariants}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              {t('title')}
            </h2>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              {t('description')}
            </p>
            <p className="mb-4 text-sm text-blue-600 dark:text-blue-400">
              {t('minimumAmount', {
                amount: formatCurrency(getMinAmount(), locale),
              })}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900"
              >
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleTopUp}>
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('form.amountLabel')}
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-l hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onBlur={handleBlur}
                    className="flex-grow p-2 border-t border-b border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-center appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showDiscountMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 p-2 rounded bg-green-100 dark:bg-green-800"
                  >
                    {parseAmount(amount) < getMinAmount() && (
                      <p className="text-red-600 dark:text-red-400 mb-2">
                        {t('errors.belowMinimum', {
                          amount: formatCurrency(getMinAmount(), locale),
                        })}
                      </p>
                    )}
                    <p className="text-green-700 dark:text-green-300">
                      {t('summary.topUpAmount')}:{' '}
                      {formatCurrency(parseFloat(amount), locale)}
                    </p>
                    {appliedDiscount > 0 ? (
                      <p className="text-green-700 dark:text-green-300">
                        {t('summary.withDiscount', {
                          discount: appliedDiscount,
                          amount: formatCurrency(
                            calculateDiscountedAmount(),
                            locale
                          ),
                        })}
                      </p>
                    ) : (
                      <p className="text-green-700 dark:text-green-300">
                        {t('summary.finalAmount')}:{' '}
                        {formatCurrency(parseFloat(amount), locale)}
                      </p>
                    )}
                    {discountMessage && (
                      <p className="text-blue-700 dark:text-blue-300 mt-2">
                        {discountMessage}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={parseAmount(amount) < getMinAmount()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('buttons.topUp')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopUpModal;
