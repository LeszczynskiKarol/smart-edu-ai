// src/context/OrderContext.tsx
'use client'
import React, { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react';
import { Order } from '../types/order';

interface OrderContextType {
  activeOrders: Order[];
  setActiveOrders: (orders: Order[]) => void;
  visibleOrders: string[];
  setVisibleOrders: (orderIds: string[] | ((prev: string[]) => string[])) => void;
  addNewOrder: (order: Order) => void;
  refreshOrders: () => Promise<void>;
  closeOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within a OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [visibleOrders, setVisibleOrders] = useState<string[]>(() => {
    // Inicjalizacja visibleOrders z sessionStorage
    try {
      const storedVisibleOrders = sessionStorage.getItem('visibleOrders');
      return storedVisibleOrders ? JSON.parse(storedVisibleOrders) : [];
    } catch {
      return [];
    }
  });
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const POLLING_INTERVAL = 10000;
  const FETCH_COOLDOWN = 2000;

  // Funkcja pomocnicza do zapisywania completed orders w sessionStorage
  const saveCompletedOrderToSession = useCallback((order: Order) => {
    try {
      const storedOrders = sessionStorage.getItem('completedOrders');
      const completedOrders = storedOrders ? JSON.parse(storedOrders) : {};
      completedOrders[order._id] = order;
      sessionStorage.setItem('completedOrders', JSON.stringify(completedOrders));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, []);

  // Funkcja pomocnicza do pobierania completed orders z sessionStorage
  const getCompletedOrdersFromSession = useCallback(() => {
    try {
      const storedOrders = sessionStorage.getItem('completedOrders');
      return storedOrders ? JSON.parse(storedOrders) : {};
    } catch {
      return {};
    }
  }, []);

  const addNewOrder = useCallback((order: Order) => {
    setActiveOrders(prevOrders => {
      if (!prevOrders.some(o => o._id === order._id)) {
        return [...prevOrders, order];
      }
      return prevOrders;
    });
    setVisibleOrders(prevVisible => {
      const newVisibleOrders = prevVisible.includes(order._id)
        ? prevVisible
        : [...prevVisible, order._id];
      sessionStorage.setItem('visibleOrders', JSON.stringify(newVisibleOrders));
      return newVisibleOrders;
    });
  }, []);

  const closeOrder = useCallback((orderId: string) => {
    const isHidden = localStorage.getItem(`order-${orderId}-hidden`) === 'true';
    if (isHidden) {
      setVisibleOrders(prevVisible => {
        const newVisibleOrders = prevVisible.filter(id => id !== orderId);
        sessionStorage.setItem('visibleOrders', JSON.stringify(newVisibleOrders));
        return newVisibleOrders;
      });

      // Usuń również z sessionStorage completedOrders
      try {
        const completedOrders = getCompletedOrdersFromSession();
        delete completedOrders[orderId];
        sessionStorage.setItem('completedOrders', JSON.stringify(completedOrders));
      } catch (error) {
        console.error('Error removing from sessionStorage:', error);
      }
    }
  }, [getCompletedOrdersFromSession]);



  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < FETCH_COOLDOWN) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {

        return;
      }

      lastFetchRef.current = now;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          stopPolling();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data?.data) {
        // Pobieramy zapisane zakończone zamówienia
        const completedOrders = getCompletedOrdersFromSession();

        const filteredData = data.data.filter((order: Order) => {
          const isHidden = localStorage.getItem(`order-${order._id}-hidden`) === 'true';
          if (isHidden) return false;

          if (order.status === "w trakcie") return true;

          if (order.status === "zakończone") {
            // Zapisz zakończone zamówienie do sessionStorage
            saveCompletedOrderToSession({
              ...order,
              items: order.items.map(item => ({
                ...item,
                status: "zakończone"
              }))
            });
            return true;
          }

          return false;
        });

        // Dodaj zakończone zamówienia z sessionStorage do aktywnych zamówień
        const allOrders = [
          ...filteredData,
          ...Object.values(completedOrders)
        ];

        // Aktualizujemy stan tylko jeśli są rzeczywiste zmiany
        const ordersChanged = JSON.stringify(allOrders) !== JSON.stringify(activeOrders);
        if (ordersChanged) {
          setActiveOrders(allOrders);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Błąd podczas pobierania aktywnych zamówień:", error);
        if (error.message.includes('401')) {
          stopPolling();
        }
      } else {
        console.error("Wystąpił nieoczekiwany błąd:", error);
      }
    }
  }, [activeOrders, getCompletedOrdersFromSession, saveCompletedOrderToSession, stopPolling]);

  const startPolling = useCallback(() => {
    if (!isPolling && !intervalRef.current) {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      setIsPolling(true);
      refreshOrders();
      intervalRef.current = setInterval(refreshOrders, POLLING_INTERVAL);
    }
  }, [isPolling, refreshOrders]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const hasInProgressOrders = activeOrders.some(order =>
      order.status === "w trakcie" ||
      order.items.some(item => item.status === "w trakcie")
    );

    if (hasInProgressOrders && !isPolling) {
      startPolling();
    } else if (!hasInProgressOrders && isPolling) {
      stopPolling();
    }
  }, [activeOrders, isPolling, startPolling, stopPolling]);

  // Inicjalne pobranie zamówień
  useEffect(() => {
    refreshOrders();
  }, []);

  const value = {
    activeOrders,
    setActiveOrders,
    visibleOrders,
    setVisibleOrders,
    addNewOrder,
    refreshOrders,
    closeOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
