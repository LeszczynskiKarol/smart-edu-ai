// src/components/ContactForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTheme } from "@/context/ThemeContext";
import { useTranslations } from 'next-intl';

interface ContactFormProps {
    onSuccess?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
    const { theme } = useTheme();
    const t = useTranslations('Contact.form');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/submit`, formData);
            setSubmitMessage('Wiadomość została wysłana pomyślnie!');
            setFormData({ name: '', email: '', message: '' });
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1500); // Dajemy czas na zobaczenie komunikatu
            }
        } catch (error) {
            setSubmitMessage('Wystąpił błąd podczas wysyłania wiadomości.');
        }
        setIsSubmitting(false);
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block mb-1">{t('nameLabel')}</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('placeholders.name')}
                    required
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
            </div>
            <div>
                <label htmlFor="email" className="block mb-1">{t('emailLabel')}</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('placeholders.email')}
                    required
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
            </div>
            <div>
                <label htmlFor="message" className="block mb-1">{t('messageLabel')}</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('placeholders.message')}
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                ></textarea>
            </div>
            <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-[#38c775] text-white rounded-full hover:bg-[#2ea55f] transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? t('submitting') : t('submit')}
            </motion.button>
            {submitMessage && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center ${submitMessage.includes('błąd')
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-green-500 dark:text-green-400'
                        }`}
                >
                    {submitMessage.includes('błąd') ? t('errorMessage') : t('successMessage')}
                </motion.p>
            )}
        </form>
    );
};

export default ContactForm;
