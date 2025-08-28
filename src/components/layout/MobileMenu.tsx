// src/components/layout/MobileMenu.tsx
'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';

const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    const t = useTranslations('Navigation');

    const menuItems = [
        { href: '/', label: t('home') },
        { href: '/services', label: t('services') },
        { href: '/pricing', label: t('pricing') },
        { href: '/about', label: t('about') },
        { href: '/register', label: t('register') },
        { href: '/login', label: t('login') },
    ];

    return (
        <div className="lg:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`absolute top-full right-0 left-0 z-50 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                            }`}
                    >
                        <nav className="container mx-auto px-4 py-4">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`block py-3 px-4 text-lg ${theme === 'dark'
                                                ? 'text-white hover:bg-gray-700'
                                                : 'text-gray-800 hover:bg-gray-100'
                                            } rounded-lg transition-colors duration-200`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileMenu;
