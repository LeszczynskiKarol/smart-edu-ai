// src/components/dashboard/MobileOrderTable.tsx
import React from 'react';
import {
    ChevronDown,
    ChevronUp,
    FileText,
    Paperclip,
    RefreshCw,
    CheckCircle,
    Type,
    Globe,
    Copy,
    Code,
    FileDown,
    Image
} from 'lucide-react';
import { Order } from '../../types/order';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface MobileOrderTableProps {
    orders: (Order & { hasUnreadNotifications: boolean })[];
    expandedOrder: string | null;
    toggleOrderExpansion: (orderId: string) => void;
    translateContentType: (contentType: string) => string;
    translateLanguage: (language: string) => string;
    translateFileType: (fileType: string) => string;
    refreshOrderStatus: (orderId: string) => Promise<void>;
    refreshingOrders: { [key: string]: boolean };
    completedOrders: { [key: string]: boolean };
}

const stripHtml = (html: string) => {
    const container = document.createElement('DIV');
    container.innerHTML = html;
    const content = container.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n');
    container.innerHTML = content;
    const text = container.textContent || container.innerText;
    return text
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '');
};

const ContentActions: React.FC<{ content: string; topic: string }> = ({ content, topic }) => {
    const [copySuccess, setCopySuccess] = React.useState(false);
    const [copyType, setCopyType] = React.useState<'text' | 'html' | null>(null);
    const t = useTranslations('orderDetails.content');
    const ct = useTranslations('orderHistory.content');

    const handleCopyFormatted = async () => {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([content], { type: 'text/html' }),
                    'text/plain': new Blob([stripHtml(content)], { type: 'text/plain' })
                })
            ]);
            setCopyType('text');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy formatted text:', err);
        }
    };

    const handleCopyHTML = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopyType('html');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy HTML:', err);
        }
    };

    const handleDownloadPDF = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!content) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${topic || 'generated_content'}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };
    const handleDownloadDOCX = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!content) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-docx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${topic || 'generated_content'}.docx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Failed to generate DOCX:', await response.text());
                throw new Error('Failed to generate DOCX');
            }
        } catch (error) {
            console.error('Error generating DOCX:', error);
        }
    };
    return (
        <div>
            <div className="flex items-center justify-center space-x-4">
                <div className="flex flex-col items-center text-center">
                    <button
                        onClick={handleCopyFormatted}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 shadow-sm"
                    >
                        <Copy size={16} className="transition-transform duration-200 hover:scale-110" />
                    </button>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center w-full">
                        {ct('copyToClipboard')}
                    </span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <button
                        onClick={handleCopyHTML}
                        className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 transition-colors duration-200 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 shadow-sm"
                    >
                        <Code size={16} className="transition-transform duration-200 hover:scale-110" />
                    </button>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center w-full">
                        {t('copyHTML')}
                    </span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <button
                        onClick={handleDownloadPDF}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 transition-colors duration-200 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 shadow-sm"
                    >
                        <FileDown size={16} className="transition-transform duration-200 hover:scale-110" />
                    </button>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center w-full">
                        {t('downloadPDF')}
                    </span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <button
                        onClick={handleDownloadDOCX}
                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-colors duration-200 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 shadow-sm"
                    >
                        <FileText size={16} className="transition-transform duration-200 hover:scale-110" />
                    </button>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center w-full">
                        {t('downloadDOCX')}
                    </span>
                </div>
            </div>
            {copySuccess && (
                <div className="fixed top-10 right-4 mt-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg shadow-lg opacity-90">
                    {copyType === 'html' ? t('copiedHTMLToClipboard') : t('copiedToClipboard')}
                </div>
            )}
        </div>
    );
};

const ContentSection: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const previewLength = 500;
    const t = useTranslations('orderDetails.content');

    const truncateToWord = (text: string, length: number) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        if (textContent.length <= length) return text;

        let truncated = text.slice(0, length);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            truncated = truncated.substr(0, lastSpace);
        }
        return truncated + '...';
    };

    return (
        <div className="mt-4 mb-6">
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{
                __html: isExpanded ? content : truncateToWord(content, previewLength)
            }} />
            {content.length > previewLength && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                    >
                        <span className="text-sm font-medium">
                            {isExpanded ? t('showLess') : t('showMore')}
                        </span>
                        {isExpanded ?
                            <ChevronUp className="w-4 h-4" /> :
                            <ChevronDown className="w-4 h-4" />
                        }
                    </button>
                </div>
            )}
        </div>
    );
};



const MobileOrderTable: React.FC<MobileOrderTableProps> = ({
    orders,
    expandedOrder,
    toggleOrderExpansion,
    translateContentType,
    translateLanguage,
    translateFileType,
    refreshOrderStatus,
    refreshingOrders,
    completedOrders
}) => {
    const t = useTranslations('orderHistory');

    const limitWords = (text: string, maxLength: number) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: currency || 'PLN',
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">
                                {limitWords(order.items[0]?.guidelines || 'Brak wytycznych', 50)}
                            </h2>
                            <button
                                onClick={() => toggleOrderExpansion(order._id)}
                                className="btn btn-circle btn-sm"
                            >
                                {expandedOrder === order._id ? <ChevronUp /> : <ChevronDown />}
                            </button>
                        </div>

                        <div className="flex flex-col space-y-2 mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('table.orderDate')}: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('table.price')}: {formatPrice(order.totalPrice, order.currency)}
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className={`badge ${order.status === 'zakończone' ? 'badge-success' :
                                    order.status === 'w trakcie' ? 'badge-warning' :
                                        'badge-ghost'
                                    }`}>
                                    {t(`order.status.${order.status}`)}
                                </span>
                                {order.status === 'w trakcie' && (
                                    <motion.button
                                        onClick={() => refreshOrderStatus(order._id)}
                                        className="btn btn-circle btn-xs"
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <RefreshCw size={12} className={refreshingOrders[order._id] ? 'animate-spin' : ''} />
                                    </motion.button>
                                )}
                                <AnimatePresence>
                                    {completedOrders[order._id] && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                        >
                                            <CheckCircle size={20} className="text-green-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {expandedOrder === order._id && (
                            <div className="mt-4 border-t pt-4 dark:border-gray-700">
                                {order.items.map((item, index) => (
                                    <div key={index} className="mb-6 last:mb-0">
                                        <div className="flex flex-col space-y-2">
                                            <h3 className="font-medium">
                                                {item.topic || t('order.item') + ` #${index + 1}`}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center">
                                                    <Type className="w-4 h-4 mr-1" />
                                                    {item.length} {t('order.characters')}
                                                </div>
                                                <div className="flex items-center">
                                                    <Globe className="w-4 h-4 mr-1" />
                                                    {translateLanguage(item.language)}
                                                </div>
                                            </div>


                                            {item.guidelines && (
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                    <p className="text-sm">{item.guidelines}</p>
                                                </div>
                                            )}

                                            {item.content && (
                                                <div className="mt-4">
                                                    <h4 className="font-medium mb-2">{t('content.generatedContent')}</h4>
                                                    <div className="relative">
                                                        <ContentSection content={item.content} />
                                                        <ContentActions content={item.content} topic={item.topic} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MobileOrderTable;
