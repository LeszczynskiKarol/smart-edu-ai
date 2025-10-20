// src/components/home/FAQSection_new.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const FAQSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('FAQSection');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t('faq1.question'),
      answer: t('faq1.answer'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      question: t('faq2.question'),
      answer: t('faq2.answer'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      question: t('faq3.question'),
      answer: t('faq3.answer'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      question: t('faq4.question'),
      answer: t('faq4.answer'),
      color: 'from-orange-500 to-red-500',
    },
    {
      question: t('faq5.question'),
      answer: t('faq5.answer'),
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${
              theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            } 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 right-0 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-1/4 left-0 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-400/10'
          } rounded-full blur-3xl`}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left: Header & Visual */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
              >
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <span
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  FAQ
                </span>
              </motion.div>

              {/* Title */}
              <h2
                className={`text-4xl md:text-5xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('title')}
              </h2>
              <p
                className={`text-xl ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('subtitle')}
              </p>

              {/* Visual Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`mt-8 rounded-3xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200'
                } p-8 shadow-xl`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Potrzebujesz pomocy?
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Jesteśmy tu dla Ciebie
                    </p>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="space-y-3">
                  {[
                    { label: 'Email Support', value: 'support@smart-edu.ai' },
                    { label: 'Czas odpowiedzi', value: '< 24 godziny' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/70'
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Skontaktuj się
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                    openIndex === index
                      ? theme === 'dark'
                        ? 'bg-gray-800 shadow-2xl ring-2 ring-blue-500/50'
                        : 'bg-white shadow-2xl ring-2 ring-blue-500/50'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 hover:bg-gray-800'
                        : 'bg-white hover:shadow-lg'
                  } ${theme === 'dark' ? 'border border-gray-700' : 'border border-gray-200'}`}
                >
                  {/* Gradient Accent - Only visible when open */}
                  {openIndex === index && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${faq.color}`}
                    />
                  )}

                  {/* Question Button */}
                  <button
                    className="w-full p-6 text-left flex items-start justify-between gap-4 transition-all"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    {/* Left: Icon + Question */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Number Badge */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                          openIndex === index
                            ? `bg-gradient-to-br ${faq.color} shadow-lg`
                            : theme === 'dark'
                              ? 'bg-gray-700'
                              : 'bg-gray-200 text-gray-600'
                        } transition-all`}
                      >
                        {openIndex === index ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Question Text */}
                      <h3
                        className={`text-lg font-semibold pr-4 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>

                    {/* Right: Chevron */}
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          openIndex === index
                            ? `bg-gradient-to-br ${faq.color}`
                            : theme === 'dark'
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                        } transition-all`}
                      >
                        <ChevronDown
                          className={`w-5 h-5 ${
                            openIndex === index
                              ? 'text-white'
                              : theme === 'dark'
                                ? 'text-blue-400'
                                : 'text-blue-600'
                          }`}
                        />
                      </div>
                    </motion.div>
                  </button>

                  {/* Answer */}
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
                          className={`px-6 pb-6 pl-20 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="leading-relaxed"
                          >
                            {faq.answer}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
