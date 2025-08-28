// src/components/ui/ModalDialog.tsx
import React from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

const ModalDialog: React.FC<ModalDialogProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gray-800 dark:bg-gray-900 text-green-400 dark:text-green-300 border-green-700 dark:border-green-800';
      case 'error':
        return 'bg-gray-800 dark:bg-gray-900 text-red-400 dark:text-red-300 border-red-700 dark:border-red-800';
      default:
        return 'bg-gray-800 dark:bg-gray-900 text-blue-400 dark:text-blue-300 border-blue-700 dark:border-blue-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className={`rounded-lg shadow-xl max-w-md w-full ${getTypeStyles()} border dark:border-opacity-20`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-opacity-20 dark:border-opacity-20">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p>{message}</p>
            </div>
            <div className="flex justify-end p-4 bg-white/10 dark:bg-black/10 rounded-b-lg">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-150 ease-in-out"
              >
                <ArrowLeft />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalDialog;  