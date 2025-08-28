// src/components/PageContent.tsx
'use client';

import { motion } from 'framer-motion';

type PageContentProps = {
  title: string;
  content: string;
  metaDescription: string;
};

export default function PageContent({
  title,
  content,
  metaDescription,
}: PageContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-6">{title}</h1>
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </motion.div>
  );
}
