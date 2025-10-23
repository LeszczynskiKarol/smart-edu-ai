// src/components/bachelors/FAQSection.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('BachelorsThesis');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      questionKey: 'faq.questions.q1.question',
      answerKey: 'faq.questions.q1.answer',
    },
    {
      questionKey: 'faq.questions.q2.question',
      answerKey: 'faq.questions.q2.answer',
    },
    {
      questionKey: 'faq.questions.q3.question',
      answerKey: 'faq.questions.q3.answer',
    },
    {
      questionKey: 'faq.questions.q4.question',
      answerKey: 'faq.questions.q4.answer',
    },
    {
      questionKey: 'faq.questions.q5.question',
      answerKey: 'faq.questions.q5.answer',
    },
    {
      questionKey: 'faq.questions.q6.question',
      answerKey: 'faq.questions.q6.answer',
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-b from-white via-gray-50 to-white'
      }`}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
          >
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {t('faq.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('faq.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('faq.subtitle')}
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${
                  openIndex === index
                    ? theme === 'dark'
                      ? 'bg-gray-700/50'
                      : 'bg-blue-50'
                    : ''
                }`}
              >
                <h3
                  className={`text-lg font-semibold pr-8 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t(faq.questionKey)}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`px-6 py-5 ${
                        theme === 'dark'
                          ? 'text-gray-300 border-t border-gray-700'
                          : 'text-gray-600 border-t border-gray-200'
                      }`}
                    >
                      {t(faq.answerKey)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mt-12 max-w-4xl mx-auto text-center p-8 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3
            className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('faq.contact.title')}
          </h3>
          <p
            className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('faq.contact.description')}
          </p>

          <a
            href="mailto:support@smart-edu.ai"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            {t('faq.contact.button')}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
