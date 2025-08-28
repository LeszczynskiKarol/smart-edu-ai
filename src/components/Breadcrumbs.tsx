// src/components/Breadcrumbs.tsx
'use client';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useParams } from 'next/navigation';

export const Breadcrumbs = ({
  items,
}: {
  items: { label: string; href?: string }[];
}) => {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <nav aria-label="breadcrumb" className="w-full">
      <div className="flex items-center flex-wrap gap-y-2 text-sm">
        <Link
          href={`/${locale}`}
          className="text-gray-500 hover:text-gray-700 shrink-0"
        >
          <Home size={16} />
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center min-w-0">
            <span className="mx-2 text-gray-400 shrink-0">/</span>
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 hover:underline truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 truncate">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};
