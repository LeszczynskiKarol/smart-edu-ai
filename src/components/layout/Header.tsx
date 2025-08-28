// src/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Menu, X, NotebookPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const t = useTranslations('Header');
  const { trackEvent } = useHomeTracking('Header');

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
      path: window.location.pathname,
      destination,
      linkType,
      viewportType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      userType: user ? 'logged_in' : 'guest',
      component: 'Header',
    });
  };

  const renderContent = () => (
    <>
      <Link
        href="/"
        onClick={() => handleLinkClick('/', 'home')}
        className={`flex items-center text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} hover:text-blue-600 transition duration-300`}
      >
        <NotebookPen className="w-8 h-8 mr-2 text-blue-600" />
        {t('brandName')}
      </Link>
      <div className="hidden md:flex space-x-4 items-center">
        {user && (
          <Link
            href="/examples"
            onClick={() => handleLinkClick('/examples', 'examples')}
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300 mr-4`}
          >
            {t('examples')}
          </Link>
        )}
        {user && user.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            onClick={() => handleLinkClick('/admin/dashboard', 'admin_panel')}
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 transition duration-300`}
          >
            {t('adminPanel')}
          </Link>
        )}
        {user ? (
          <Link
            href="/dashboard"
            onClick={() => handleLinkClick('/dashboard', 'dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
          >
            {t('customerPanel')}
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => handleLinkClick('/login', 'login')}
              className={`bg-gray-200 text-gray-800 px-4 py-2 rounded-full transition duration-300 ${
                theme === 'dark'
                  ? 'dark:bg-gray-700 dark:text-white dark:hover:bg-blue-600'
                  : 'hover:bg-blue-100'
              }`}
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              onClick={() => handleLinkClick('/register', 'register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              {t('register')}
            </Link>
          </>
        )}
      </div>
    </>
  );

  const MobileMenuLinks = () => (
    <div
      className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
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
                ? 'text-gray-300 hover:text-white hover:bg-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
      className={`fixed w-full z-50 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-md mb-8`}
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-2">
        <div className="flex justify-between items-center">
          {renderContent()}
          <div className="md:hidden flex items-center">
            {/*<button
              onClick={toggleTheme}
              className={`p-2 rounded-full mr-2 ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
              title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>*/}
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
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
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
