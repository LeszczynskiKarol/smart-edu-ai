// src/hooks/useOrderStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { Order, OrderItem } from '../types/order';

interface UseOrderStatusReturn {
  activeOrders: Order[];
  visibleOrders: string[];
  isPolling: boolean;
  error: Error | null;
  startPolling: () => void;
  hideOrderItem: (orderId: string, itemId: string) => Promise<void>;
  stopPolling: () => void;
  closeOrder: (orderId: string) => void;
  setOrders: (orders: Order[]) => void;
  refreshOrders: () => Promise<void>;
}

interface ApiResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

export const useOrderStatus = (
  initialOrders: Order[] = []
): UseOrderStatusReturn => {
  const [activeOrders, setActiveOrders] = useState<Order[]>(initialOrders);
  const [visibleOrders, setVisibleOrders] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('visibleOrders');
      return new Set(
        stored ? JSON.parse(stored) : initialOrders.map((order) => order._id)
      );
    } catch {
      return new Set(initialOrders.map((order) => order._id));
    }
  });
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastPollTime, setLastPollTime] = useState(0);

  // DODANE: Dynamiczny interval pollingu
  const [currentPollingInterval, setCurrentPollingInterval] = useState(10000);
  const FAST_POLLING = 3000; // Dla zamówień w trakcie
  const SLOW_POLLING = 10000; // Dla zakończonych
  const POLLING_COOLDOWN = 2000;

  const setOrders = useCallback((orders: Order[]) => {
    setActiveOrders(orders);
  }, []);

  const fetchOrders = useCallback(async () => {
    const now = Date.now();
    if (now - lastPollTime < POLLING_COOLDOWN) {
      return;
    }
    setLastPollTime(now);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: ApiResponse = await response.json();

      if (data?.data) {
        const filteredOrders = data.data
          .map((order: Order) => {
            const filteredItems = order.items.filter((item: OrderItem) => {
              const isHidden =
                localStorage.getItem(`order-item-${item._id}-hidden`) ===
                'true';
              const isInProgress = item.status === 'w trakcie';
              const isRecentlyCompleted =
                item.status === 'zakończone' &&
                (new Date(order.createdAt).getTime() >
                  Date.now() - 5 * 60 * 1000 ||
                  ((order as any).updatedAt &&
                    new Date((order as any).updatedAt).getTime() >
                      Date.now() - 5 * 60 * 1000));

              return !isHidden && (isInProgress || isRecentlyCompleted);
            });

            return {
              ...order,
              items: filteredItems,
            };
          })
          .filter((order: Order) => order.items.length > 0);

        setActiveOrders(filteredOrders);

        // DODANE: Ustaw szybszy polling jeśli są zamówienia w trakcie
        const hasInProgressItems = filteredOrders.some((order: Order) =>
          order.items.some((item: OrderItem) => item.status === 'w trakcie')
        );
        setCurrentPollingInterval(
          hasInProgressItems ? FAST_POLLING : SLOW_POLLING
        );

        const newVisible: Set<string> = new Set(
          filteredOrders.map((order: Order) => order._id)
        );

        if (!setsAreEqual(visibleOrders, newVisible)) {
          setVisibleOrders(newVisible);
          sessionStorage.setItem(
            'visibleOrders',
            JSON.stringify(Array.from(newVisible))
          );
        }
      }
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError(
        err instanceof Error ? err : new Error('Unknown error occurred')
      );
      stopPolling();
    }
  }, [lastPollTime, visibleOrders]);

  const setsAreEqual = (a: Set<string>, b: Set<string>): boolean => {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  };

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const closeOrder = useCallback((orderId: string) => {
    localStorage.setItem(`order-${orderId}-hidden`, 'true');
    setVisibleOrders((prev) => {
      const newVisible = new Set(prev);
      newVisible.delete(orderId);
      sessionStorage.setItem(
        'visibleOrders',
        JSON.stringify(Array.from(newVisible))
      );
      return newVisible;
    });
    setActiveOrders((prev) => prev.filter((order) => order._id !== orderId));
  }, []);

  const refreshOrders = useCallback(() => fetchOrders(), [fetchOrders]);

  // ZMIENIONE: Używa dynamicznego intervalu
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPolling) {
      fetchOrders();
      intervalId = setInterval(fetchOrders, currentPollingInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, fetchOrders, currentPollingInterval]);

  // ZACHOWANE: Automatyczne start/stop pollingu
  useEffect(() => {
    const hasInProgressOrders = activeOrders.some((order) =>
      order.items.some((item) => item.status === 'w trakcie')
    );

    if (hasInProgressOrders && !isPolling) {
      startPolling();
    } else if (!hasInProgressOrders && isPolling) {
      stopPolling();
    }
  }, [activeOrders, isPolling, startPolling, stopPolling]);

  // ZACHOWANE: Początkowe fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  const hideOrderItem = useCallback(
    async (orderId: string, itemId: string) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        localStorage.setItem(`order-item-${itemId}-hidden`, 'true');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/items/${itemId}/hide`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Hide item error:', errorData);
          throw new Error(errorData.message || 'Failed to hide item');
        }

        await fetchOrders();
        localStorage.removeItem(`order-item-${itemId}-hidden`);
      } catch (error) {
        console.error('Error hiding order item:', error);
      }
    },
    [fetchOrders]
  );

  return {
    activeOrders,
    visibleOrders: Array.from(visibleOrders),
    isPolling,
    error,
    startPolling,
    stopPolling,
    closeOrder,
    refreshOrders,
    hideOrderItem,
    setOrders,
  };
};
