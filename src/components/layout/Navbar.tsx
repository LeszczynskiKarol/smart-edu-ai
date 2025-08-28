// src/components/layout/Navbar.tsx
'use client'

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import MobileMenu from './MobileMenu';
import { useTranslations } from 'next-intl';

const Navbar = () => {
    const { theme } = useTheme();
    const t = useTranslations('Navigation');

    return (
        <header className={`fixed w-full z-50 ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            SmartCopy.AI
                        </span>
                    </Link>

                    {/* Desktop Navigation - hidden on mobile */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link href="/services" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                            {t('services')}
                        </Link>
                        <Link href="/pricing" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                            {t('pricing')}
                        </Link>
                        <Link href="/about" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                            {t('about')}
                        </Link>
                        <Link href="/login" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                            {t('login')}
                        </Link>
                        <Link
                            href="/register"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            {t('register')}
                        </Link>
                    </nav>

                    {/* Mobile Menu */}
                    <MobileMenu />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
