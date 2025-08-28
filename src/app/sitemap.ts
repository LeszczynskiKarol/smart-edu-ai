// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.smart-edu.ai';

  // Strony główne - najwyższy priorytet
  const mainPages = ['pl', 'en'].map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
    alternateRefs: [
      { href: `${baseUrl}/pl`, hreflang: 'pl' },
      { href: `${baseUrl}/en`, hreflang: 'en' },
    ],
  }));

  // Strony funkcjonalne - wysoki priorytet
  const functionalPages = [
    'login',
    'register',
    'student-writer-report-generator',
  ].flatMap((page) =>
    ['pl', 'en'].map((lang) => ({
      url: `${baseUrl}/${lang}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternateRefs: [
        { href: `${baseUrl}/pl/${page}`, hreflang: 'pl' },
        { href: `${baseUrl}/en/${page}`, hreflang: 'en' },
      ],
    }))
  );

  // Strony kategorii głównych
  const mainCategories = ['university', 'secondary', 'primary'].flatMap(
    (category) =>
      ['pl', 'en'].map((lang) => ({
        url: `${baseUrl}/${lang}/examples/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternateRefs: [
          { href: `${baseUrl}/pl/examples/${category}`, hreflang: 'pl' },
          { href: `${baseUrl}/en/examples/${category}`, hreflang: 'en' },
        ],
      }))
  );

  // Podkategorie
  const subCategories = [
    'finance',
    'philosophy',
    'law',
    'linguistics',
    'biology',
    'society',
    'history',
    'presentation',
    'composition',
    'paper',
    'literature',
    'biography',
    'essay',
  ].flatMap((subCategory) =>
    ['pl', 'en'].flatMap((lang) =>
      ['university', 'secondary', 'primary'].map((category) => ({
        url: `${baseUrl}/${lang}/examples/${category}/${subCategory}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternateRefs: [
          {
            href: `${baseUrl}/pl/examples/${category}/${subCategory}`,
            hreflang: 'pl',
          },
          {
            href: `${baseUrl}/en/examples/${category}/${subCategory}`,
            hreflang: 'en',
          },
        ],
      }))
    )
  );

  // Wszystkie konkretne artykuły
  const articlePaths = [
    '/examples/university/analysis/biology/the-impact-of-nitrogen-content-in-soil-on-growth-and-yields-of-common-bean-phaseolus-vulgaris',
    '/examples/university/essay/finance/pension-system-in-united-states-study-paper',
    '/examples/secondary/essay/history/educational-system-in-ancient-persia-essay',
    '/examples/primary/biography/history/nicolaus-copernicus-biography-facts-informations',
    '/examples/university/paper/linguistics/linguistic-determinants-in-language-teaching-methodology-a-paper',
    '/examples/secondary/composition/society/the-integration-of-the-modern-european-union-from-world-war-ii-to-the-maastricht-treaty',
    '/examples/secondary/paper/history/history-of-inventions-paper',
    '/examples/university/essay/law/forms-of-trademark-infringement-on-the-internet-essay',
    '/examples/university/essay/philosophy/why-study-philosophy-is-important-essay',
    '/examples/primary/essay/literature/characteristic-of-bilbo-baggins-in-the-hobbit-analysis',
    '/examples/secondary/presentation/biology/cell-structure-and-functions',
  ];

  const articles = articlePaths.flatMap((article) =>
    ['pl', 'en'].map((lang) => ({
      url: `${baseUrl}/${lang}${article}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternateRefs: [
        {
          href: `${baseUrl}/pl${article}`,
          hreflang: 'pl',
        },
        {
          href: `${baseUrl}/en${article}`,
          hreflang: 'en',
        },
      ],
    }))
  );

  // Dodatkowe strony kategorii
  const additionalCategories = ['/examples'].flatMap((category) =>
    ['pl', 'en'].map((lang) => ({
      url: `${baseUrl}/${lang}${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternateRefs: [
        { href: `${baseUrl}/pl${category}`, hreflang: 'pl' },
        { href: `${baseUrl}/en${category}`, hreflang: 'en' },
      ],
    }))
  );

  return [
    ...mainPages,
    ...functionalPages,
    ...mainCategories,
    ...subCategories,
    ...articles,
    ...additionalCategories,
  ];
}
