// src/app/[locale]/dashboard/orders/page.tsx
'use client';
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SuccessModalHandler from '../../../../components/SuccessModalHandler';
import SuccessModal from '../../../../components/modals/SuccessModal';
import { NextIntlClientProvider, useLocale } from 'next-intl';
import defaultMessages from '../../../../messages/pl.json';
import { TranslationMessages } from '../../../../types/translations';
import { useAnalytics } from '@/context/AnalyticsContext';



const getTranslationMessages = async (locale: string): Promise<TranslationMessages> => {
  try {
    const messages = (await import(`../../../../messages/${locale}.json`)).default;

    const transformedMessages = {
      ...messages,
      orderHistory: messages.orderHistory || defaultMessages.orderHistory
    };

    return transformedMessages as unknown as TranslationMessages;
  } catch (error) {
    console.error(`Error loading translations for locale: ${locale}, falling back to default`, error);
    return defaultMessages as unknown as TranslationMessages;
  }
};



interface OrderHistoryProps {
  onOrderSuccess: (details: {
    orderNumber: string;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  }) => void;
  locale: string;
  messages: TranslationMessages;
}

const OrderHistory = dynamic<OrderHistoryProps>(
  () => import('../../../../components/dashboard/OrderHistory').then(mod => mod.default),
  {
    loading: () => <Loader />,
    ssr: false
  }
);



const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function OrdersPage() {
  const { trackEvent } = useAnalytics();
  const pageViewTracked = useRef(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const [messages, setMessages] = useState<TranslationMessages | null>(null);
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    totalPrice: 0,
    discount: 0,
    itemsCount: 0,
    sessionId: ''
  });
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pageViewTracked.current) {
      trackEvent('pageView', {
        component: 'OrdersHistory',
        action: 'view',
        path: '/dashboard/orders'
      });
      pageViewTracked.current = true;
    }
  }, [trackEvent]);


  useEffect(() => {
    const loadMessages = async () => {

      try {
        setIsLoading(true);
        const msgs = await getTranslationMessages(locale);

        setMessages(msgs as unknown as TranslationMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages(defaultMessages as unknown as TranslationMessages);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [locale]);



  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');

    if (sessionId) {
      fetchOrderDetails(sessionId);
    } else if (success === 'true') {
      const orderNumber = searchParams.get('orderNumber');
      const totalPrice = searchParams.get('totalPrice');
      const discount = searchParams.get('discount');
      const itemsCount = searchParams.get('itemsCount');

      if (orderNumber && totalPrice && discount && itemsCount) {
        setOrderDetails({
          orderNumber,
          totalPrice: parseFloat(totalPrice),
          discount: parseFloat(discount),
          itemsCount: parseInt(itemsCount, 10),
          sessionId: sessionId || ''
        });
        setIsSuccessModalOpen(true);
      }
    }

  }, [searchParams]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      // Najpierw pobierz token
      const tokenResponse = await fetch(`/api/stripe/session-token/${sessionId}`);
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.success && tokenData.token) {
          localStorage.setItem('token', tokenData.token);

          const response = await fetch(`/api/stripe/session/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${tokenData.token}`
            }
          });

          if (response.ok) {
            const data = await response.json();


            if (data && data.order) {
              setOrderDetails({
                orderNumber: data.order.orderNumber,
                totalPrice: parseFloat(data.order.totalPrice) || 0,
                discount: parseFloat(data.order.appliedDiscount) || 0,
                itemsCount: (data.order.items || []).length,
                sessionId: sessionId
              });
              setIsSuccessModalOpen(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
    setShowToast(true);
  };

  const handleOrderSuccess = (details: {
    orderNumber: string;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  }) => {

  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Suspense fallback={<Loader />}>
        {messages && (
          <NextIntlClientProvider locale={locale} messages={messages || defaultMessages}>
            <OrderHistory
              onOrderSuccess={handleOrderSuccess}
              locale={locale}
              messages={messages || defaultMessages}
            />
            <SuccessModalHandler />

          </NextIntlClientProvider>
        )}

      </Suspense>

    </div>
  );
}    