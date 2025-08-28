// src/components/dashboard/profile/ChangePasswordForm.tsx
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useTranslations } from 'next-intl';
import ModalDialog from '../../ui/ModalDialog';
import { Eye, EyeOff } from 'lucide-react';

type ModalContentType = {
  title: string;
  message: string;
  type: 'info' | 'error' | 'success';
};

const ChangePasswordForm: React.FC = () => {
  const t = useTranslations('profile.changePassword');
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType>({ title: '', message: '', type: 'info' });
  const [showTooltip, setShowTooltip] = useState(false);

  const isFormValid = useMemo(() => {
    return formData.currentPassword &&
      formData.newPassword &&
      formData.confirmNewPassword &&
      formData.newPassword === formData.confirmNewPassword;
  }, [formData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      setModalContent({
        title: t('error.title'),
        message: t('error.mismatch'),
        type: 'error'
      });
      setIsModalOpen(true);
      return;
    }
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setModalContent({
        title: t('success.title'),
        message: t('success.message'),
        type: 'success'
      });
      setIsModalOpen(true);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      setModalContent({
        title: t('error.title'),
        message: error instanceof Error ? error.message : t('error.unknown'),
        type: 'error'
      });
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {key === 'currentPassword' ? t('currentPassword') :
                key === 'newPassword' ? t('newPassword') : t('confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword[key as keyof typeof showPassword] ? "text" : "password"}
                name={key}
                id={key}
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-gray-100"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(key as keyof typeof showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500"
              >
                {showPassword[key as keyof typeof showPassword] ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        ))}
        <div className="relative">
          <button
            type="submit"
            disabled={!isFormValid}
            onClick={(e) => {
              if (!isFormValid) {
                e.preventDefault();
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 2000);
              }
            }}
            className={`w-full font-bold py-2 px-4 rounded transition duration-200 ${isFormValid
              ? 'bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {t('submit')}
          </button>

          <AnimatePresence>
            {showTooltip && !isFormValid && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap"
              >
                {t('noChangesTooltip')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </form>
      <ModalDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </>
  );
};

export default ChangePasswordForm;  