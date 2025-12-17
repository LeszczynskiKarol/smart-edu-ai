// src/app/[locale]/composition/metadata.ts
import { Metadata } from 'next';

type Locale = 'pl' | 'en';

const metadata: Record<Locale, Metadata> = {
  pl: {
    title:
      'Wypracowanie AI - Generator Wypracowań Online | Sztuczna Inteligencja',
    description:
      'Generator wypracowań AI ✓ Napisz wypracowanie w 5 minut ✓ Interpretacja, charakterystyka, opis ✓ AI do pisania wypracowań ✓ Wszystkie przedmioty ✓ Od 5 zł',
    keywords:
      'wypracowanie ai, generator wypracowań, ai wypracowanie, wypracowanie generator, napisz wypracowanie ai, sztuczna inteligencja wypracowanie, wypracowanie z polskiego ai, generator wypracowań online, wypracowanie na zamówienie, ai do wypracowań',
    alternates: {
      canonical: '/pl/composition',
      languages: {
        pl: '/pl/composition',
        en: '/en/composition',
      },
    },
    openGraph: {
      title: 'Wypracowanie AI - Generator Wypracowań Online',
      description:
        'Wygeneruj profesjonalne wypracowanie w 5 minut. AI napisze interpretację, charakterystykę lub opis na każdy temat.',
      type: 'website',
      locale: 'pl_PL',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Wypracowanie AI - Generator Wypracowań',
      description:
        'Napisz wypracowanie ze sztuczną inteligencją w 5 minut. Wszystkie przedmioty i rodzaje wypracowań.',
    },
  },
  en: {
    title: 'AI Essay Writer - Online Essay Generator | Artificial Intelligence',
    description:
      'AI Essay Generator ✓ Write essays in 5 minutes ✓ Interpretation, character analysis, description ✓ AI essay writing ✓ All subjects ✓ From $2',
    keywords:
      'ai essay writer, essay generator, ai essay, essay generator online, write essay ai, artificial intelligence essay, essay writing ai, online essay generator, essay on demand, ai for essays',
    alternates: {
      canonical: '/en/composition',
      languages: {
        pl: '/pl/composition',
        en: '/en/composition',
      },
    },
    openGraph: {
      title: 'AI Essay Writer - Online Essay Generator',
      description:
        'Generate a professional essay in 5 minutes. AI will write interpretation, character analysis or description on any topic.',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Essay Writer - Essay Generator',
      description:
        'Write an essay with artificial intelligence in 5 minutes. All subjects and essay types.',
    },
  },
};

export const getMetadata = (locale: string): Metadata => {
  return metadata[locale as Locale] || metadata.pl;
};
