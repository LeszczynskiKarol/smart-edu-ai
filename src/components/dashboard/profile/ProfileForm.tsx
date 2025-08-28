// src/components/dashboard/profile/ProfileForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import ModalDialog from '../../ui/ModalDialog';
import { UserData, ProfileTranslations } from '@/types/translations';

interface ProfileFormProps {
  user: UserData;
  messages: {
    profile: ProfileTranslations;
  };
}

type ModalContentType = {
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
};

const ProfileForm: React.FC<ProfileFormProps> = ({ user, messages }) => {
  const { updateProfile, refreshUserData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType>({
    title: '',
    message: '',
    type: 'info'
  });

  const initialFormData = {
    name: user.name,
    companyName: user.companyDetails?.companyName || '',
    nip: user.companyDetails?.nip || '',
    address: user.companyDetails?.address || '',
    buildingNumber: user.companyDetails?.buildingNumber || '',
    postalCode: user.companyDetails?.postalCode || '',
    city: user.companyDetails?.city || '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);

  // Sprawdzanie zmian w formularzu
  const checkForChanges = useMemo(() => {
    return (
      formData.name !== initialFormData.name ||
      formData.companyName !== initialFormData.companyName ||
      formData.nip !== initialFormData.nip ||
      formData.address !== initialFormData.address ||
      formData.buildingNumber !== initialFormData.buildingNumber ||
      formData.postalCode !== initialFormData.postalCode ||
      formData.city !== initialFormData.city
    );
  }, [formData, initialFormData]);

  // Aktualizacja stanu hasChanges gdy zmienia się formularz
  useEffect(() => {
    setHasChanges(checkForChanges);
  }, [checkForChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges) return;

    try {
      await updateProfile({
        name: formData.name,
        companyDetails: {
          companyName: formData.companyName,
          nip: formData.nip,
          address: formData.address,
          buildingNumber: formData.buildingNumber,
          postalCode: formData.postalCode,
          city: formData.city,
        }
      });

      await refreshUserData();
      setHasChanges(false); // Reset stanu zmian po udanej aktualizacji

      setModalContent({
        title: messages.profile.form.success.title,
        message: messages.profile.form.success.message,
        type: 'success'
      });
    } catch (error) {
      setModalContent({
        title: messages.profile.form.error.title,
        message: `${messages.profile.form.error.message} ${error instanceof Error ? error.message : messages.profile.form.error.unknown
          }`,
        type: 'error'
      });
    } finally {
      setIsModalOpen(true);
    }
  };
  const [showTooltip, setShowTooltip] = useState(false);

  const fieldOrder = ['name', 'companyName', 'nip', 'address', 'buildingNumber', 'postalCode', 'city'] as const;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg">
        {fieldOrder.map((key) => (
          <div key={key} className="mb-4">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {messages.profile.form.fields[key]}
            </label>
            <input
              type="text"
              name={key}
              id={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={
                key === 'buildingNumber'
                  ? messages.profile.form.fields.buildingNumberPlaceholder
                  : ''
              }
              className="mt-1 block w-full rounded-md border-t border-b border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-left appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={key === 'name'}
            />
          </div>
        ))}
        <div className="relative">
          <button
            type="submit"
            disabled={!hasChanges}
            onClick={(e) => {
              if (!hasChanges) {
                e.preventDefault();
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 2000);
              }
            }}
            className={`w-full font-bold py-2 px-4 rounded transition duration-200 ${hasChanges
              ? 'bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {messages.profile.form.submit}
          </button>

          <AnimatePresence>
            {showTooltip && !hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg"
              >
                {messages.profile.form.noChangesTooltip}
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

export default ProfileForm;  