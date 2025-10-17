// src/components/examples/TableOfContents.tsx
'use client';

import { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  locale: string;
  mobile?: boolean;
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
}

export default function TableOfContents({
  content,
  locale,
  mobile = false,
  isExpanded,
  setIsExpanded,
}: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(!mobile);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      heading.id = id;
      items.push({ id, text, level });
    });

    setTocItems(items);

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const realHeadings = document.querySelectorAll(
          '.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6'
        );
        realHeadings.forEach((heading, index) => {
          heading.id = `heading-${index}`;
        });
      }, 100);
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    const headings = document.querySelectorAll(
      '.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6'
    );
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    // ✅ KROK 1: Jeśli treść jest zwinięta, rozwiń ją
    if (setIsExpanded && !isExpanded) {
      setIsExpanded(true);

      // ✅ KROK 2: Poczekaj na renderowanie rozwiniętej treści, potem scrolluj
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 120;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100);
    } else {
      // ✅ KROK 3: Jeśli już rozwinięta, scrolluj normalnie
      const element = document.getElementById(id);
      if (element) {
        const offset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }

    if (mobile) {
      setIsOpen(false);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  const title = locale === 'pl' ? 'Spis treści' : 'Table of Contents';

  if (mobile) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            {title}
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {isOpen && (
          <nav className="p-4 pt-0">
            <ul className="space-y-1">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left py-2 px-3 rounded transition-colors text-sm ${
                      activeId === item.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    );
  }

  return (
    <div className="sticky top-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-900 dark:text-white">
          <List className="w-5 h-5" />
          {title}
        </h3>
        <nav className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <ul className="space-y-1">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left py-2 px-3 rounded transition-colors text-sm ${
                    activeId === item.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium border-l-2 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
