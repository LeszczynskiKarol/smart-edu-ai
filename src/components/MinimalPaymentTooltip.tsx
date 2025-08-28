// src/components/MinimalPaymentTooltip.tsx
import React, { memo } from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../hooks/useExchangeRate';

interface MinimalPaymentTooltipProps {
    theme: string;
    minPaymentAmount: number;
    remainingBalance: number;
    locale: string;
}

export const MinimalPaymentTooltip = memo(({
    theme,
    minPaymentAmount,
    remainingBalance,
    locale
}: MinimalPaymentTooltipProps) => {
    const t = useTranslations('dashboard');

    return (
        <div className="relative inline-block ml-1 group">
            <div className="cursor-help">
                <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-600" />
            </div>
            <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-sm rounded-lg z-50 transition-all duration-200">
                {t('pricing.minimalPaymentTooltip', {
                    paymentAmount: formatCurrency(minPaymentAmount, locale),
                    remainingBalance: formatCurrency(remainingBalance, locale)
                })}
            </div>
        </div>
    );
});

MinimalPaymentTooltip.displayName = 'MinimalPaymentTooltip';
