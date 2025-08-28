// src/components/OrderSuccessModal.tsx
import React, { useEffect, useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatCurrency } from '../hooks/useExchangeRate';

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

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderDetails: OrderDetails | null;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
    isOpen,
    onClose,
    orderDetails
}) => {
    const t = useTranslations('orderSuccess');
    const locale = useLocale();
    const [expandedItems, setExpandedItems] = useState(false);


    useEffect(() => {
        if (isOpen) {
            const orderStatusBox = document.querySelector('[data-order-status-box]');
            if (orderStatusBox?.classList.contains('translate-x-[calc(100%-1px)]')) {
                orderStatusBox.classList.remove('translate-x-[calc(100%-1px)]');
            }
            sessionStorage.setItem('orderStatusVisible', 'true');
        }
    }, [isOpen]);

    if (!isOpen || !orderDetails) return null;

    const truncateTitle = (title: string) => {
        const words = title.split(' ').slice(0, 5);
        return words.join(' ') + (words.length < title.split(' ').length ? '...' : '');
    };

    const containsSocialMediaPost = orderDetails.items.some(
        item => item.contentType === 'post_social_media'
    );

    return (
        <AnimatePresence>
            {isOpen && orderDetails && (
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
                        {/* Nagłówek - zawsze widoczny */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-blue-400 dark:blue-300">
                                {t('title')}
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

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {containsSocialMediaPost ? t('socialMediaMessage') : t('standardMessage')}
                        </p>

                        {/* Główna treść - z możliwością przewijania */}
                        <div className="flex-grow overflow-y-auto min-h-0">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                        {t('details.items.title')} ({orderDetails.items.length})
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setExpandedItems(!expandedItems)}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        {expandedItems ? t('details.collapseItems') : t('details.expandItems')}
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
                                            animate={{ height: "auto", opacity: 1 }}
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
                                                            {t('details.items.item')} {index + 1}: {truncateTitle(item.topic)}
                                                        </h4>
                                                    </div>
                                                    <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                                                        <p>{t('details.items.textLength')}: {item.length} {t('details.items.characters')}</p>
                                                        <p>{t('details.items.contentType')}: {t(`contentTypes.${item.contentType}`)}</p>
                                                        <p>{t('details.items.subtotal')}: {formatCurrency(item.price, locale)}</p>
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
                                        <span>{t('details.summary.total')}:</span>
                                        <span>{formatCurrency(orderDetails.totalPrice, locale)}</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Stopka - zawsze widoczna na dole */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-auto">
                            {containsSocialMediaPost ? t('footerSocialMedia') : t('footerStandard')}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccessModal;
