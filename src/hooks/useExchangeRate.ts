// src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react';

export const useExchangeRate = () => {
  const [rate, setRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(
          'https://api.nbp.pl/api/exchangerates/rates/A/USD/'
        );
        const data = await response.json();
        setRate(data.rates[0].mid);
        setLoading(false);
      } catch (err) {
        setError('Error fetching exchange rate');
        // Fallback do stałego kursu w przypadku błędu
        setRate(4.0);
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  return { rate, loading, error };
};

// Utility functions for currency conversion
export const convertPLNtoUSD = (amountPLN: number, rate: number): number => {
  return Number((amountPLN / rate).toFixed(2));
};

export const convertUSDtoPLN = (amountUSD: number, rate: number): number => {
  return Number((amountUSD * rate).toFixed(2));
};

export const formatCurrency = (
  amount: number,
  locale: string,
  showDecimals = true
): string => {
  const currency = locale === 'en' ? 'USD' : 'PLN';
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pl-PL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

export const formatBalance = (
  amount: number,
  locale: string,
  rate: number
): string => {
  // Zawsze przechowujemy saldo w USD, więc:
  if (locale === 'en') {
    // Dla EN pokazujemy oryginalną kwotę USD
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    // Dla PL przeliczamy USD na PLN i formatujemy
    const amountInPLN = amount * rate;
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInPLN);
  }
};
