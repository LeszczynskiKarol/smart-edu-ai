// src/components/examples/SignupBanner.tsx
import { useTranslations } from 'next-intl';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightCircle, UserPlus } from 'lucide-react';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { useParams } from 'next/navigation';

export function SignupBanner() {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const { trackEvent } = useHomeTracking('ExamplePage');
  const params = useParams();

  const handleSignUpClick = () => {
    trackEvent('click', {
      component: 'SignupBanner',
      source: 'example_page',
      exampleId: params.slug,
      path: window.location.pathname,
    });
  };

  return (
    <div
      className={`sticky top-24 p-6 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r blue-500 to-purple-500 bg-clip-text flex items-center">
        {t('signup.banner.title')}
      </h3>
      <p className="text-sm mb-6 text-gray-600 dark:text-gray-300">
        {t('signup.banner.description')}
      </p>
      <Link href="/register" onClick={handleSignUpClick}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white group relative overflow-hidden">
            <span className="flex items-center justify-center gap-2 group-hover:translate-x-[-8px] transition-transform">
              {t('signup.banner.cta')}
              <ArrowRightCircle className="w-5 h-5 transform group-hover:translate-x-[16px] transition-transform" />
            </span>
          </Button>
        </motion.div>
      </Link>
    </div>
  );
}
