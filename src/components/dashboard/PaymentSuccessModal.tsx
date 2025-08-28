// src/components/dashboard/PaymentSuccessModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, Download } from 'lucide-react';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId?: string;
    orderNumber?: number;
    amount: number;
    paidAmount: number;
    discount: number;
    remainingBalance: number;
    isTopUp: boolean;
    paymentId: string;
    itemsCount?: number;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
    isOpen,
    onClose,
    orderId = '',
    orderNumber,
    amount = 0,
    paidAmount = 0,
    discount = 0,
    remainingBalance = 0,
    isTopUp = false,
    paymentId = '',
    itemsCount = 0
}) => {
    const [isDownloading, setIsDownloading] = useState(false);


    useEffect(() => {
        if (isOpen) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [isOpen]);

    const handleDownloadInvoice = async () => {
        if (!paymentId) {
            alert('Nie można pobrać faktury. Brak identyfikatora płatności.');
            return;
        }

        setIsDownloading(true);
        let retries = 3;
        while (retries > 0) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${paymentId}/invoice`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.invoiceUrl) {
                        window.open(data.invoiceUrl, '_blank');
                        setIsDownloading(false);
                        return;
                    }
                }
                throw new Error('Faktura nie jest jeszcze gotowa');
            } catch (error) {
                console.error('Błąd podczas pobierania faktury:', error);
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Czekaj 2 sekundy przed ponowną próbą
                }
            }
        }
        alert('Nie udało się pobrać faktury. Spróbuj ponownie później.');
        setIsDownloading(false);
    };

    const formatAmount = (value: number | undefined): string => {
        const numberValue = Number(value) || 0;
        return numberValue.toFixed(2).replace('.', ',');
    };



    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 mb-4">
                                <Check className="h-6 w-6 text-green-600 dark:text-green-200" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Zamówienie opłacone!
                            </h3>
                            <div className="mt-2 px-7 py-3">

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {isTopUp ?
                                        `Doładowano: ${formatAmount(amount)} zł` :
                                        `Wartość zamówienia: ${formatAmount(amount)} zł`
                                    }
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Zapłacono: {formatAmount(paidAmount)} zł
                                </p>
                                {discount > 0 && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                        Rabat: {discount}% ({formatAmount(amount - paidAmount)} zł)
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Pozostałe saldo: {formatAmount(remainingBalance)} zł
                                </p>
                                {!isTopUp && (
                                    <>

                                    </>
                                )}
                            </div>
                            {!isTopUp && (
                                <div className="flex items-center justify-center mt-4 text-sm text-gray-600 dark:text-gray-400">

                                    <span>Status zamówienie możesz śledzić w pasku bocznym. Po wygenerowaniu tekstu otrzymasz powiadomienie. Dziękujemy!</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-5 sm:mt-6 space-y-2">
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleDownloadInvoice}
                                disabled={isDownloading || !paymentId}
                            >
                                {isDownloading ? 'Pobieranie...' : 'Pobierz fakturę'}
                                {!isDownloading && paymentId && <Download className="ml-2 h-5 w-5" />}
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600 sm:text-sm"
                                onClick={onClose}
                            >
                                Zamknij
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
PaymentSuccessModal.defaultProps = {
    amount: 0,
    paidAmount: 0,
    discount: 0,
    remainingBalance: 0,
    isTopUp: false,
    itemsCount: undefined,
    orderNumber: undefined,
    orderId: undefined
};

export default PaymentSuccessModal;