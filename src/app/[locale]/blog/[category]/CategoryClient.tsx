// src/app/blog/[category]/CategoryClient.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Article } from '@/types/Article'

interface CategoryClientProps {
  articles: Article[]
  category: string
}

export default function CategoryClient({ articles, category }: CategoryClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">Artykuły w kategorii: {category}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <motion.div
            key={article._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <Link href={`/blog/${category}/${article.slug}`}>
              <img src={article.featuredImage} alt={article.title} className="w-full h-48 object-cover" />
            </Link>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/blog/${category}/${article.slug}`} className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300">
                  {article.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{article.excerpt}</p>
              <Link href={`/blog/${category}/${article.slug}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300">
                Czytaj więcej →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}