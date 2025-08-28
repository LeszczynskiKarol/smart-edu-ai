// src/components/TotalPriceDisplay.tsx
import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../hooks/useExchangeRate';
import { MinimalPaymentTooltip } from './MinimalPaymentTooltip';
import { usePriceCalculation } from '../hooks/usePriceCalculation';

interface TotalPriceDisplayProps {
  totalPrice: number;
  theme: string;
  locale: string;
}

export const TotalPriceDisplay = memo(
  ({ totalPrice, theme, locale }: TotalPriceDisplayProps) => {
    const { shouldShowMinPayment, minPaymentAmount, remainingBalance } =
      usePriceCalculation(locale, totalPrice);
    const t = useTranslations('dashboard');

    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {t('totalPrice')}
          </span>
          <span
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
          >
            {formatCurrency(totalPrice || 0, locale)}
          </span>
        </div>
      </div>
    );
  }
);

TotalPriceDisplay.displayName = 'TotalPriceDisplay';
