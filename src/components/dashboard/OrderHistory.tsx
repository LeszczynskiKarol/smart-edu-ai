// src/components/dashboard/OrderHistory.tsx
'use client';

import { Order, OrderComment } from '../../types/order';
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Code,
  Globe,
  Clock,
  DollarSign,
  Type,
  Copy,
  FileDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Paperclip,
  CheckCircle,
} from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import MobileOrderTable from './MobileOrderTable';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { TranslationMessages } from '../../types/translations';
import Link from 'next/link';
import { useTracking } from '@/hooks/useTracking';

const ContentActions: React.FC<{ content: string; topic: string }> = ({
  content,
  topic,
}) => {
  const { trackInteraction } = useTracking('ContentActions');
  const t = useTranslations('orderDetails.content');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyType, setCopyType] = useState<'text' | 'html' | null>(null);

  const handleCopyFormatted = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([content], { type: 'text/html' }),
          'text/plain': new Blob([stripHtml(content)], { type: 'text/plain' }),
        }),
      ]);
      trackInteraction('content_copy', {
        type: 'formatted',
        contentLength: content.length,
        topic,
      });
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
      trackInteraction('content_copy', {
        type: 'html',
        contentLength: content.length,
        topic,
      });
      setCopyType('html');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  const handleCopy = async () => {
    const strippedContent = stripHtml(content);
    try {
      await navigator.clipboard.writeText(strippedContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadPDF = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (!content) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      trackInteraction('content_download', {
        type: 'pdf',
        contentLength: content.length,
        topic,
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
      } else {
        console.error('Failed to generate PDF:', await response.text());
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadDOCX = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (!content) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-docx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      trackInteraction('content_download', {
        type: 'docx',
        contentLength: content.length,
        topic,
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: topic || 'Generated Content',
          text: stripHtml(content),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      console.log('Web Share API not supported');
      // Możesz tutaj zaimplementować alternatywny mechanizm udostępniania
      // np. kopiowanie do schowka lub wyświetlanie modalnego okna z opcjami udostępniania
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <button
          onClick={handleCopyFormatted}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 shadow-sm"
          title={t('copyToClipboard')}
        >
          <Copy
            size={16}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
        <button
          onClick={handleCopyHTML}
          className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 transition-colors duration-200 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 shadow-sm"
          title={t('copyHTML')}
        >
          <Code
            size={16}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
        <button
          onClick={handleDownloadPDF}
          className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 transition-colors duration-200 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 shadow-sm"
          title={t('downloadPDF')}
        >
          <FileDown
            size={16}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
        <button
          onClick={handleDownloadDOCX}
          className="p-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-colors duration-200 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 shadow-sm"
          title={t('downloadDOCX')}
        >
          <FileText
            size={16}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
      </div>
      {copySuccess && (
        <div className="fixed top-4 right-4 mt-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg shadow-lg opacity-90 transition-opacity duration-200 backdrop-blur-sm z-50">
          {copyType === 'html'
            ? t('copiedHTMLToClipboard')
            : t('copiedToClipboard')}
        </div>
      )}
    </div>
  );
};

const ContentSection: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLength = 500;
  const { theme } = useTheme();
  const t = useTranslations('orderDetails.content');
  const contentRef = useRef<HTMLDivElement>(null);

  const truncateToWord = (text: string, length: number) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    // POPRAWKA: Używamy parametru 'length' zamiast niezdefiniowanego 'limit'
    if (textContent.length <= length) return text;

    let truncated = text.slice(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.substr(0, lastSpace);
    }
    return truncated + '...';
  };

  const processedContent = content;

  const unescapeString = (str: string) => {
    return str.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  };

  return (
    <div className="article-content generated-content text-gray-800 dark:text-white max-w-prose lg:max-w-[80ch] xl:max-w-[90ch] mx-auto pr-16">
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{
          __html: unescapeString(
            isExpanded
              ? processedContent
              : truncateToWord(processedContent, previewLength)
          ),
        }}
      />
      {content.length > previewLength && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <span className="text-sm font-medium">
              {isExpanded ? t('showLess') : t('showMore')}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
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

const hasAttachments = (order: Order) => {
  if (
    order.attachments &&
    Object.values(order.attachments).some(
      (att) => att && (Array.isArray(att) ? att.length > 0 : true)
    )
  ) {
    return true;
  }
  if (order.completedStatusFiles && order.completedStatusFiles.length > 0) {
    return true;
  }
  if (order.userAttachments && order.userAttachments.length > 0) {
    return true;
  }
  return false;
};

const limitWords = (text: string, limit: number) => {
  const words = text.split(' ');
  if (words.length > limit) {
    return words.slice(0, limit).join(' ') + '...';
  }
  return text;
};

const stripHtml = (html: string) => {
  // Tworzymy tymczasowy kontener
  const container = document.createElement('DIV');
  container.innerHTML = html;

  // Zamieniamy <br> i </p> na znak nowej linii
  const content = container.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n');

  // Wstawiamy kontener z przekształconym HTML
  container.innerHTML = content;

  // Pobieramy sam tekst, który zachowa teraz podstawowe formatowanie
  const text = container.textContent || container.innerText;

  // Usuwamy nadmiarowe puste linie i spacje
  return text
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Zastępujemy potrójne (lub więcej) nowe linie podwójnymi
    .replace(/^\s+|\s+$/g, ''); // Usuwamy białe znaki z początku i końca
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ onOrderSuccess }) => {
  const { trackInteraction } = useTracking('OrderHistory');
  const t = useTranslations('orderHistory');
  const currentLocale = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Order>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedGuidelines, setExpandedGuidelines] = useState<{
    [key: string]: boolean;
  }>({});
  const { user, getToken } = useAuth();
  const [orderCounter, setOrderCounter] = useState(1);
  const [comments, setComments] = useState<{
    [orderId: string]: OrderComment[];
  }>({});
  const [newComments, setNewComments] = useState<{ [orderId: string]: string }>(
    {}
  );
  const [commentAttachments, setCommentAttachments] = useState<{
    [orderId: string]: File[];
  }>({});
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [refreshingOrders, setRefreshingOrders] = useState<{
    [key: string]: boolean;
  }>({});
  const [completedOrders, setCompletedOrders] = useState<{
    [key: string]: boolean;
  }>({});

  const truncateText = (text: string, limit: number): string => {
    if (text.length <= limit) return text;

    const truncated = text.slice(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substr(0, lastSpace) + '...';
    }

    return truncated + '...';
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(currentLocale === 'en' ? 'en-US' : 'pl-PL', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const fetchComments = async (orderId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments((prevComments) => ({
          ...prevComments,
          [orderId]: data.data,
        }));
      } else {
        console.error('Błąd pobierania komentarzy');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const handleCommentSubmit = async (orderId: string) => {
    try {
      const formData = new FormData();
      formData.append('content', newComments[orderId] || '');
      (commentAttachments[orderId] || []).forEach((file) =>
        formData.append('attachments', file)
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments((prevComments) => ({
          ...prevComments,
          [orderId]: [...(prevComments[orderId] || []), data.data],
        }));
        setNewComments((prevNewComments) => ({
          ...prevNewComments,
          [orderId]: '',
        }));
        setCommentAttachments((prevAttachments) => ({
          ...prevAttachments,
          [orderId]: [],
        }));
      } else {
        console.error('Błąd dodawania komentarza');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const refreshOrderStatus = useCallback(
    async (orderId: string) => {
      setRefreshingOrders((prev) => ({ ...prev, [orderId]: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setOrders((prevOrders) =>
            prevOrders.map((order) => {
              if (order._id === orderId) {
                const newOrder = { ...order, status: data.status };
                if (
                  data.status === 'zakończone' &&
                  order.status !== 'zakończone'
                ) {
                  setCompletedOrders((prev) => ({ ...prev, [orderId]: true }));
                  setTimeout(
                    () =>
                      setCompletedOrders((prev) => ({
                        ...prev,
                        [orderId]: false,
                      })),
                    5000
                  );
                }
                return newOrder;
              }
              return order;
            })
          );
        }
      } catch (error) {
        console.error('Błąd podczas odświeżania statusu zamówienia:', error);
      } finally {
        setRefreshingOrders((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [getToken]
  );

  const handleCommentFileChange = (
    orderId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setCommentAttachments((prevAttachments) => ({
        ...prevAttachments,
        [orderId]: [
          ...(prevAttachments[orderId] || []),
          ...Array.from(e.target.files!),
        ],
      }));
    }
  };

  const translateContentType = (contentType: string): string => {
    switch (contentType) {
      case 'article':
        return 'artykuł';
      case 'product_description':
        return 'opis produktu';
      case 'category_description':
        return 'opis kategorii';
      case 'website_content':
        return 'tekst na stronę firmową';
      case 'social_media_post':
        return 'post do social media';
      case 'other':
        return 'inny';
      default:
        return contentType;
    }
  };

  const translateLanguage = (language: string): string => {
    switch (language) {
      case 'polish':
        return 'polski';
      case 'english':
        return 'angielski';
      case 'german':
        return 'niemiecki';
      default:
        return language;
    }
  };

  const translateFileType = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return 'Zdjęcia';
      case 'other':
        return 'Inne';
      default:
        return fileType.toUpperCase();
    }
  };

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }

    result.sort((a, b) => {
      if (a[sortField] === undefined || b[sortField] === undefined) return 0;
      if (a[sortField]! < b[sortField]!)
        return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField]! > b[sortField]!)
        return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredOrders(result);
  }, [orders, sortField, sortDirection, statusFilter]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (field: keyof Order) => {
    setSortField(field);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const toggleOrderExpansion = async (orderId: string) => {
    if (expandedOrder === orderId) {
      trackInteraction('order_details_collapse', {
        orderId,
        action: 'collapse',
      });
      setExpandedOrder(null);
    } else {
      try {
        trackInteraction('order_details_expand', {
          orderId,
          action: 'expand',
        });
        const [orderResponse, markReadResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-read-for-order/${orderId}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          ),
        ]);

        if (orderResponse.ok && markReadResponse.ok) {
          const orderData = await orderResponse.json();
          setExpandedOrder(orderId);
          await fetchComments(orderId);
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId
                ? { ...order, ...orderData.data, hasUnreadNotifications: false }
                : order
            )
          );
        } else {
          console.error(
            'Błąd pobierania szczegółów zamówienia lub oznaczania powiadomień jako przeczytane'
          );
        }
      } catch (error) {
        console.error('Błąd:', error);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Dodajemy typowanie
        const filteredData = data.data.filter(
          (order: Order) => order.status !== 'oczekujące'
        );
        setOrders(filteredData);
        setFilteredOrders(filteredData);
        setOrderCounter(
          Math.max(...data.data.map((o: Order) => o.orderNumber || 0)) + 1
        );

        if (filteredData.length > 0) {
          const newestOrder = filteredData[0];
          onOrderSuccess({
            orderNumber: newestOrder.orderNumber.toString(),
            totalPrice: newestOrder.totalPrice,
            discount: 0,
            itemsCount: newestOrder.items.length,
          });
        }
      } else {
        console.error('Błąd pobierania zamówień');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const ordersWithStringNumber: (Order & {
    hasUnreadNotifications: boolean;
  })[] = currentOrders.map((order) => ({
    ...order,
    orderNumber: order.orderNumber.toString(),
    hasUnreadNotifications: order.hasUnreadNotifications || false,
  }));

  const getOrderStatus = (status: string) => {
    switch (status) {
      case 'zakończone':
        return t('order.status.completed');
      case 'w trakcie':
        return t('order.status.inProgress');
      case 'oczekujące':
        return t('order.status.waiting');
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>
      {/*<div className="flex justify-between items-center mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select select-bordered w-full max-w-xs"
        >
          <option value="all">{t('status.all')}</option>
          <option value="w trakcie">{t('status.inProgress')}</option>
          <option value="zakończone">{t('status.completed')}</option>
        </select>
      </div>*/}
      {isMobile ? (
        <MobileOrderTable
          orders={ordersWithStringNumber}
          expandedOrder={expandedOrder}
          toggleOrderExpansion={toggleOrderExpansion}
          translateContentType={translateContentType}
          translateLanguage={translateLanguage}
          translateFileType={translateFileType}
          refreshOrderStatus={refreshOrderStatus}
          refreshingOrders={refreshingOrders}
          completedOrders={completedOrders}
        />
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer"
                >
                  {t('table.topic')}{' '}
                  {sortField === 'createdAt' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer"
                >
                  {t('table.orderDate')}{' '}
                  {sortField === 'createdAt' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="cursor-pointer"
                >
                  {t('table.status')}{' '}
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('totalPrice')}
                  className="cursor-pointer"
                >
                  {t('table.price')}{' '}
                  {sortField === 'totalPrice' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>{t('order.details')}</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="text-gray-900 dark:text-gray-200">
                      <Link
                        href={`/dashboard/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {limitWords(
                          order.items[0]?.topic || t('table.noTitle'),
                          5
                        )}
                      </Link>
                    </td>
                    <td className="text-gray-900 dark:text-gray-200">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span
                          className={`
                  badge 
                  ${
                    order.status === 'zakończone'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : order.status === 'w trakcie'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}
                        >
                          {getOrderStatus(order.status)}
                        </span>
                        {order.status === t('order.status.inProgress') && (
                          <div className="relative group">
                            <motion.button
                              onClick={() => refreshOrderStatus(order._id)}
                              className={`btn btn-circle btn-xs ml-3 ${refreshingOrders[order._id] ? 'bg-blue-500' : 'bg-gray-500'}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              animate={
                                refreshingOrders[order._id]
                                  ? {
                                      rotate: 360,
                                      transition: {
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: 'linear',
                                      },
                                    }
                                  : { rotate: 0 }
                              }
                            >
                              <RefreshCw size={16} className="text-white" />
                            </motion.button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 py-1 px-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {t('table.refreshStatus')}
                            </span>
                          </div>
                        )}

                        <AnimatePresence>
                          {completedOrders[order._id] && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="ml-2"
                            >
                              <CheckCircle
                                size={20}
                                className="text-green-500"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                    <td className="text-right text-gray-900 dark:text-gray-200">
                      {formatPrice(order.totalPriceOriginal, order.currency)}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="btn btn-circle btn-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedOrder === order._id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="bg-gray-50 dark:bg-gray-900 p-4"
                      >
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                          <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-200">
                            {t('order.summary')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center">
                              <Clock className="mr-2" size={18} />
                              <span>
                                {t('orderInfo.createdAt')}:{' '}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-2" size={18} />
                              <span>
                                {t('orderInfo.totalPrice')}:{' '}
                                {formatPrice(
                                  order.totalPriceOriginal,
                                  order.currency
                                )}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FileText className="mr-2" size={18} />
                              <span>
                                {t('orderInfo.orderId')}: {order._id}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lista itemów */}
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatPrice(item.price, order.currency)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center">
                                  <Type className="mr-2" size={16} />
                                  <span>
                                    {item.length} {t('orderInfo.characters')}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Globe className="mr-2" size={16} />
                                  <span>
                                    {translateLanguage(item.language)}
                                  </span>
                                </div>
                              </div>

                              {item.guidelines && (
                                <div className="mt-3">
                                  <h6 className="font-medium mb-1">
                                    {t('orderInfo.guidelines')}:
                                  </h6>
                                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                                    {expandedGuidelines[item._id]
                                      ? item.guidelines
                                      : truncateText(item.guidelines, 100)}
                                    {item.guidelines.length > 100 && (
                                      <button
                                        onClick={() =>
                                          setExpandedGuidelines((prev) => ({
                                            ...prev,
                                            [item._id]: !prev[item._id],
                                          }))
                                        }
                                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                      >
                                        {expandedGuidelines[item._id]
                                          ? t('common.showLess')
                                          : t('common.showMore')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {item.content && (
                                <div className="mt-4 relative group">
                                  <h4 className="font-semibold mb-2">
                                    {t('content.generatedContent')}:
                                  </h4>
                                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg overflow-auto w-full min-h-fit max-h-[90vh] lg:max-w-[90%] xl:max-w-[80%] mx-auto">
                                    {/* Dodajemy stan dla rozwijania */}
                                    <ContentSection content={item.content} />
                                    <div className="absolute top-2 right-2">
                                      <ContentActions
                                        content={item.content}
                                        topic={item.topic}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Załączniki */}
                        {hasAttachments(order) && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Załączniki użytkownika */}
                            {order.userAttachments &&
                              order.userAttachments.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                  <h4 className="font-semibold mb-3 flex items-center">
                                    <Paperclip className="mr-2" />{' '}
                                    {t('content.attachments.yours')}
                                  </h4>
                                  <ul className="space-y-2">
                                    {order.userAttachments.map(
                                      (attachment, index) => (
                                        <li key={index}>
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
                                          >
                                            <FileText
                                              size={16}
                                              className="mr-2"
                                            />
                                            {attachment.filename}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Załączniki administratora */}
                            {order.attachments &&
                              Object.keys(order.attachments).length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                  <h4 className="font-semibold mb-3 flex items-center">
                                    <Paperclip className="mr-2" />{' '}
                                    {t('content.attachments.fromService')}
                                  </h4>
                                  <div className="grid gap-3">
                                    {['pdf', 'docx', 'image', 'other'].map(
                                      (fileType) => {
                                        const attachment =
                                          order.attachments?.[fileType];
                                        if (
                                          !attachment ||
                                          (fileType === 'other' &&
                                            Array.isArray(attachment) &&
                                            attachment.length === 0)
                                        ) {
                                          return null;
                                        }

                                        return (
                                          <div
                                            key={fileType}
                                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded"
                                          >
                                            <h5 className="font-medium mb-2 flex items-center">
                                              {fileType === 'pdf' && (
                                                <FileText className="mr-2 text-red-500" />
                                              )}
                                              {fileType === 'docx' && (
                                                <FileText className="mr-2 text-blue-500" />
                                              )}
                                              {fileType === 'image' && (
                                                <Image className="mr-2 text-green-500" />
                                              )}
                                              {fileType === 'other' && (
                                                <Paperclip className="mr-2 text-gray-500" />
                                              )}
                                              {translateFileType(fileType)}
                                            </h5>
                                            <ul className="space-y-1">
                                              {Array.isArray(attachment) ? (
                                                attachment.map(
                                                  (file, index) => (
                                                    <li key={index}>
                                                      <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline dark:text-blue-400"
                                                      >
                                                        {decodeURIComponent(
                                                          file.filename
                                                        )}
                                                      </a>
                                                    </li>
                                                  )
                                                )
                                              ) : (
                                                <li>
                                                  <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline dark:text-blue-400"
                                                  >
                                                    {decodeURIComponent(
                                                      attachment.filename
                                                    )}
                                                  </a>
                                                </li>
                                              )}
                                            </ul>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filteredOrders.length > 0 ? (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft />
          </button>
          <span className="text-gray-900 dark:text-gray-200">
            {t('pagination.page')} {currentPage} {t('pagination.of')}{' '}
            {Math.ceil(filteredOrders.length / ordersPerPage)}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
            }
            className="btn bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default OrderHistory;
