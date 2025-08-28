// src/app/[locale]/dashboard/orders/[id]/page.tsx
'use client';
import { useTranslations } from 'next-intl';
import TruncatedText from '@/components/TruncatedText';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Code,
  Copy,
  FileDown,
  FileText,
  Clock,
  DollarSign,
  Type,
  Globe,
} from 'lucide-react';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useLocale } from 'next-intl';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useTracking } from '@/hooks/useTracking';

const ORDER_STATUS = {
  COMPLETED: 'zakończone',
  IN_PROGRESS: 'w trakcie',
  WAITING: 'oczekujące',
} as const;

const ContentSection: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLength = 500;
  const t = useTranslations('orderDetails.content');

  const truncateToWord = (text: string, length: number) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    if (textContent.length <= length) return text;

    let truncated = text.slice(0, length);
    // Znajdź ostatnią spację przed limitem
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.substr(0, lastSpace);
    }
    return truncated + '...';
  };

  return (
    <div className="article-content generated-content text-gray-800 dark:text-white max-w-prose lg:max-w-[80ch] xl:max-w-[90ch] mx-auto pr-16">
      <div
        dangerouslySetInnerHTML={{
          __html: isExpanded ? content : truncateToWord(content, previewLength),
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

interface OrderItem {
  topic: string;
  length: number;
  price: number;
  contentType: string;
  language: string;
  guidelines?: string;
  content?: string;
}

interface OrderComment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  attachments: {
    filename: string;
    url: string;
  }[];
  isAdminComment: boolean;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  totalPriceOriginal: number;
  currency: 'PLN' | 'USD';
  declaredDeliveryDate: string;
  hasUnreadNotifications?: boolean;
  attachments?: {
    [key: string]: any;
  };
  userAttachments?: {
    filename: string;
    url: string;
  }[];
  completedStatusFiles?: {
    filename: string;
    url: string;
    uploadDate: string;
  }[];
}

// Funkcja do usuwania tagów HTML
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

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [comments, setComments] = useState<OrderComment[]>([]);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [completedStatus, setCompletedStatus] = useState(false);
  const t = useTranslations('orderDetails');
  const tContent = useTranslations('orderSuccess');
  const currentLocale = useLocale();
  const { trackEvent } = useAnalytics();
  const pageViewTracked = useRef(false);

  // Dodajemy śledzenie pageView
  useEffect(() => {
    if (!pageViewTracked.current) {
      pageViewTracked.current = true;

      trackEvent('pageView', {
        action: 'page_load',
        path: window.location.pathname,
        component: 'OrderDetails',
        orderId,
        referrer: document.referrer || sessionStorage.getItem('lastPath') || '',
      });
    }
  }, [orderId, trackEvent]);

  const getContentTypeTranslation = (type: string): string => {
    try {
      return tContent(`contentTypes.${type}`);
    } catch {
      return type;
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    // Używamy locale przekazanego jako parametr zamiast wywołania hooka
    return new Intl.NumberFormat(currentLocale === 'en' ? 'en-US' : 'pl-PL', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  useEffect(() => {
    fetchOrderDetails();
    fetchComments();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      } else {
        console.error('Błąd pobierania szczegółów zamówienia');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const fetchComments = async () => {
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
        setComments(data.data);
      } else {
        console.error('Błąd pobierania komentarzy');
      }
    } catch (error) {
      console.error('Błąd:', error);
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

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('loading')}
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t('title', { number: order.orderNumber })}
      </h1>

      <div className="mb-6 last:mb-0 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/*<div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${order.status === ORDER_STATUS.COMPLETED ? 'bg-green-500' :
                            order.status === ORDER_STATUS.IN_PROGRESS ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}></div>
                        <span>{t('status.title')}: {getStatusTranslation(order.status)}</span>
                        {order.status === ORDER_STATUS.IN_PROGRESS && (
                            <div className="relative group ml-2">
                                <motion.button
                                    onClick={refreshOrderStatus}
                                    className={`btn btn-circle btn-xs ${refreshingStatus ? 'bg-blue-500' : 'bg-gray-500'}`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    animate={refreshingStatus ? {
                                        rotate: 360,
                                        transition: {
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }
                                    } : { rotate: 0 }}
                                >
                                    <RefreshCw size={16} className="text-white" />
                                </motion.button>
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 py-1 px-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {t('status.refreshStatus')}
                                </span>
                            </div>
                        )}
                        <AnimatePresence>
                            {completedStatus && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="ml-2"
                                >
                                    <CheckCircle size={20} className="text-green-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>*/}
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
              {t('orderInfo.price')}:{' '}
              {formatPrice(order.totalPriceOriginal, order.currency)}
            </span>
          </div>
          {/*<div className="flex items-center">
                        <FileText className="mr-2" size={18} />
                        <span>
                            {t('orderInfo.contentType')}: {getContentTypeTranslation(order.items[0]?.contentType)}
                        </span>
                    </div>*/}
        </div>
      </div>

      {/* Lista itemów */}
      {order.items.map((item, index) => (
        <div
          key={index}
          className="mb-6 last:mb-0 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Type className="mr-2" size={18} />
              <span>
                {t('orderInfo.length')}: {item.length}{' '}
                {t('orderInfo.characters')}
              </span>
            </div>
            <div className="flex items-center">
              <Globe className="mr-2" size={18} />
              <span>
                {t('orderInfo.language')}: {translateLanguage(item.language)}
              </span>
            </div>
            <div className="flex items-center">
              <FileText className="mr-2" size={18} />
              <span>
                {t('orderInfo.contentType')}:{' '}
                {getContentTypeTranslation(item.contentType)}
              </span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-2" size={18} />
              <span>
                {t('orderInfo.itemPrice')}:{' '}
                {formatPrice(item.price, order.currency)}
              </span>
            </div>
          </div>

          {item.guidelines && (
            <div className="mt-4">
              <strong>{t('orderInfo.guidelines')}:</strong>
              <TruncatedText
                text={item.guidelines}
                showMoreText={t('common.showMore')}
                showLessText={t('common.showLess')}
                limit={100}
                className="bg-white dark:bg-gray-600 p-2 rounded"
                containerClassName="mt-1"
              />
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
                  <ContentActions content={item.content} topic={item.topic} />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Załączniki */}
      {hasAttachments(order) && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-2">Załączniki</h2>

          {/* Załączniki użytkownika */}
          {order.userAttachments && order.userAttachments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Twoje załączniki:</h3>
              <ul className="space-y-2">
                {order.userAttachments.map((attachment, index) => (
                  <li key={index}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {attachment.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Załączniki administratora */}
          {(order.attachments && Object.keys(order.attachments).length > 0) ||
          (order.completedStatusFiles &&
            order.completedStatusFiles.length > 0) ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Dodane przez eCopywriting:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['pdf', 'docx', 'image', 'other'].map((fileType) => {
                  const attachment = order.attachments?.[fileType];
                  const completedFiles = order.completedStatusFiles?.filter(
                    (file) => {
                      const extension = file.filename
                        .split('.')
                        .pop()
                        ?.toLowerCase();
                      if (fileType === 'pdf') return extension === 'pdf';
                      if (fileType === 'docx')
                        return extension === 'docx' || extension === 'doc';
                      if (fileType === 'image')
                        return ['jpg', 'jpeg', 'png', 'gif'].includes(
                          extension || ''
                        );
                      return ![
                        'pdf',
                        'docx',
                        'doc',
                        'jpg',
                        'jpeg',
                        'png',
                        'gif',
                      ].includes(extension || '');
                    }
                  );

                  if (
                    (attachment &&
                      (fileType !== 'other' ||
                        (Array.isArray(attachment) &&
                          attachment.length > 0))) ||
                    (completedFiles && completedFiles.length > 0)
                  ) {
                    return (
                      <div
                        key={fileType}
                        className="bg-gray-100 dark:bg-gray-700 p-3 rounded shadow"
                      >
                        <h4 className="font-semibold mb-2">
                          {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                        </h4>
                        <ul className="list-none">
                          {attachment &&
                            (Array.isArray(attachment) ? (
                              attachment.map((file, index) => (
                                <li key={index} className="mb-1">
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-500 hover:underline"
                                  >
                                    <FileText size={16} className="mr-2" />
                                    {file.filename}
                                  </a>
                                </li>
                              ))
                            ) : (
                              <li className="mb-1">
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-500 hover:underline"
                                >
                                  <FileText size={16} className="mr-2" />
                                  {attachment.filename}
                                </a>
                              </li>
                            ))}
                          {completedFiles &&
                            completedFiles.map((file, index) => (
                              <li key={`completed-${index}`} className="mb-1">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-500 hover:underline"
                                >
                                  <FileText size={16} className="mr-2" />
                                  {file.filename}
                                </a>
                              </li>
                            ))}
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
