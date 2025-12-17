// src/components/composition/FAQSection.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';

const FAQSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');
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
    {
      questionKey: 'faq.questions.q7.question',
      answerKey: 'faq.questions.q7.answer',
    },
  ];

  return (
    <section
      className={`py-24 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6"
          >
            <HelpCircle className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
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

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gray-900 border border-gray-700'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full p-6 flex items-center justify-between text-left transition-colors ${
                  openIndex === index
                    ? theme === 'dark'
                      ? 'bg-purple-900/20'
                      : 'bg-purple-50'
                    : ''
                }`}
              >
                <span
                  className={`font-semibold pr-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t(faq.questionKey)}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    openIndex === index
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
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
                      className={`px-6 pb-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
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
      </div>
    </section>
  );
};

export default FAQSection;
