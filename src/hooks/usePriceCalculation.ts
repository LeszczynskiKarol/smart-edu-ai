// src/hooks/usePriceCalculation.ts
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';

export const usePriceCalculation = (locale: string, price: number) => {
  const { user } = useAuth();
  const { rate } = useExchangeRate();
  const isUSD = locale === 'en';

  const minPaymentAmount = isUSD ? 5 : 20;
  const userBalance = user?.accountBalance || 0;

  return useMemo(() => {
    const userBalanceInCurrency = isUSD
      ? userBalance
      : userBalance * (rate || 1);
    const requiredPayment = Math.max(0, price - userBalanceInCurrency);
    const remainingBalance = minPaymentAmount - requiredPayment;
    const shouldShowMinPayment =
      requiredPayment > 0 && requiredPayment < minPaymentAmount;

    return {
      requiredPayment,
      remainingBalance,
      shouldShowMinPayment,
      minPaymentAmount,
      isUSD,
    };
  }, [price, userBalance, rate, isUSD, minPaymentAmount]);
};
