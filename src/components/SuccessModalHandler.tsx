// src/components/SuccessModalHandler.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderSuccessModal from '@/components/OrderSuccessModal';

interface OrderItem {
  _id: string;
  topic: string;
  length: number;
  contentType: string;
  price: number;
}

interface OrderDetails {
  orderNumber?: string;
  items: OrderItem[];
  totalPrice: number;
}

const SuccessModalHandler = () => {
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSuccessState = async () => {
      const sessionId = searchParams.get('session_id');
      const success = searchParams.get('success');

      if (sessionId) {
        try {
          // Najpierw pobieramy token
          const tokenResponse = await fetch(
            `/api/stripe/session-token/${sessionId}`
          );
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.success && tokenData.token) {
              localStorage.setItem('token', tokenData.token);

              // Następnie pobieramy detale zamówienia
              const orderResponse = await fetch(
                `/api/stripe/session/${sessionId}`,
                {
                  headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                  },
                }
              );

              if (orderResponse.ok) {
                const data = await orderResponse.json();

                if (data && data.order) {
                  setOrderDetails({
                    orderNumber:
                      data.order.orderNumber?.toString() || sessionId,
                    items: (data.order.items || []).map((item: any) => ({
                      _id: item._id || `temp-${Date.now()}`,
                      topic: item.topic || item.guidelines || 'Zamówiony tekst',
                      length: parseInt(item.length) || 0,
                      contentType: item.contentType || 'article',
                      price: parseFloat(item.price) || 0,
                    })),
                    totalPrice: parseFloat(data.order.totalPrice) || 0,
                  });

                  setShowModal(true);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error handling session:', error);
        }
      } else if (success === 'true') {
        const orderNumber = searchParams.get('orderNumber');
        const totalPrice = searchParams.get('totalPrice');
        const itemsCount = searchParams.get('itemsCount');

        if (orderNumber && totalPrice && itemsCount) {
          const itemPrice = parseFloat(totalPrice) / parseInt(itemsCount);
          const items = Array(parseInt(itemsCount))
            .fill(null)
            .map(() => ({
              _id: `temp-${Date.now()}-${Math.random()}`,
              topic: 'Zamówiony tekst',
              length: 0,
              contentType: 'article',
              price: itemPrice,
            }));

          const details = {
            orderNumber,
            items,
            totalPrice: parseFloat(totalPrice),
          };

          setOrderDetails(details);
          setShowModal(true);
        }
      }
    };

    handleSuccessState();
  }, [searchParams]);

  if (!orderDetails) {
    return null;
  }

  return (
    <OrderSuccessModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      orderDetails={orderDetails}
    />
  );
};

export default SuccessModalHandler;
