// src/app/[locale]/blog/page.tsx
import { Metadata } from 'next'
import BlogClient from './BlogClient'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Blog | eCopywriting.pl',
  description: 'Najnowsze trendy, porady i inspiracje ze świata copywritingu i content marketingu.',
}

export default function BlogPage() {
  return (
    <Layout title="Blog | eCopywriting.pl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8 text-center text-primary-800">
          Blog eCopywriting.pl
        </h1>
        <BlogClient />
      </div>
    </Layout>
  )
} 
