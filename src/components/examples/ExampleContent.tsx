// src/components/examples/ExampleContent.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Copy,
  Code,
  FileDown,
  FileText,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import ShareModal from './ShareModal';

interface ExampleContentProps {
  content: string;
  title: string;
  locale: string;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
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

const addIdsToHeadings = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((heading, index) => {
    heading.id = `heading-${index}`;
  });

  return doc.body.innerHTML;
};

export default function ExampleContent({
  content,
  title,
  locale,
  isExpanded,
  setIsExpanded,
}: ExampleContentProps) {
  const t = useTranslations('examples');
  const [copySuccess, setCopySuccess] = useState<'text' | 'html' | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const previewLength = 1000;
  const [isDownloading, setIsDownloading] = useState(false);
  const contentWithIds = useMemo(() => addIdsToHeadings(content), [content]);

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

  const handleCopyFormatted = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([content], { type: 'text/html' }),
          'text/plain': new Blob([stripHtml(content)], { type: 'text/plain' }),
        }),
      ]);
      setCopySuccess('text');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess('html');
      setTimeout(() => setCopySuccess(null), 2000);
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

    setIsDownloading(true);
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
            topic: title, // ✅ POPRAWIONE: Przekazujemy title jako topic
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title || 'example'}.pdf`; // ✅ POPRAWIONE: Używamy title
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate PDF:', await response.text());
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        locale === 'pl'
          ? 'Błąd podczas generowania PDF'
          : 'Error generating PDF'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDOCX = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (isDownloading) {
      console.log('⏳ Już pobieram DOCX, czekaj...');
      return;
    }

    if (!content) return;

    setIsDownloading(true);
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
            topic: title, // ✅ POPRAWIONE: Przekazujemy title jako topic
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title || 'example'}.docx`; // ✅ POPRAWIONE: Używamy title
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate DOCX:', await response.text());
        throw new Error('Failed to generate DOCX');
      }
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert(
        locale === 'pl'
          ? 'Błąd podczas generowania DOCX'
          : 'Error generating DOCX'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="relative">
      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={handleCopyFormatted}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
          title={t('copyToClipboard')}
        >
          <Copy size={18} />
          <span className="text-sm font-medium">
            {locale === 'pl' ? 'Kopiuj' : 'Copy'}
          </span>
        </button>

        <button
          onClick={handleCopyHTML}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
          title={t('copyHTML')}
        >
          <Code size={18} />
          <span className="text-sm font-medium">HTML</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('downloadPDF')}
        >
          <FileDown size={18} />
          <span className="text-sm font-medium">
            {isDownloading
              ? locale === 'pl'
                ? 'Pobieranie...'
                : 'Downloading...'
              : 'PDF'}
          </span>
        </button>

        <button
          onClick={handleDownloadDOCX}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('downloadDOCX')}
        >
          <FileText size={18} />
          <span className="text-sm font-medium">
            {isDownloading
              ? locale === 'pl'
                ? 'Pobieranie...'
                : 'Downloading...'
              : 'DOCX'}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          title={locale === 'pl' ? 'Udostępnij' : 'Share'}
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">
            {locale === 'pl' ? 'Udostępnij' : 'Share'}
          </span>
        </button>
      </div>

      {/* Copy Success Message */}
      {copySuccess && (
        <div className="fixed top-4 right-4 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg z-50 animate-fade-in">
          {copySuccess === 'html'
            ? locale === 'pl'
              ? 'HTML skopiowany!'
              : 'HTML copied!'
            : locale === 'pl'
              ? 'Skopiowano!'
              : 'Copied!'}
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={title}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        description={stripHtml(content).substring(0, 200)}
        locale={locale}
      />

      {/* Content */}
      <div className="article-content generated-content prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
        <div
          className="[&_*]:text-gray-800 [&_*]:dark:text-gray-200 [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_strong]:text-gray-900 [&_strong]:dark:text-white"
          dangerouslySetInnerHTML={{
            __html: isExpanded
              ? contentWithIds
              : truncateToWord(contentWithIds, previewLength),
          }}
        />
      </div>

      {/* Show More/Less Button */}
      {content.length > previewLength && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shadow-sm"
          >
            <span className="text-sm font-medium">
              {isExpanded
                ? locale === 'pl'
                  ? 'Pokaż mniej'
                  : 'Show less'
                : locale === 'pl'
                  ? 'Pokaż więcej'
                  : 'Show more'}
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
}
