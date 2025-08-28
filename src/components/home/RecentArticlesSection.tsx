// src/components/home/RecentArticlesSection.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Article {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage: string;
    categorySlug: string;
    slug: string;
}


const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

const RecentArticlesSection: React.FC<{ articles: Article[] }> = ({ articles }) => {

    const { theme } = useTheme();

    return (
        <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="container mx-auto px-4">
                <motion.h2
                    className={`text-3xl md:text-4xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-[#1f2937]'
                        }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Najnowsze artykuły
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article: Article, index: number) => (
                        <motion.div
                            key={article._id}
                            className={`rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={`/blog/${article.categorySlug}/${article.slug}`}>
                                <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="w-full h-48 object-cover transition-transform duration-300 transform hover:scale-105"
                                />
                            </Link>
                            <div className="p-6">
                                <Link href={`/blog/${article.categorySlug}/${article.slug}`}>
                                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white hover:text-[#38c775]' : 'text-[#1f2937] hover:text-[#38c775]'
                                        } transition-colors duration-300`}>
                                        {article.title}
                                    </h3>
                                </Link>
                                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    {article.excerpt ? article.excerpt : stripHtml(article.content).split(' ').slice(0, 10).join(' ') + '...'}
                                </p>
                                <Link href={`/blog/${article.categorySlug}/${article.slug}`} className={`inline-flex items-center ${theme === 'dark' ? 'text-[#38c775] hover:text-[#2ea55f]' : 'text-[#38c775] hover:text-[#2ea55f]'
                                    }`}>
                                    Czytaj więcej
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Link href="/blog" className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full ${theme === 'dark'
                        ? 'text-white bg-[#38c775] hover:bg-[#2ea55f]'
                        : 'text-white bg-[#38c775] hover:bg-[#2ea55f]'
                        } transition duration-300 ease-in-out shadow-lg hover:shadow-xl`}>
                        Zobacz wszystkie artykuły
                        <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RecentArticlesSection;