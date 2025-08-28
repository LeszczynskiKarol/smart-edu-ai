// src/components/PriceDisplay.tsx
import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../hooks/useExchangeRate';
import { MinimalPaymentTooltip } from './MinimalPaymentTooltip';
import { usePriceCalculation } from '../hooks/usePriceCalculation';
import { ContentSummary } from './dashboard/ContentSummary';

interface PriceDisplayProps {
  price: number;
  theme: string;
  locale: string;
  showMinPaymentInfo?: boolean;
  contentType?: string;
}

export const PriceDisplay = memo(
  ({
    price,
    theme,
    locale,
    showMinPaymentInfo = true,
    contentType = '',
  }: PriceDisplayProps) => {
    const { shouldShowMinPayment, minPaymentAmount, remainingBalance } =
      usePriceCalculation(locale, price);
    const t = useTranslations('dashboard');

    const shouldDisplay = showMinPaymentInfo && shouldShowMinPayment;
    const isSpecialContentType =
      contentType === 'licencjacka' || contentType === 'magisterska';

    return (
      <div
        className={`relative flex flex-col p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
      >
        <div className="flex flex-col items-end">
          <div className="flex items-center justify-between w-full mb-1">
            <span
              className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {t('pricing.textPrice')}
            </span>
            <span
              className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
            >
              {formatCurrency(price || 0, locale, false)}
            </span>
          </div>
        </div>

        {isSpecialContentType && (
          <ContentSummary contentType={contentType} theme={theme} />
        )}
      </div>
    );
  }
);

PriceDisplay.displayName = 'PriceDisplay';
