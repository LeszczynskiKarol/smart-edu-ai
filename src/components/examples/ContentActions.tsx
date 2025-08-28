// src/components/examples/ContentActions.tsx
import { useState } from 'react';
import { Share } from 'lucide-react';
import { Copy, FileDown, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useTranslations } from 'next-intl';

export const ContentActions = ({
  content,
  title,
  exampleId,
}: {
  content: string;
  title: string;
  onDownload?: (type: string) => void;
  exampleId: string;
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const { trackEvent } = useAnalytics();
  const t = useTranslations('orderHistory.content');

  const trackInteraction = (actionType: string, metadata = {}) => {
    trackEvent('interaction', {
      component: 'ExampleContent',
      action: actionType,
      exampleId,
      ...metadata,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content.replace(/<[^>]*>/g, ''), // usuwa tagi HTML
          url: window.location.href,
        });
        trackInteraction('content_share', {
          method: 'web_share_api',
          contentLength: content.length,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - kopiowanie linku
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      trackInteraction('content_share', {
        method: 'copy_link',
        contentLength: content.length,
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      trackInteraction('content_copy', { contentLength: content.length });
    } catch (err) {
      console.error('Błąd kopiowania:', err);
    }
  };

  const handleDownloadPDF = async () => {
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

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title || 'przyklad'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        trackInteraction('content_download', {
          format: 'pdf',
          contentLength: content.length,
        });
      }
    } catch (error) {
      console.error('Błąd generowania PDF:', error);
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

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title || 'generated_content'}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        trackInteraction('content_download', {
          format: 'docx',
          contentLength: content.length,
        });
      } else {
        console.error('Failed to generate DOCX:', await response.text());
        throw new Error('Failed to generate DOCX');
      }
    } catch (error) {
      console.error('Error generating DOCX:', error);
    }
  };

  return (
    <div className="flex space-x-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 shadow-sm"
        onClick={handleCopy}
      >
        <Copy className="w-4 h-4 mr-2" />
        {copySuccess ? 'Skopiowano!' : 'Kopiuj'}
      </Button>
      <Button
        variant="outline"
        className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 transition-colors duration-200 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 shadow-sm"
        size="sm"
        onClick={handleDownloadPDF}
      >
        <FileDown className="w-4 h-4 mr-2" />
        PDF
      </Button>
      <Button
        variant="outline"
        className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 transition-colors duration-200 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 shadow-sm"
        size="sm"
        onClick={handleDownloadDOCX}
      >
        <FileDown className="w-4 h-4 mr-2" />
        DOCX
      </Button>
      <Button
        className="p-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-colors duration-200 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 shadow-sm"
        variant="outline"
        size="sm"
        onClick={handleShare}
      >
        <Share className="w-4 h-4 mr-2" />
        {t('share')}
      </Button>
    </div>
  );
};
