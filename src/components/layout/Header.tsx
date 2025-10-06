// src/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Menu, X, NotebookPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const t = useTranslations('Header');
  const { trackEvent } = useHomeTracking('Header');
  const pathname = usePathname();

  const isHomePage =
    pathname === '/pl' || pathname === '/en' || pathname === '/';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    trackEvent('interaction', {
      action: 'toggle_mobile_menu',
      newState: !isOpen ? 'open' : 'closed',
      viewportWidth: window.innerWidth,
    });
  };

  const handleLinkClick = (destination: string, linkType: string) => {
    trackEvent('navigation', {
      action: 'navigation_click',
      path: pathname,
      destination,
      linkType,
      viewportType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      userType: user ? 'logged_in' : 'guest',
      component: 'Header',
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsOpen(false);
      handleLinkClick(`#${sectionId}`, 'section_scroll');
    }
  };

  const renderContent = () => (
    <>
      <Link
        href="/"
        onClick={() => handleLinkClick('/', 'home')}
        className="flex flex-col group"
      >
        <div className="flex items-center">
          <NotebookPen className="w-8 h-8 mr-2 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
          <span
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} group-hover:text-blue-600 transition duration-300`}
          >
            {t('brandName')}
          </span>
        </div>
        <span
          className={`text-xs font-medium ml-10 -mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          } group-hover:text-blue-500 transition duration-300`}
        >
          {t('tagline')}
        </span>
      </Link>

      <div className="hidden lg:flex space-x-6 items-center">
        {/* Navigation Links - only on homepage */}
        {isHomePage && (
          <>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300 font-medium`}
            >
              {t('howItWorks')}
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300 font-medium`}
            >
              {t('pricing')}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300 font-medium`}
            >
              {t('faq')}
            </button>
          </>
        )}

        {user && (
          <Link
            href="/examples"
            onClick={() => handleLinkClick('/examples', 'examples')}
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300 font-medium`}
          >
            {t('examples')}
          </Link>
        )}

        {user && user.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            onClick={() => handleLinkClick('/admin/dashboard', 'admin_panel')}
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300 font-medium`}
          >
            {t('adminPanel')}
          </Link>
        )}

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-300 dark:border-gray-700">
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => handleLinkClick('/dashboard', 'dashboard')}
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
            >
              {t('customerPanel')}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => handleLinkClick('/login', 'login')}
                className={`px-5 py-2 rounded-full transition duration-300 font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => handleLinkClick('/register', 'register')}
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );

  const MobileMenuLinks = () => (
    <div
      className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
      {/* Navigation Links - only on homepage */}
      {isHomePage && (
        <>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            } transition duration-300`}
          >
            {t('howItWorks')}
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            } transition duration-300`}
          >
            {t('pricing')}
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            } transition duration-300`}
          >
            {t('faq')}
          </button>
          <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>
        </>
      )}

      {user && (
        <Link
          href="/examples"
          onClick={() => handleLinkClick('/examples', 'examples_mobile')}
          className={`block px-3 py-2 rounded-md text-base font-medium ${
            theme === 'dark'
              ? 'text-gray-300 hover:text-white hover:bg-blue-600'
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          } transition duration-300`}
        >
          {t('examples')}
        </Link>
      )}

      {user && user.role === 'admin' && (
        <Link
          href="/admin/dashboard"
          onClick={() =>
            handleLinkClick('/admin/dashboard', 'admin_panel_mobile')
          }
          className={`block px-3 py-2 rounded-md text-base font-medium ${
            theme === 'dark'
              ? 'text-gray-300 hover:text-white hover:bg-blue-600'
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          } transition duration-300`}
        >
          {t('adminPanel')}
        </Link>
      )}

      {user ? (
        <Link
          href="/dashboard"
          onClick={() => handleLinkClick('/dashboard', 'dashboard_mobile')}
          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          {t('customerPanel')}
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            onClick={() => handleLinkClick('/login', 'login_mobile')}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            } transition duration-300`}
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            onClick={() => handleLinkClick('/register', 'register_mobile')}
            className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
          >
            {t('register')}
          </Link>
        </>
      )}
    </div>
  );

  return (
    <motion.header
      className={`fixed w-full z-50 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-md`}
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {renderContent()}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} hover:text-blue-600 transition duration-300`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      <motion.div
        className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
        transition={{ duration: 0.3 }}
      >
        <MobileMenuLinks />
      </motion.div>
    </motion.header>
  );
};

export default Header;
