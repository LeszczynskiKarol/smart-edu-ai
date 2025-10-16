// src/components/OrderStatusBox.tsx
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { useOrderStatus } from '../hooks/useOrderStatus';
import OrderStatusItem from './OrderStatusItem';
import { useTranslations } from 'next-intl';
import { useTracking } from '@/hooks/useTracking';
import { Order, OrderItem } from '../types/order';
import { useTheme } from '../context/ThemeContext';
import OrderWorkCommencedModal from './OrderWorkCommencedModal';

interface OrderStatusBoxProps {
  orders: Order[];
  forceShow?: boolean;
}

const OrderStatusBox: React.FC<OrderStatusBoxProps> = ({
  orders,
  forceShow = false,
}) => {
  const { hideOrderItem, refreshOrders } = useOrderStatus();
  const { trackInteraction } = useTracking('OrderStatusBox');
  const [lastCompletedItems, setLastCompletedItems] = useState<Set<string>>(
    new Set()
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState<{
    estimatedTime: string;
    orderNumber: string;
  } | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = sessionStorage.getItem('orderStatusBoxCollapsed');
    return savedState ? savedState === 'true' : false;
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<{ [key: string]: number }>({});
  const { theme } = useTheme();
  const t = useTranslations('orderStatus');
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [userClosedManually, setUserClosedManually] = useState(() => {
    return sessionStorage.getItem('orderStatusBoxManualClose') === 'true';
  });

  const handleHideItem = async (orderId: string, itemId: string) => {
    await hideOrderItem(orderId, itemId);
    await refreshOrders();
  };

  const getEstimatedTimeText = (items: OrderItem[]) => {
    const maxTime = Math.max(
      ...items.map((item) => {
        if (item.contentType.toLowerCase().includes('magister')) return 90;
        if (item.contentType.toLowerCase().includes('licenc')) return 60;
        return 30;
      })
    );

    if (maxTime >= 60) {
      const hours = Math.floor(maxTime / 60);
      const mins = maxTime % 60;
      return mins > 0 ? `${hours} godz. ${mins} min` : `${hours} godz.`;
    }
    return `${maxTime} minut`;
  };

  // DODAJ useEffect do wykrywania nowego zamówienia
  useEffect(() => {
    const handleOrderUpdate = (e: CustomEvent) => {
      if (e.detail?.orderAdded && e.detail?.order) {
        const order = e.detail.order;
        setModalData({
          estimatedTime: getEstimatedTimeText(order.items),
          orderNumber: order.orderNumber,
        });
        setShowSuccessModal(true);
        refreshOrders();
      }
    };

    window.addEventListener(
      'orderStatusUpdate',
      handleOrderUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        'orderStatusUpdate',
        handleOrderUpdate as EventListener
      );
    };
  }, [refreshOrders]);

  const visibleOrders = orders
    .map((order) => ({
      ...order,
      items: order.items.filter((item) => !item.hiddenByUser),
    }))
    .filter((order) => order.items.length > 0);

  const totalVisibleItems = visibleOrders.reduce(
    (acc, order) => acc + order.items.length,
    0
  );

  const completedVisibleItems = visibleOrders.reduce(
    (acc, order) =>
      acc + order.items.filter((item) => item.status === 'zakończone').length,
    0
  );

  useEffect(() => {
    const handleOrderUpdate = (e: CustomEvent) => {
      if (e.detail?.orderAdded) {
        refreshOrders();
      }
    };

    window.addEventListener(
      'orderStatusUpdate',
      handleOrderUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        'orderStatusUpdate',
        handleOrderUpdate as EventListener
      );
    };
  }, [refreshOrders]);

  useEffect(() => {
    // Sprawdź czy któryś item zmienił status z "w trakcie" na "zakończone"
    orders.forEach((newOrder) => {
      const previousOrder = previousOrders.find(
        (po) => po._id === newOrder._id
      );
      if (previousOrder) {
        newOrder.items.forEach((newItem) => {
          const previousItem = previousOrder.items.find(
            (pi) => pi._id === newItem._id
          );
          if (
            previousItem &&
            previousItem.status === 'w trakcie' &&
            newItem.status === 'zakończone'
          ) {
            setIsCollapsed(false);
          }
        });
      }
    });

    // Zapisz obecny stan jako poprzedni
    setPreviousOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (forceShow) {
      setIsCollapsed(false);
      sessionStorage.removeItem('orderStatusBoxManualClose');
      setUserClosedManually(false);
    }
  }, [forceShow]);

  const calculateProgress = useCallback((item: OrderItem) => {
    if (item.status === 'zakończone') return 100;
    if (!item.startTime || !item.estimatedCompletionTime) return 0;

    const start = new Date(item.startTime).getTime();
    const end = new Date(item.estimatedCompletionTime).getTime();
    const now = Date.now();

    const elapsedTime = now - start;
    const totalTime = end - start;
    const calculatedProgress = (elapsedTime / totalTime) * 100;

    return Math.min(Math.max(calculatedProgress, 0), 99);
  }, []);

  const getTimeRemaining = useCallback(
    (estimatedCompletionTime: string) => {
      const end = new Date(estimatedCompletionTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) return t('almostDone');

      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) {
        return `${minutes} min`;
      }
      const hours = Math.floor(minutes / 60);
      return `${hours} godz`;
    },
    [t]
  );

  const truncateTitle = (title: string) => {
    if (!title) return t('untitledText');
    if (title.length <= 20) return title;
    const lastSpace = title.substr(0, 20).lastIndexOf(' ');
    return lastSpace > 0
      ? `${title.substr(0, lastSpace)}...`
      : `${title.substr(0, 20)}...`;
  };

  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleToggleCollapse = useCallback(() => {
    trackInteraction('box_toggle', {
      action: !isCollapsed ? 'collapse' : 'expand',
      triggerType: 'user_click',
    });

    setIsCollapsed((prev) => {
      const newState = !prev;
      if (newState) {
        sessionStorage.setItem('orderStatusBoxManualClose', 'true');
        setUserClosedManually(true);
      } else {
        sessionStorage.removeItem('orderStatusBoxManualClose');
        setUserClosedManually(false);
      }
      sessionStorage.setItem('orderStatusBoxCollapsed', String(newState));
      return newState;
    });
  }, [isCollapsed, trackInteraction]);

  // 3. Wszystkie efekty
  useEffect(() => {
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const wasCompletedBefore = Array.from(lastCompletedItems).includes(
          item._id
        );
        if (
          item.status === 'zakończone' &&
          !wasCompletedBefore &&
          !userClosedManually
        ) {
          // Śledzimy automatyczne otwarcie
          trackInteraction('box_toggle', {
            action: 'expand',
            triggerType: 'auto_complete',
            orderId: order._id,
            itemId: item._id,
          });

          setIsCollapsed(false);
          setLastCompletedItems((prev) => new Set([...prev, item._id]));
        }
      });
    });
  }, [orders, lastCompletedItems, userClosedManually, trackInteraction]);

  if (!visibleOrders.length) return null;

  return (
    <AnimatePresence>
      {visibleOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: 1,
            x: isCollapsed ? 'calc(100% - 0px)' : 0,
          }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          data-order-status-box
          className="fixed right-0 top-10 z-50"
        >
          <button
            onClick={handleToggleCollapse}
            className={`absolute left-0 top-4 -translate-x-full bg-blue-600 text-white p-2 rounded-l-md hover:bg-blue-700 transition-colors ${theme === 'dark' ? 'hover:bg-blue-800' : ''}`}
          >
            {isCollapsed ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
          <div
            className="w-[calc(100vw-3rem)] sm:w-[calc(100vw-4rem)] md:w-96 bg-white dark:bg-gray-800 shadow-xl rounded-l-lg overflow-hidden border-l border-t border-b border-gray-200 dark:border-gray-700 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            <div className="p-4 bg-blue-600 text-white shrink-0">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="mr-2" size={20} />
                {t('title')}
              </h3>
            </div>

            {/* Scrollowany kontener z itemami */}
            <div className="overflow-y-auto flex-grow">
              <AnimatePresence mode="popLayout">
                {visibleOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    {order.items.map((item) => {
                      const isExpanded = expandedItems.has(item._id);
                      return (
                        <OrderStatusItem
                          key={item._id}
                          isCompleted={item.status === 'zakończone'}
                          item={item}
                          orderNumber={order.orderNumber}
                          orderId={order._id}
                          isExpanded={isExpanded}
                          progress={
                            progressMap[item._id] ?? calculateProgress(item)
                          }
                          onToggle={() => toggleItem(item._id)}
                          onHide={handleHideItem}
                          timeRemaining={
                            item.estimatedCompletionTime
                              ? getTimeRemaining(item.estimatedCompletionTime)
                              : undefined
                          }
                        />
                      );
                    })}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>
                  {t('completed')}: {completedVisibleItems}/{totalVisibleItems}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {showSuccessModal && modalData && (
        <OrderWorkCommencedModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          estimatedTime={modalData.estimatedTime}
          orderNumber={modalData.orderNumber}
        />
      )}
    </AnimatePresence>
  );
};

export default OrderStatusBox;
