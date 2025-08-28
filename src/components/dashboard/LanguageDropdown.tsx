// src/components/dashboard/LanguageDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '../../context/ThemeContext';

interface LanguageDropdownProps {
    changeLanguage: (lang: string) => void;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ changeLanguage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAbove, setShowAbove] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const locale = useLocale();
    const t = useTranslations('dashboard');
    const { theme } = useTheme();



    const languages = [
        { code: 'pl', name: 'Polski' },
        { code: 'en', name: 'English' },
    ];

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const checkPosition = () => {
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const shouldShowAbove = rect.bottom > window.innerHeight - 100; // 100px margin
                setShowAbove(shouldShowAbove);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        checkPosition();
        window.addEventListener('resize', checkPosition);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', checkPosition);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <Globe className="w-5 h-5 mr-2" />
                {t('changeLanguage')}
            </button>
            <div
                className={`absolute ${showAbove ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95 pointer-events-none'
                    }`}
            >
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    {languages.map((lang) => (
                        <a
                            key={lang.code}
                            href="#"
                            className={`flex items-center justify-between px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                } transition-colors duration-200`}
                            role="menuitem"
                            onClick={(e) => {
                                e.preventDefault();
                                changeLanguage(lang.code);
                                setIsOpen(false);
                            }}
                        >
                            {lang.name}
                            {locale === lang.code && <Check className="w-4 h-4" />}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageDropdown; 