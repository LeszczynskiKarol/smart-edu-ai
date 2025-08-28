// src/components/layout/Footer.tsx
'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import PrivacyModal from '../privacy/PrivacyModal';
import { useRouter, useParams } from 'next/navigation';

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const router = useRouter();
  const params = useParams();
  const { locale } = params;
  const { trackEvent } = useHomeTracking('Footer');
  const footerRef = useRef<HTMLElement>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleLinkClick = (linkType: string) => {
    trackEvent('interaction', {
      action: 'footer_link_click',
      linkType,
      timestamp: new Date().toISOString(),
    });
  };

  const handlePrivacyClick = () => {
    trackEvent('interaction', {
      action: 'privacy_policy_open',
      timestamp: new Date().toISOString(),
    });
    router.push(`/${locale}/privacy`);
  };

  const handleTermsClick = () => {
    trackEvent('interaction', {
      action: 'terms_of_service_click',
      timestamp: new Date().toISOString(),
    });
    router.push(`/${locale}/terms`);
  };

  return (
    <>
      <footer ref={footerRef} className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('companyName')}</h3>
              <p>{t('description')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
              <div className="grid grid-cols-2 gap-x-14 gap-y-2">
                <Link
                  href={`/${locale}/register`}
                  className="hover:text-gray-300"
                  onClick={() => handleLinkClick('register')}
                >
                  {t('links.register')}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className="hover:text-gray-300"
                  onClick={() => handleLinkClick('login')}
                >
                  {t('links.login')}
                </Link>
                <Link
                  href={`/${locale}/examples`}
                  className="hover:text-gray-300"
                  onClick={() => handleLinkClick('examples')}
                >
                  {t('links.example')}
                </Link>
                <Link
                  href={`/${locale}/student-writer-report-generator`}
                  className="hover:text-gray-300"
                  onClick={() => handleLinkClick('paperAI')}
                >
                  {t('links.paper')}
                </Link>
                <Link
                  href={`/${locale}/composition`}
                  className="hover:text-gray-300"
                  onClick={() => handleLinkClick('compositionWriter')}
                >
                  {t('links.composition')}
                </Link>
                <Link
                  href={`/${locale}/ai-paper-writer`}
                  className="hover:text-gray-300"
                  onClick={() => handleLinkClick('compositionWriter')}
                >
                  {t('links.writerPaper')}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t('contact.title')}
              </h3>
              <ul className="space-y-2">
                <li
                  onClick={handlePrivacyClick}
                  className="flex items-center gap-2 cursor-pointer transition-colors duration-200 ease-in-out hover:text-gray-300 group"
                >
                  <span className="hover:underline">
                    {t('contact.privacy')}
                  </span>
                </li>
                <li
                  onClick={handleTermsClick}
                  className="flex items-center gap-2 cursor-pointer transition-colors duration-200 ease-in-out hover:text-gray-300 group"
                >
                  <span className="hover:underline">{t('contact.terms')}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>
              &copy; {new Date().getFullYear()} {t('companyName')}.{' '}
              {t('copyright')}
            </p>
          </div>
        </div>
      </footer>

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </>
  );
};

export default Footer;
