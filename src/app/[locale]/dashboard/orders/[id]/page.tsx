// src/app/[locale]/dashboard/orders/[id]/page.tsx
'use client';
import { useTranslations } from 'next-intl';
import TitlePageEditor from '@/components/TitlePageEditor';
import TruncatedText from '@/components/TruncatedText';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X as CloseIcon,
} from 'lucide-react';
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
  Calendar,
  Package,
} from 'lucide-react';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useLocale } from 'next-intl';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useTracking } from '@/hooks/useTracking';
import dynamic from 'next/dynamic';

// Dynamic import for Editor
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
  ),
});

const ORDER_STATUS = {
  COMPLETED: 'zakończone',
  IN_PROGRESS: 'w trakcie',
  WAITING: 'oczekujące',
} as const;

const ContentSection: React.FC<{
  content: string;
  isEditing: boolean;
  onContentChange?: (newContent: string) => void;
}> = ({ content, isEditing, onContentChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLength = 800;
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

  if (isEditing) {
    return (
      <div className="w-full">
        <Editor
          value={content}
          onChange={(newContent) => onContentChange?.(newContent)}
          placeholder="Edytuj treść..."
        />
      </div>
    );
  }

  return (
    <div className="article-content generated-content text-gray-800 dark:text-white w-full">
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: isExpanded ? content : truncateToWord(content, previewLength),
        }}
      />
      {content.length > previewLength && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            <span className="text-sm">
              {isExpanded ? t('showLess') : t('showMore')}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

interface OrderItem {
  _id?: string;
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
  return text.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/^\s+|\s+$/g, '');
};

const ContentActions: React.FC<{
  content: string;
  topic: string;
  orderId: string;
  contentType: string;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({
  content,
  topic,
  isEditing,
  onEditToggle,
  orderId,
  contentType,
  onSave,
  onCancel,
  isSaving,
}) => {
  const { trackInteraction } = useTracking('ContentActions');
  const t = useTranslations('orderDetails');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyType, setCopyType] = useState<'text' | 'html' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPDF = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (isDownloading) {
      console.log('⏳ Już pobieram PDF, czekaj...');
      return;
    }
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
          body: JSON.stringify({
            content,
            topic,
            orderId,
            contentType,
          }),
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
          body: JSON.stringify({
            content,
            topic,
            orderId,
          }),
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

  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-all duration-200 text-green-700 dark:text-green-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          <span className="font-medium">
            {isSaving ? t('editor.saving') : t('editor.saveChanges')}
          </span>
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CloseIcon size={18} />
          <span className="font-medium">{t('editor.cancel')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onEditToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-800 dark:hover:bg-orange-700 transition-all duration-200 text-orange-700 dark:text-orange-300 shadow-md hover:shadow-lg"
          title={t('editor.editContent')}
        >
          <Edit size={18} />
          <span className="font-medium">{t('editor.edit')}</span>
        </button>
        <button
          onClick={handleCopyFormatted}
          className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-all duration-200 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 shadow-md hover:shadow-lg"
          title={t('content.copyToClipboard')}
        >
          <Copy
            size={18}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
        <button
          onClick={handleCopyHTML}
          className="p-3 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 transition-all duration-200 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 shadow-md hover:shadow-lg"
          title={t('content.copyHTML')}
        >
          <Code
            size={18}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="p-3 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 transition-all duration-200 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 shadow-md hover:shadow-lg"
          title={t('content.downloadPDF')}
        >
          <FileDown
            size={18}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
        <button
          onClick={handleDownloadDOCX}
          className="p-3 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-all duration-200 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 shadow-md hover:shadow-lg"
          title={t('content.downloadDOCX')}
        >
          <FileText
            size={18}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
      </div>
      {copySuccess && (
        <div className="fixed top-4 right-4 mt-2 px-4 py-3 bg-blue-500 text-white text-sm rounded-lg shadow-xl opacity-95 transition-opacity duration-200 backdrop-blur-sm z-50">
          {copyType === 'html'
            ? t('content.copiedHTMLToClipboard')
            : t('content.copiedToClipboard')}
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
  const [isDownloading, setIsDownloading] = useState(false);
  // Editor states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTitlePageEditor, setShowTitlePageEditor] = useState(false);

  const t = useTranslations('orderDetails');
  const tContent = useTranslations('orderSuccess');
  const currentLocale = useLocale();
  const { trackEvent } = useAnalytics();
  const pageViewTracked = useRef(false);

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

  // Editor functions
  const handleEditToggle = (itemId: string, currentContent: string) => {
    setEditingItemId(itemId);
    setEditedContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedContent('');
  };

  const handleSaveContent = async () => {
    if (!editingItemId || !order) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            orderId: order._id,
            itemId: editingItemId,
            content: editedContent,
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setOrder((prevOrder) => {
          if (!prevOrder) return null;
          return {
            ...prevOrder,
            items: prevOrder.items.map((item) =>
              item._id === editingItemId
                ? { ...item, content: editedContent }
                : item
            ),
          };
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Edytor pozostaje aktywny po zapisaniu ✅
      } else {
        const errorData = await response.json();
        console.error('Błąd zapisywania:', errorData);
        alert(t('editor.saveError'));
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error);
      alert(t('editor.saveErrorGeneric'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg dark:text-white">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Success notification */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 px-4 py-3 bg-green-500 text-white rounded-lg shadow-xl z-50 animate-in slide-in-from-top">
          {t('editor.saveSuccess')}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3">
          <Package className="text-white" size={32} />
          <h1 className="text-3xl font-bold text-white">
            {t('title', { number: order.orderNumber })}
          </h1>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('orderInfo.createdAt')}
              </p>
              <p className="text-lg font-semibold dark:text-white">
                {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign
                className="text-green-600 dark:text-green-400"
                size={24}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('orderInfo.price')}
              </p>
              <p className="text-lg font-semibold dark:text-white">
                {formatPrice(order.totalPriceOriginal, order.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.items.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Item Header - FIXED DARK MODE */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {item.topic}
            </h2>
          </div>

          {/* Item Details */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Type size={18} />
                  <span className="text-sm">{t('orderInfo.length')}</span>
                </div>
                <p className="text-lg font-semibold dark:text-white">
                  {item.length} {t('orderInfo.characters')}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Globe size={18} />
                  <span className="text-sm">{t('orderInfo.language')}</span>
                </div>
                <p className="text-lg font-semibold dark:text-white">
                  {translateLanguage(item.language)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <DollarSign size={18} />
                  <span className="text-sm">{t('orderInfo.itemPrice')}</span>
                </div>
                <p className="text-lg font-semibold dark:text-white">
                  {formatPrice(item.price, order.currency)}
                </p>
              </div>
            </div>

            {/* Guidelines */}
            {item.guidelines && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('orderInfo.guidelines')}:
                </h3>
                <TruncatedText
                  text={item.guidelines}
                  showMoreText={t('common.showMore')}
                  showLessText={t('common.showLess')}
                  limit={200}
                  className="text-gray-700 dark:text-gray-300"
                  containerClassName=""
                />
              </div>
            )}

            {/* Content Section with Editor */}
            {item.content && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('content.generatedContent')}
                  </h3>
                  <ContentActions
                    content={
                      editingItemId === item._id ? editedContent : item.content
                    }
                    topic={item.topic}
                    orderId={order._id} // ✅ DODAJ TO
                    isEditing={editingItemId === item._id}
                    onEditToggle={() =>
                      handleEditToggle(item._id || '', item.content || '')
                    }
                    onSave={handleSaveContent}
                    onCancel={handleCancelEdit}
                    isSaving={isSaving}
                    contentType={item.contentType}
                  />
                </div>
                {/* Strona tytułowa - TYLKO dla prac akademickich */}
                {order.items.some(
                  (item) =>
                    item.contentType === 'licencjacka' ||
                    item.contentType === 'magisterska'
                ) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {t('titlePage.title')}
                        </h3>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('titlePage.description')}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setShowTitlePageEditor(!showTitlePageEditor)
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FileText size={18} />
                        {showTitlePageEditor
                          ? t('titlePage.hideForm')
                          : t('titlePage.showForm')}
                      </button>
                    </div>

                    {showTitlePageEditor && (
                      <div className="mt-6">
                        <TitlePageEditor
                          orderId={order._id}
                          onSave={() => {
                            alert(t('titlePage.dataSaved'));
                          }}
                          onClose={() => setShowTitlePageEditor(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-inner">
                  <ContentSection
                    content={
                      editingItemId === item._id ? editedContent : item.content
                    }
                    isEditing={editingItemId === item._id}
                    onContentChange={setEditedContent}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Attachments Section */}
      {hasAttachments(order) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={24} />
            {t('attachments.title')}
          </h2>

          {/* User Attachments */}
          {order.userAttachments && order.userAttachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {t('attachments.userAttachments')}
              </h3>
              <div className="space-y-2">
                {order.userAttachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <FileText size={20} className="text-blue-500" />
                    <span className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
                      {attachment.filename}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Attachments */}
          {((order.attachments && Object.keys(order.attachments).length > 0) ||
            (order.completedStatusFiles &&
              order.completedStatusFiles.length > 0)) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {t('attachments.serviceAttachments')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                          {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                        </h4>
                        <ul className="space-y-2">
                          {attachment &&
                            (Array.isArray(attachment) ? (
                              attachment.map((file, index) => (
                                <li key={index}>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                  >
                                    <FileText size={16} />
                                    <span className="text-sm">
                                      {file.filename}
                                    </span>
                                  </a>
                                </li>
                              ))
                            ) : (
                              <li>
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                  <FileText size={16} />
                                  <span className="text-sm">
                                    {attachment.filename}
                                  </span>
                                </a>
                              </li>
                            ))}
                          {completedFiles &&
                            completedFiles.map((file, index) => (
                              <li key={`completed-${index}`}>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                  <FileText size={16} />
                                  <span className="text-sm">
                                    {file.filename}
                                  </span>
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
          )}
        </div>
      )}
    </div>
  );
}
