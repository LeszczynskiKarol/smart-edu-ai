// src/components/OrderWorkCommencedModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Clock, Mail, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface OrderWorkCommencedModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimatedTime: string;
  orderNumber: string;
}

const OrderWorkCommencedModal: React.FC<OrderWorkCommencedModalProps> = ({
  isOpen,
  onClose,
  estimatedTime,
  orderNumber,
}) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="flex justify-center mb-4"
                >
                  <div
                    className={`rounded-full p-3 ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                    }`}
                  >
                    <Rocket
                      size={48}
                      className={
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }
                    />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-2xl font-bold text-center mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Rozpoczynamy pracę!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-center mb-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Zamówienie{' '}
                  <span className="font-semibold">#{orderNumber}</span>
                </motion.p>

                {/* Info Cards */}
                <div className="space-y-3 mb-6">
                  {/* Estimated Time Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`flex items-start gap-3 p-4 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-blue-900/20 border border-blue-800/30'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100'
                      }`}
                    >
                      <Clock
                        size={20}
                        className={
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold mb-1 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                        }`}
                      >
                        Szacowany czas wykonania
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                        }`}
                      >
                        {estimatedTime}
                      </p>
                    </div>
                  </motion.div>

                  {/* Email Notification Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`flex items-start gap-3 p-4 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-purple-900/20 border border-purple-800/30'
                        : 'bg-purple-50 border border-purple-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-purple-900/40' : 'bg-purple-100'
                      }`}
                    >
                      <Mail
                        size={20}
                        className={
                          theme === 'dark'
                            ? 'text-purple-400'
                            : 'text-purple-600'
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold mb-1 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-900'
                        }`}
                      >
                        Powiadomienie email
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'text-purple-200'
                            : 'text-purple-700'
                        }`}
                      >
                        Otrzymasz wiadomość email gdy Twoje zamówienie zostanie
                        zakończone
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={onClose}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Rozumiem
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderWorkCommencedModal;
