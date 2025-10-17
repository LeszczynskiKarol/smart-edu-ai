// src/components/examples/ShareModal.tsx
'use client';

import {
  X,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Link2,
  Check,
} from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
  locale: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  description,
  locale,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const content = {
    pl: {
      title: 'Udostępnij',
      copyLink: 'Kopiuj link',
      copied: 'Skopiowano!',
      close: 'Zamknij',
    },
    en: {
      title: 'Share',
      copyLink: 'Copy link',
      copied: 'Copied!',
      close: 'Close',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {t.title}
        </h3>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
          >
            <Facebook className="w-5 h-5" fill="currentColor" />
            <span className="font-medium">Facebook</span>
          </button>

          {/* Twitter */}
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-all duration-200 transform hover:scale-105"
          >
            <Twitter className="w-5 h-5" fill="currentColor" />
            <span className="font-medium">Twitter</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => handleShare('linkedin')}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-all duration-200 transform hover:scale-105"
          >
            <Linkedin className="w-5 h-5" fill="currentColor" />
            <span className="font-medium">LinkedIn</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-200 transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" fill="currentColor" />
            <span className="font-medium">WhatsApp</span>
          </button>

          {/* Email */}
          <button
            onClick={() => handleShare('email')}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200 transform hover:scale-105 col-span-2"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email</span>
          </button>
        </div>

        {/* Copy Link */}
        <div className="pt-4 border-t dark:border-gray-700">
          <button
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span className="font-medium">{t.copied}</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                <span className="font-medium">{t.copyLink}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
