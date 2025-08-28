// src/app/blog/[category]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'
import { Article } from '@/types/Article'
import BlogLayout from '@/components/layout/BlogLayout'

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getCategoryArticles(categorySlug: string): Promise<Article[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const res = await fetch(`${apiUrl}/api/articles/category/${categorySlug}`, { next: { revalidate: 3600 } })
  if (!res.ok) {
    console.error('Failed to fetch category articles:', await res.text())
    throw new Error('Failed to fetch category articles')
  }
  const data = await res.json()
  if (!data.success) {
    throw new Error('Category not found')
  }
  return data.data
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  return {
    title: `${params.category} | eCopywriting.pl`,
    description: `Artykuły w kategorii ${params.category}`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const articles = await getCategoryArticles(params.category)
    return (
      <BlogLayout title={`Kategoria: ${params.category}`}>
        <CategoryClient articles={articles} category={params.category} />
      </BlogLayout>
    )
  } catch (error) {
    console.error('Error fetching category articles:', error)
    notFound()
  }
}