// src/components/examples/RelatedExamples.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Example } from '@/types/example';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  currentExample: Example;
  relatedExamples: Example[];
};

export function RelatedExamples({ currentExample, relatedExamples }: Props) {
  const t = useTranslations('examples');
  const { theme } = useTheme();

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t('relatedExamples')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedExamples.map((example) => (
          <Link
            key={example._id}
            href={`/examples/${example.level}/${example.workType.slugEn}/${example.subject.slugEn}/${example.slugEn}`}
            className={`p-4 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            } shadow`}
          >
            <h3 className="font-semibold mb-2">{example.title}</h3>
            <p className="text-sm text-gray-500">
              {example.subject.name} • {example.workType.name} •{' '}
              {example.length} {t('words')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
