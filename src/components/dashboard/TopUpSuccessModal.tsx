// src/components/dashboard/TopUpSuccessModal.tsx
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatCurrency } from '../../hooks/useExchangeRate';

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

interface TopUpSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paidAmount: number;
  discount: number;
  newBalance: number;
  paymentId: string;
}

const TopUpSuccessModal: React.FC<TopUpSuccessModalProps> = ({
  isOpen,
  onClose,
  amount,
  paidAmount,
  discount,
  newBalance,
  paymentId,
}) => {
  const t = useTranslations('topUpSuccessModal');
  const locale = useLocale();
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedItems, setExpandedItems] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (isOpen && paymentId) {
      const fetchPaymentDetails = async () => {
        try {
          const response = await fetch(`/api/stripe/session/${paymentId}`);

          if (response.ok) {
            const data = await response.json();

            if (data.orderDetails) {
              setOrderDetails(data.orderDetails);
            } else {
              console.log('Brak szczegółów zamówienia w odpowiedzi');
            }

            setPaymentDetails({
              amount: data.amount,
              paidAmount: data.paidAmount,
              discount: data.discount,
              newBalance: data.newBalance,
            });
          }
        } catch (error) {
          console.error('Błąd podczas pobierania danych:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);
  const handleDownloadInvoice = async () => {
    if (!paymentId) {
      alert('Nie można pobrać faktury. Brak identyfikatora płatności.');
      return;
    }

    setIsDownloading(true);
    try {
      // Używamy tej samej ścieżki co w PaymentHistory
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/${paymentId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank');
        } else {
          throw new Error(data.message || 'Nie udało się pobrać faktury');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Błąd podczas pobierania faktury');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania faktury:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas pobierania faktury. Spróbuj ponownie później.'
      );
    } finally {
      setIsDownloading(false);
    }
  };
  const truncateTitle = (title: string) => {
    const words = title.split(' ').slice(0, 5);
    return (
      words.join(' ') + (words.length < title.split(' ').length ? '...' : '')
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full my-auto max-h-[90vh] flex flex-col relative"
          >
            {/* Nagłówek */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {orderDetails ? t('titleWithOrder') : t('title')}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Sekcja płatności */}
            <div className="text-gray-700 dark:text-gray-300 mb-4">
              <p>
                {t('finalAmount')}: {formatCurrency(paidAmount, locale)}
              </p>
            </div>

            {/* Szczegóły zamówienia */}
            {orderDetails && (
              <div className="flex-grow overflow-y-auto min-h-0">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {t('orderDetails')} ({orderDetails.items.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExpandedItems(!expandedItems)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {expandedItems ? t('collapseItems') : t('expandItems')}
                      <motion.div
                        animate={{ rotate: expandedItems ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {expandedItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 mb-4 overflow-y-auto max-h-[40vh]"
                      >
                        {orderDetails.items.map((item, index) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-white dark:bg-gray-600 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {t('item')} {index + 1}:{' '}
                                {truncateTitle(item.topic)}
                              </h4>
                            </div>
                            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                              <p>
                                {t('length')}: {item.length}
                              </p>
                              <p>
                                {t('type')}:{' '}
                                {t(`contentTypes.${item.contentType}`)}
                              </p>
                              <p>
                                {t('price')}:{' '}
                                {formatCurrency(item.price, locale)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="pt-3 border-t border-gray-200 dark:border-gray-600"
                    layout
                  >
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('totalAmount')}:</span>
                      <span>
                        {formatCurrency(orderDetails.totalPrice, locale)}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Przycisk faktury i zamknięcia */}
            <div className="mt-5 space-y-2">
              {/*<button
                                className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
                                onClick={handleDownloadInvoice}
                                disabled={isDownloading}
                            >
                                {isDownloading ? t('downloading') : t('downloadInvoice')}
                            </button>*/}
              <button
                className="w-full bg-gray-400 text-gray-800 rounded-md py-2 hover:bg-gray-300"
                onClick={onClose}
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopUpSuccessModal;
