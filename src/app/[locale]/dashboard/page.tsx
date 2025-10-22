// src/app/[locale]/dashboard/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useSearchParams } from 'next/navigation';
import { useTracking } from '@/hooks/useTracking';
import {
  Plus,
  Send,
  X,
  ChevronDown,
  HelpCircle,
  BookOpen,
  GraduationCap,
  FileText,
  Edit,
  PenTool,
} from 'lucide-react';
import SuccessModalHandler from '@/components/SuccessModalHandler';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, useTranslations } from 'next-intl';
import { useExchangeRate } from '../../../hooks/useExchangeRate';
import { PriceDisplay } from '@/components/PriceDisplay';
import { TotalPriceDisplay } from '@/components/TotalPriceDisplay';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { isValidUrl, addHttpsIfMissing, sanitizeUrl } from '@/utils/urlUtils';
import AlertModal from '../../../components/modals/AlertModal';
import { Order } from '../../../types/order';
import { useOrderStatus } from '../../../hooks/useOrderStatus';

type TextForm = {
  id: string;
  isOpen: boolean;
  language: string;
  textLength: string;
  prompt: string;
  topic: string;
  showAdvancedSettings: boolean;
  contentType: string;
  customContentType: string;
  keywords: string[];
  sourceLinks: string[];
  linkErrors: boolean[];
  includeFAQ: boolean;
  includeTable: boolean;
  tone: string;
  price: number;
  displayTitle: string;
  bibliography: boolean;
  searchLanguage: string;
};

type Attachment = {
  file: File;
  preview: string;
  url?: string;
};

const searchLanguages = [
  { value: 'en', flag: '🇬🇧' },
  { value: 'pl', flag: '🇵🇱' },
  { value: 'de', flag: '🇩🇪' },
  { value: 'es', flag: '🇪🇸' },
  { value: 'uk', flag: '🇺🇦' },
  { value: 'cs', flag: '🇨🇿' },
  { value: 'pt', flag: '🇵🇹' },
  { value: 'ru', flag: '🇷🇺' },
];

// Funkcja mapująca język tekstu na język wyszukiwania
const mapTextLangToSearchLang = (textLang: string): string => {
  const mapping: { [key: string]: string } = {
    pol: 'pl',
    eng: 'en',
    ger: 'de',
    ukr: 'uk',
    fra: 'fr',
    esp: 'es',
    ros: 'ru',
    por: 'pt',
  };
  return mapping[textLang] || 'en';
};

const formatTitle = (prompt: string): string => {
  if (!prompt) return '';
  const words = prompt.trim().split(/\s+/);
  return words.length > 5
    ? words.slice(0, 5).join(' ') + '...'
    : words.slice(0, 5).join(' ');
};

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const searchParams = useSearchParams();
  const te = useTranslations('errors');
  const { refreshOrders, setOrders } = useOrderStatus();

  const textLengths = [
    { value: '2000', label: t('textLengths.2000') },
    { value: '3000', label: t('textLengths.3000') },
    { value: '4000', label: t('textLengths.4000') },
    { value: '7000', label: t('textLengths.7000') },
    { value: '10000', label: t('textLengths.10000') },
    { value: '20000', label: t('textLengths.20000') },
    { value: '30000', label: t('textLengths.30000') },
  ];

  const { getSessionId } = useAnalytics();

  const { trackInteraction, trackError } = useTracking('Dashboard');

  const languages = [
    { value: 'pol', flag: '🇵🇱' },
    { value: 'eng', flag: '🇬🇧' },
    { value: 'ger', flag: '🇩🇪' },
    { value: 'ukr', flag: '🇺🇦' },
    { value: 'fra', flag: '🇫🇷' },
    { value: 'esp', flag: '🇪🇸' },
    { value: 'ros', flag: '🇷🇺' },
    { value: 'por', flag: '🇵🇹' },
  ];

  const contentTypes = [
    {
      value: 'licencjacka',
      label: t('contentTypes.licencjacka'),
      icon: BookOpen,
    },
    {
      value: 'magisterska',
      label: t('contentTypes.magisterska'),
      icon: GraduationCap,
    },
    {
      value: 'wypracowanie',
      label: t('contentTypes.wypracowanie'),
      icon: PenTool,
    },
    { value: 'esej', label: t('contentTypes.esej'), icon: Edit },
    { value: 'referat', label: t('contentTypes.referat'), icon: FileText },

    { value: 'custom', label: t('contentTypes.custom'), icon: Plus },
  ];

  const locale = useLocale();
  const { rate } = useExchangeRate();
  const isUSD = locale === 'en';

  const [textForms, setTextForms] = useState<TextForm[]>([
    {
      id: '1',
      isOpen: true,
      language: locale === 'en' ? 'eng' : 'pol',
      textLength: '',
      prompt: '',
      topic: '',
      showAdvancedSettings: false,
      contentType: '',
      customContentType: '',
      keywords: [],
      sourceLinks: ['', '', '', ''],
      linkErrors: [false, false, false, false],
      includeFAQ: false,
      includeTable: false,
      tone: 'nieformalny',
      price: 0,
      displayTitle: '',
      bibliography: false,
      searchLanguage: locale === 'en' ? 'en' : 'pl',
    },
  ]);

  useEffect(() => {
    const handleSessionAfterPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        // Wyczyść zapisane dane formularza po udanej płatności
        localStorage.removeItem('savedFormData');
      }

      const orderCanceled = searchParams.get('order_canceled');
      const savedFormData = localStorage.getItem('savedFormData');

      if (orderCanceled === 'true' && savedFormData) {
        try {
          const parsedFormData = JSON.parse(savedFormData);
          setTextForms(parsedFormData);
        } catch (error) {
          console.error('Błąd podczas przywracania danych formularza:', error);
        }
      }

      // Wyczyść zapisane dane niezależnie od wyniku
      if (orderCanceled === 'true') {
        localStorage.removeItem('savedFormData');
      }
    };

    handleSessionAfterPayment();
  }, [searchParams]);

  useEffect(() => {
    const recalculatePrices = () => {
      setTextForms((forms) =>
        forms.map((form) => ({
          ...form,
          price:
            form.contentType === 'licencjacka'
              ? isUSD && rate
                ? Number((199 / rate).toFixed(2))
                : 199
              : form.contentType === 'magisterska'
                ? isUSD && rate
                  ? Number((249 / rate).toFixed(2))
                  : 249
                : form.textLength
                  ? calculatePrice(form.textLength)
                  : 0,
        }))
      );
    };

    recalculatePrices();
  }, [locale, rate]);

  const Tooltip = ({
    children,
    text,
    position = 'left',
  }: {
    children: React.ReactNode;
    text: string;
    position?: 'left' | 'right';
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);

    // Obliczamy pozycję chmurki względem elementu wyzwalającego
    const updateTooltipPosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        // Dodajemy przesunięcie dla pozycji left/right
        const offset = position === 'right' ? 10 : -260; // szerokość tooltipa + margines

        setTooltipPosition({
          top: rect.top + scrollTop - 10, // Przesuwamy tooltip nieco wyżej
          left:
            rect.left +
            scrollLeft +
            (position === 'right' ? rect.width : 0) +
            offset,
        });
      }
    };

    useEffect(() => {
      if (isVisible) {
        updateTooltipPosition();
        // Aktualizuj pozycję przy przewijaniu i zmianie rozmiaru okna
        window.addEventListener('scroll', updateTooltipPosition);
        window.addEventListener('resize', updateTooltipPosition);

        return () => {
          window.removeEventListener('scroll', updateTooltipPosition);
          window.removeEventListener('resize', updateTooltipPosition);
        };
      }
    }, [isVisible, position]);

    return (
      <>
        <span
          ref={triggerRef}
          className="relative inline-block"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </span>
        {isVisible && (
          <div
            style={{
              position: 'fixed',
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 99999, // Maksymalny z-index
            }}
            className="fixed w-64 p-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg"
          >
            {text}
          </div>
        )}
      </>
    );
  };

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const { refreshUserData, getToken } = useAuth();
  const [enlargedAttachment, setEnlargedAttachment] = useState<number | null>(
    null
  );
  const [textLength, setTextLength] = useState('');
  const [price, setPrice] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const newTotalPrice = textForms.reduce((sum, form) => sum + form.price, 0);
    setTotalPrice(newTotalPrice);
  }, [textForms]);

  const toggleForm = (id: string) => {
    trackInteraction('form_toggle', {
      formId: id,
      newState: !textForms.find((form) => form.id === id)?.isOpen
        ? 'open'
        : 'closed',
    });

    setTextForms((forms) =>
      forms.map((form) => ({
        ...form,
        isOpen: form.id === id ? !form.isOpen : false,
      }))
    );
  };

  const updateForm = (id: string, updates: Partial<TextForm>) => {
    setTextForms((forms) =>
      forms.map((form) => (form.id === id ? { ...form, ...updates } : form))
    );
  };

  const removeForm = (id: string) => {
    if (textForms.length > 1) {
      trackInteraction('form_remove', {
        formId: id,
        remainingForms: textForms.length - 1,
      });

      setTextForms((forms) => forms.filter((form) => form.id !== id));
    }
  };

  const calculatePrice = (length: string, contentType?: string): number => {
    if (contentType === 'licencjacka') {
      // Stała cena dla pracy licencjackiej: 199 PLN
      if (isUSD && rate) {
        return Number((199 / rate).toFixed(2));
      }
      return 199;
    }

    if (contentType === 'magisterska') {
      // Stała cena dla pracy magisterskiej: 249 PLN
      if (isUSD && rate) {
        return Number((249 / rate).toFixed(2));
      }
      return 249;
    }

    if (!length) return 0;
    const basePricePLN = parseInt(length) * 0.003988;
    if (isUSD && rate) {
      const priceUSD = Number((basePricePLN / rate).toFixed(2));
      return priceUSD;
    }
    return Number(basePricePLN.toFixed(2));
  };

  const addNewForm = () => {
    const newId = String(textForms.length + 1);
    trackInteraction('form_add', {
      newFormId: newId,
      totalForms: textForms.length + 1,
    });

    setTextForms((forms) => [
      ...forms.map((form) => ({ ...form, isOpen: false })),
      {
        id: newId,
        isOpen: true,
        language: locale === 'en' ? 'eng' : 'pol',
        textLength: '',
        prompt: '',
        showAdvancedSettings: false,
        contentType: '',
        topic: '',
        customContentType: '',
        keywords: [],
        sourceLinks: ['', '', '', ''],
        linkErrors: [false, false, false, false],
        includeFAQ: false,
        includeTable: false,
        tone: 'nieformalny',
        price: 0,
        displayTitle: '',
        bibliography: false,
        searchLanguage: locale === 'en' ? 'en' : 'pl',
      },
    ]);
  };

  const handleKeywordsChange = (
    formId: string,
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const form = textForms.find((f) => f.id === formId);
    if (!form) return;

    if ('key' in event) {
      // sprawdzamy czy to KeyboardEvent
      if (event.key === 'Enter') {
        event.preventDefault(); // zapobiegamy domyślnej akcji
        const inputValue = (event.target as HTMLInputElement).value.trim();

        if (inputValue) {
          trackInteraction('keyword_add', {
            formId,
            keyword: inputValue,
            method: 'enter_key',
          });

          // Aktualizujemy stan z nowym słowem kluczowym
          setTextForms((prev) =>
            prev.map((form) => {
              if (form.id === formId) {
                return {
                  ...form,
                  keywords: [...form.keywords, inputValue],
                };
              }
              return form;
            })
          );

          // Czyścimy pole input
          (event.target as HTMLInputElement).value = '';
        }
      }
    } else if ('target' in event) {
      // sprawdzamy czy to ChangeEvent
      const inputValue = event.target.value;
      if (inputValue.endsWith(',')) {
        const newKeyword = inputValue.slice(0, -1).trim();
        if (newKeyword) {
          trackInteraction('keyword_add', {
            formId,
            keyword: newKeyword,
            method: 'comma',
          });

          setTextForms((prev) =>
            prev.map((form) => {
              if (form.id === formId) {
                return {
                  ...form,
                  keywords: [...form.keywords, newKeyword],
                };
              }
              return form;
            })
          );

          event.target.value = '';
        }
      }
    }
  };

  const removeKeyword = (formId: string, index: number) => {
    trackInteraction('keyword_remove', {
      formId,
      keywordIndex: index,
    });

    setTextForms((prev) =>
      prev.map((form) => {
        if (form.id === formId) {
          const newKeywords = [...form.keywords];
          newKeywords.splice(index, 1);
          return {
            ...form,
            keywords: newKeywords,
          };
        }
        return form;
      })
    );
  };

  const handleSourceLinkChange = (
    formId: string,
    index: number,
    value: string
  ) => {
    const form = textForms.find((f) => f.id === formId);
    if (form) {
      const newSourceLinks = [...form.sourceLinks];
      newSourceLinks[index] = value;
      updateForm(formId, { sourceLinks: newSourceLinks });
    }
  };

  const validateLink = (formId: string, index: number) => {
    const form = textForms.find((f) => f.id === formId);
    if (form) {
      const link = sanitizeUrl(form.sourceLinks[index]);
      if (link) {
        const formattedLink = addHttpsIfMissing(link);
        const isValid = isValidUrl(formattedLink);
        const newSourceLinks = [...form.sourceLinks];
        newSourceLinks[index] = formattedLink;
        const newLinkErrors = [...form.linkErrors];
        newLinkErrors[index] = !isValid;
        updateForm(formId, {
          sourceLinks: newSourceLinks,
          linkErrors: newLinkErrors,
        });
      } else {
        const newLinkErrors = [...form.linkErrors];
        newLinkErrors[index] = false;
        updateForm(formId, { linkErrors: newLinkErrors });
      }
    }
  };

  const clearLink = (formId: string, index: number) => {
    trackInteraction('link_clear', {
      formId,
      linkIndex: index,
    });
    const form = textForms.find((f) => f.id === formId);
    if (form) {
      const newSourceLinks = [...form.sourceLinks];
      newSourceLinks[index] = '';
      const newLinkErrors = [...form.linkErrors];
      newLinkErrors[index] = false;
      updateForm(formId, {
        sourceLinks: newSourceLinks,
        linkErrors: newLinkErrors,
      });
    }
  };

  const handleSubmit = async (
    e: React.FormEvent | React.MouseEvent,
    formId: string
  ) => {
    e.preventDefault();
    const currentSessionId = getSessionId();
    const form = textForms.find((f) => f.id === formId);

    trackInteraction('order_submit_attempt', {
      formId,
      language: form?.language,
      textLength: form?.textLength,
      hasKeywords: Array.isArray(form?.keywords) && form.keywords.length > 0,
      hasSourceLinks:
        Array.isArray(form?.sourceLinks) &&
        form.sourceLinks.some((link) => link?.length > 0),
    });

    if (!form || !form.textLength) {
      trackError(
        new Error('Niekompletny formularz'),
        'order_validation_failed'
      );
      alert('Proszę wybrać długość tekstu.');
      return;
    }
    setIsLoading(true);

    const orderData = {
      orderItems: textForms.map((form) => ({
        topic: form.topic || form.prompt,
        length: parseInt(form.textLength, 10),
        contentType:
          form.contentType === 'custom'
            ? form.customContentType
            : form.contentType,
        language: form.language,
        guidelines: form.prompt,
        frazy: form.keywords,
        link1: form.sourceLinks[0],
        link2: form.sourceLinks[1],
        link3: form.sourceLinks[2],
        link4: form.sourceLinks[3],
        includeFAQ: form.includeFAQ,
        includeTable: form.includeTable,
        tone: form.tone,
        price: isUSD ? form.price : form.price,
        addressForm: 'bezpośrednio',
        bibliography: form.bibliography,
        searchLanguage: form.searchLanguage,
      })),
      appliedDiscount: 0,
      declaredDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAttachments: attachments.map((att) => ({
        filename: att.file.name,
        url: att.url || '',
      })),
      currency: isUSD ? 'USD' : 'PLN',
      exchangeRate: isUSD ? rate : null,
      analyticalSessionId: currentSessionId,
      firstReferrer: sessionStorage.getItem('firstReferrer'),
      originalReferrer: sessionStorage.getItem('originalReferrer'),
    };

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Brak tokenu autoryzacyjnego');
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        //window.gtag('event', 'begin_checkout', {
        //value: data.order.totalPrice,
        //currency: isUSD ? 'USD' : 'PLN',
        //items: data.order.items.map(
        //(item: { topic: string; contentType: string; price: number }) => ({
        //item_name: item.topic,
        //item_category: item.contentType,
        //price: item.price,
        //})
        //),
        //});

        if (data.success) {
          if (window.ttq) {
            window.ttq.track('InitiateCheckout', {
              contents: textForms.map((form) => ({
                content_id: `text_${form.id}`,
                content_type: 'product',
                content_name: form.contentType || 'text_content',
              })),
              value: totalPrice,
              currency: isUSD ? 'USD' : 'PLN',
            });
          }

          if (data.paymentUrl) {
            localStorage.setItem(
              'auth_token_temp',
              localStorage.getItem('token') || ''
            );
            localStorage.setItem('savedFormData', JSON.stringify(textForms));
            localStorage.setItem('analytical_session_id', currentSessionId);
            localStorage.setItem('payment_pending', 'true');
            window.location.href = data.paymentUrl;
          } else {
            // KLUCZOWE: Najpierw czyść stare zamówienia
            await refreshOrders();

            setOrderDetails(data.order);
            setShowSuccessModal(true);
            setCurrentOrder(data.order);

            // Czekamy chwilę na odświeżenie
            setTimeout(async () => {
              // Dopiero teraz dodajemy nowe zamówienie
              const event = new CustomEvent('orderStatusUpdate', {
                detail: {
                  orderAdded: true,
                  order: data.order,
                  forceRefresh: true, // Dodajemy flagę wymuszającą
                },
              });
              window.dispatchEvent(event);

              // Odśwież jeszcze raz dla pewności
              await refreshOrders();
            }, 100);

            await refreshUserData();
          }
        }

        if (data.paymentUrl) {
          localStorage.setItem(
            'auth_token_temp',
            localStorage.getItem('token') || ''
          );
          localStorage.setItem('savedFormData', JSON.stringify(textForms));

          localStorage.setItem('analytical_session_id', currentSessionId);
          localStorage.setItem('payment_pending', 'true');
          window.location.href = data.paymentUrl;
        } else {
          setOrderDetails(data.order);
          setShowSuccessModal(true);
          setCurrentOrder(data.order);
          if (data.shouldShowOrderStatus) {
            // Wymuszamy pokazanie OrderStatusBox
            const event = new CustomEvent('orderStatusUpdate', {
              detail: {
                orderAdded: true,
                order: data.order,
              },
            });
            window.dispatchEvent(event);
          }

          // Od razu ustawiamy nowe zamówienie

          setOrders([data.order]);

          // Wymuszamy widoczność OrderStatusBox

          const event = new CustomEvent('orderStatusUpdate', {
            detail: { orderAdded: true },
          });
          window.dispatchEvent(event);

          // Dopiero po wysłaniu eventu odświeżamy zamówienia
          await refreshOrders();
          await refreshUserData();
        }
      } else {
        setGeneratedText('Wystąpił błąd podczas składania zamówienia.');
      }
    } catch (error) {
      console.error('Błąd podczas składania zamówienia:', error);
      setGeneratedText('Wystąpił błąd podczas komunikacji z serwerem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkCanceledPayment = () => {
      const orderCanceled = searchParams.get('order_canceled');
      const savedFormData = localStorage.getItem('savedFormData');

      if (orderCanceled === 'true' && savedFormData) {
        try {
          const parsedFormData = JSON.parse(savedFormData);
          setTextForms(parsedFormData);
        } catch (error) {
          console.error('Błąd podczas przywracania danych formularza:', error);
        }
      }

      // Wyczyść zapisane dane
      localStorage.removeItem('savedFormData');
    };

    checkCanceledPayment();
  }, [searchParams]);

  const handleSubmitAll = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const currentSessionId = getSessionId();

    trackInteraction('bulk_order_submit', {
      formCount: textForms.length,
      totalPrice: totalPrice,
      languages: textForms.map((form) => form.language),
    });

    setIsLoading(true);

    const orderData = {
      orderItems: textForms.map((form) => ({
        topic: form.topic || form.prompt,
        length: parseInt(form.textLength, 10),
        contentType:
          form.contentType === 'custom'
            ? form.customContentType
            : form.contentType,
        language: form.language,
        guidelines: form.prompt,
        frazy: form.keywords,
        link1: form.sourceLinks[0],
        link2: form.sourceLinks[1],
        link3: form.sourceLinks[2],
        link4: form.sourceLinks[3],
        includeFAQ: form.includeFAQ,
        includeTable: form.includeTable,
        tone: form.tone,
        addressForm: 'bezpośrednio',
        bibliography: form.bibliography,
        searchLanguage: form.searchLanguage,
      })),
      appliedDiscount: 0,
      declaredDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAttachments: attachments.map((att) => ({
        filename: att.file.name,
        url: att.url || '',
      })),
      currency: isUSD ? 'USD' : 'PLN',
      exchangeRate: isUSD ? rate : null,
      analyticalSessionId: currentSessionId,
      firstReferrer: sessionStorage.getItem('firstReferrer'),
      originalReferrer: sessionStorage.getItem('originalReferrer'),
    };

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Brak tokenu autoryzacyjnego');
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        //window.gtag('event', 'begin_checkout', {
        //value: data.order.totalPrice,
        //currency: isUSD ? 'USD' : 'PLN',
        //items: data.order.items.map(
        //(item: { topic: string; contentType: string; price: number }) => ({
        //item_name: item.topic,
        //item_category: item.contentType,
        //price: item.price,
        //})
        //),
        //});

        if (data.paymentUrl) {
          localStorage.setItem(
            'auth_token_temp',
            localStorage.getItem('token') || ''
          );
          localStorage.setItem('savedFormData', JSON.stringify(textForms));

          localStorage.setItem('analytical_session_id', currentSessionId);
          localStorage.setItem('payment_pending', 'true');

          window.location.href = data.paymentUrl;
        } else {
          setOrderDetails(data.order);
          setShowSuccessModal(true);
          setCurrentOrder(data.order);
          if (data.shouldShowOrderStatus) {
            // Wymuszamy pokazanie OrderStatusBox
            const event = new CustomEvent('orderStatusUpdate', {
              detail: {
                orderAdded: true,
                order: data.order,
              },
            });
            window.dispatchEvent(event);
          }

          // Od razu ustawiamy nowe zamówienie

          setOrders([data.order]);

          // Wymuszamy widoczność OrderStatusBox

          const event = new CustomEvent('orderStatusUpdate', {
            detail: { orderAdded: true },
          });
          window.dispatchEvent(event);

          // Dopiero po wysłaniu eventu odświeżamy zamówienia
          await refreshOrders();
          await refreshUserData();
        }
      } else {
        setGeneratedText('Wystąpił błąd podczas składania zamówienia.');
      }
    } catch (error) {
      console.error('Błąd podczas składania zamówienia:', error);
      setGeneratedText('Wystąpił błąd podczas komunikacji z serwerem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (textLength) {
      const newPrice = parseInt(textLength) * 0.002988;
      setPrice(newPrice);
    } else {
      setPrice(0);
    }
  }, [textLength]);

  useEffect(() => {
    const recalculatePrices = () => {
      setTextForms((forms) =>
        forms.map((form) => ({
          ...form,
          price: calculatePrice(form.textLength),
        }))
      );
    };

    recalculatePrices();
  }, [locale, rate]);

  const shouldShowBibliography = (form: TextForm) => {
    return !form.sourceLinks.some((link) => link.length > 0);
  };

  return (
    <>
      <div
        className={`dashboard-card rounded-xl shadow-2xl overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="p-2 md:p-8">
          <h2
            className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-800'}`}
          >
            {t('textGenerator')}
          </h2>

          <AnimatePresence>
            {textForms.map((form, index) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`mb-4 overflow-hidden ${index > 0 ? 'border-t border-gray-300 dark:border-gray-600 pt-4' : ''}`}
              >
                {textForms.length > 1 && (
                  <div
                    className={`p-4 rounded-lg cursor-pointer flex justify-between items-center ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => toggleForm(form.id)}
                  >
                    <h3
                      className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                    >
                      {form.displayTitle
                        ? `${index + 1}. ${form.displayTitle}`
                        : `${t('text.default')} ${index + 1}`}
                    </h3>
                    <div className="flex items-center">
                      {index > 0 && (
                        <Tooltip text={t('text.remove')}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeForm(form.id);
                            }}
                            className="mr-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </Tooltip>
                      )}
                      <motion.div
                        initial={false}
                        animate={{ rotate: form.isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {(form.isOpen || textForms.length === 1) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 mt-4"
                    >
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="space-y-6 mt-4"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <select
                            value={form.language}
                            onChange={(e) => {
                              trackInteraction('language_select_change', {
                                formId: form.id,
                                previousLanguage: form.language,
                                newLanguage: e.target.value,
                                languageLabel: languages.find(
                                  (lang) => lang.value === e.target.value
                                )?.flag,
                              });
                              updateForm(form.id, { language: e.target.value });
                            }}
                            className={`select select-bordered flex-1 ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-200 border-gray-600'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            } focus:border-blue-500 focus:ring-blue-500 transition-colors duration-300`}
                          >
                            {languages.map((lang) => (
                              <option key={lang.value} value={lang.value}>
                                {lang.flag} {t(`languages.${lang.value}`)}
                              </option>
                            ))}
                          </select>
                          <div className="flex-1 relative">
                            {form.contentType === 'licencjacka' ||
                            form.contentType === 'magisterska' ? (
                              <div
                                className={`select select-bordered w-full flex items-center h-12 px-4 ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 text-blue-300 border-blue-700'
                                    : 'bg-blue-50 text-blue-700 border-blue-300'
                                }`}
                              >
                                <span className="font-medium">
                                  {t(
                                    form.contentType === 'licencjacka'
                                      ? 'summary.licencjacka'
                                      : 'summary.magisterska'
                                  )}
                                </span>
                              </div>
                            ) : (
                              <select
                                value={form.textLength}
                                onChange={(e) => {
                                  const newLength = e.target.value;
                                  const newPrice = calculatePrice(
                                    newLength,
                                    form.contentType
                                  );
                                  trackInteraction(
                                    'text_length_select_change',
                                    {
                                      formId: form.id,
                                      previousLength: form.textLength,
                                      newLength: newLength,
                                      newPrice: newPrice,
                                      lengthLabel: textLengths.find(
                                        (len) => len.value === newLength
                                      )?.label,
                                    }
                                  );
                                  updateForm(form.id, {
                                    textLength: newLength,
                                    price: newPrice,
                                  });
                                }}
                                className={`select select-bordered w-full ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 text-gray-200 border-gray-600'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                } focus:border-blue-500 focus:ring-blue-500 transition-colors duration-300`}
                                required
                              >
                                <option value="" disabled>
                                  {t('textLengths.selectLength')}
                                </option>
                                {textLengths.map((length) => (
                                  <option
                                    key={length.value}
                                    value={length.value}
                                  >
                                    {length.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                        <div
                          className={`rounded-lg p-4 ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-gray-100 text-gray-800'
                          } border border-gray-300`}
                        >
                          <div className="space-y-4">
                            <div>
                              <label
                                className={`label flex items-center ${
                                  theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              >
                                <span className="label-text">
                                  {t('inputs.contentType')}
                                </span>
                                <Tooltip text={t('tooltips.contentType')}>
                                  <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                </Tooltip>
                              </label>

                              <div>
                                {/* Zmodyfikowana wersja boxów z typami treści z lepszymi kolorami */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                  {contentTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected =
                                      form.contentType === type.value;

                                    // Mapowanie ikon na kolory (dostosuj według preferencji)
                                    const iconColors = {
                                      wypracowanie:
                                        'text-blue-500 dark:text-blue-400',
                                      esej: 'text-blue-500 dark:text-blue-400',
                                      referat:
                                        'text-blue-500 dark:text-blue-400',
                                      licencjacka:
                                        'text-blue-500 dark:text-blue-400',
                                      magisterska:
                                        'text-blue-500 dark:text-blue-400',
                                      rozprawka:
                                        'text-blue-500 dark:text-blue-400',
                                      custom:
                                        'text-blue-500 dark:text-blue-400',
                                    };

                                    // Kolory tła dla wybranych elementów
                                    const bgColors = {
                                      wypracowanie:
                                        'bg-blue-100 dark:bg-blue-900',
                                      esej: 'bg-blue-100 dark:bg-blue-900',
                                      referat: 'bg-blue-100 dark:bg-blue-900',
                                      licencjacka:
                                        'bg-blue-100 dark:bg-blue-900',
                                      magisterska:
                                        'bg-blue-100 dark:bg-blue-900',
                                      rozprawka: 'bg-blue-100 dark:bg-blue-900',
                                      custom: 'bg-blue-100 dark:bg-blue-900',
                                    };

                                    // Kolory obramowania dla wybranych elementów
                                    const borderColors = {
                                      wypracowanie:
                                        'border-blue-400 dark:border-blue-700',
                                      esej: 'border-blue-400 dark:border-blue-700',
                                      referat:
                                        'border-blue-400 dark:border-blue-700',
                                      licencjacka:
                                        'border-blue-400 dark:border-blue-700',
                                      magisterska:
                                        'border-blue-400 dark:border-blue-700',
                                      rozprawka:
                                        'border-blue-400 dark:border-blue-700',
                                      custom:
                                        'border-blue-400 dark:border-blue-700',
                                    };

                                    const defaultBg =
                                      theme === 'dark'
                                        ? 'bg-gray-800'
                                        : 'bg-white';
                                    const defaultBorder =
                                      theme === 'dark'
                                        ? 'border-gray-700'
                                        : 'border-gray-200';

                                    const iconColor = isSelected
                                      ? iconColors[
                                          type.value as keyof typeof iconColors
                                        ]
                                      : theme === 'dark'
                                        ? 'text-gray-300'
                                        : 'text-gray-600';

                                    const boxBg = isSelected
                                      ? bgColors[
                                          type.value as keyof typeof bgColors
                                        ]
                                      : defaultBg;

                                    const boxBorder = isSelected
                                      ? `border-2 ${borderColors[type.value as keyof typeof borderColors]}`
                                      : `border ${defaultBorder}`;

                                    return (
                                      <div
                                        key={type.value}
                                        onClick={() => {
                                          trackInteraction(
                                            'content_type_select_change',
                                            {
                                              formId: form.id,
                                              previousType: form.contentType,
                                              newType: type.value,
                                              typeLabel: type.label,
                                            }
                                          );

                                          // Zapisujemy nowy typ treści
                                          const newContentType = type.value;

                                          // Dla pracy licencjackiej i magisterskiej ustawiamy stałą cenę i blokujemy wybór długości
                                          if (
                                            newContentType === 'licencjacka'
                                          ) {
                                            const newPrice =
                                              isUSD && rate
                                                ? Number(
                                                    (199 / rate).toFixed(2)
                                                  )
                                                : 199;
                                            updateForm(form.id, {
                                              contentType: newContentType,
                                              price: newPrice,
                                              textLength: '20000',
                                              bibliography: true, // Automatycznie włączamy bibliografię
                                              searchLanguage:
                                                mapTextLangToSearchLang(
                                                  form.language
                                                ), // Ustawiamy język wyszukiwania
                                            });
                                          } else if (
                                            newContentType === 'magisterska'
                                          ) {
                                            const newPrice =
                                              isUSD && rate
                                                ? Number(
                                                    (249 / rate).toFixed(2)
                                                  )
                                                : 249;
                                            updateForm(form.id, {
                                              contentType: newContentType,
                                              price: newPrice,
                                              textLength: '20000',
                                              bibliography: true, // Automatycznie włączamy bibliografię
                                              searchLanguage:
                                                mapTextLangToSearchLang(
                                                  form.language
                                                ), // Ustawiamy język wyszukiwania
                                            });
                                          } else {
                                            // Dla innych typów normalne obliczanie ceny
                                            updateForm(form.id, {
                                              contentType: newContentType,
                                              bibliography: false, // Wyłączamy bibliografię dla innych typów prac
                                              searchLanguage: '', // Resetujemy język wyszukiwania
                                              price: form.textLength
                                                ? calculatePrice(
                                                    form.textLength
                                                  )
                                                : 0,
                                            });
                                          }
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow ${boxBg} ${boxBorder}`}
                                      >
                                        <div
                                          className="w-12 h-12 flex items-center justify-center rounded-full mb-2 bg-opacity-10 dark:bg-opacity-20 transition-all
          ${isSelected ? bgColors[type.value as keyof typeof bgColors] : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}"
                                        >
                                          <Icon
                                            className={`w-6 h-6 ${iconColor}`}
                                          />
                                        </div>
                                        <span
                                          className={`text-sm text-center font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                        >
                                          {type.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {form.contentType === 'custom' && (
                                  <input
                                    type="text"
                                    value={form.customContentType}
                                    onChange={(e) =>
                                      updateForm(form.id, {
                                        customContentType: e.target.value,
                                      })
                                    }
                                    placeholder={t(
                                      'contentTypes.customPlaceholder'
                                    )}
                                    className={`input input-bordered w-full mt-3 ${
                                      theme === 'dark'
                                        ? 'bg-gray-600 text-gray-200'
                                        : 'bg-white text-gray-800'
                                    }`}
                                    required
                                  />
                                )}
                              </div>
                            </div>
                            {/*<div>
                                                                <label
                                                                    className={`label flex items-center ${theme === "dark"
                                                                        ? "text-gray-300"
                                                                        : "text-gray-700"
                                                                        }`}
                                                                >
                                                                    <span className="label-text">{t('inputs.keywords')}</span>
                                                                    <Tooltip text={t('tooltips.keywords')}>
                                                                        <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                                                    </Tooltip>
                                                                </label>
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {(form.keywords || []).map((keyword, keywordIndex) => (
                                                                        <span
                                                                            key={keywordIndex}
                                                                            className={`px-2 py-1 rounded-full text-sm flex items-center ${theme === "dark"
                                                                                ? "bg-blue-900 text-blue-200"
                                                                                : "bg-blue-100 text-blue-800"
                                                                                }`}
                                                                        >
                                                                            {keyword}
                                                                            <button
                                                                                onClick={() => removeKeyword(form.id, keywordIndex)}
                                                                                className={`ml-1 ${theme === "dark"
                                                                                    ? "text-blue-300 hover:text-blue-100"
                                                                                    : "text-blue-600 hover:text-blue-800"
                                                                                    }`}
                                                                            >
                                                                                &times;
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    onKeyDown={(e) => handleKeywordsChange(form.id, e)}
                                                                    onChange={(e) => handleKeywordsChange(form.id, e)}
                                                                    className={`input input-bordered w-full ${theme === "dark"
                                                                        ? "bg-gray-600 text-gray-200"
                                                                        : "bg-white text-gray-800"
                                                                        }`}
                                                                    placeholder={t('inputs.keywordsPlaceholder')} />

                                                            </div>
                              <div>
                                <label
                                  className={`label flex items-center ${
                                    theme === 'dark'
                                      ? 'text-gray-300'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {t('inputs.sourceLinks')}

                                  <Tooltip text={t('tooltips.sourceLinks')}>
                                    <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                  </Tooltip>
                                </label>
                                {form.sourceLinks.map((link, linkIndex) => (
                                  <div
                                    key={linkIndex}
                                    className="relative mb-2"
                                  >
                                    <input
                                      type="url"
                                      value={link}
                                      onChange={(e) =>
                                        handleSourceLinkChange(
                                          form.id,

                                          linkIndex,

                                          e.target.value
                                        )
                                      }
                                      onBlur={() =>
                                        validateLink(form.id, linkIndex)
                                      }
                                      className={`input input-bordered w-full ${
                                        form.linkErrors[linkIndex]
                                          ? 'input-error'
                                          : ''
                                      } ${
                                        theme === 'dark'
                                          ? 'bg-gray-600 text-gray-200'
                                          : 'bg-white text-gray-800'
                                      }`}
                                      placeholder={`${t('inputs.sourceLink')} ${linkIndex + 1}`}
                                    />
                                    {link && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          clearLink(form.id, linkIndex)
                                        }
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                    {form.linkErrors[linkIndex] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        Nieprawidłowy adres URL
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>*/}
                            {/*{shouldShowBibliography(form) && (
                              <div className="form-control">
                                <label
                                  className={`label flex items-left justify-between ${
                                    theme === 'dark'
                                      ? 'text-gray-300'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {t('inputs.bibliography')}
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={form.bibliography}
                                      onChange={(e) => {
                                        const newBibState = e.target.checked;
                                        trackInteraction(
                                          'bibliography_toggle',
                                          {
                                            formId: form.id,
                                            newState: newBibState,
                                          }
                                        );
                                        updateForm(form.id, {
                                          bibliography: newBibState,
                                          searchLanguage: newBibState
                                            ? mapTextLangToSearchLang(
                                                form.language
                                              )
                                            : '',
                                        });
                                      }}
                                      className={`toggle ${
                                        theme === 'dark'
                                          ? 'toggle-accent bg-gray-700'
                                          : 'toggle-primary bg-gray-200'
                                      }`}
                                    />
                                    <Tooltip
                                      position="left"
                                      text={t('tooltips.bibliography')}
                                    >
                                      <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                    </Tooltip>
                                  </div>
                                </label>

                                 Dodajemy select języka wyszukiwania, widoczny tylko gdy bibliografia jest włączona
                                {form.bibliography && (
                                  <div className="mt-2">
                                    <label
                                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                                    >
                                      {t('inputs.searchLanguage')}
                                    </label>
                                    <Tooltip
                                      position="right"
                                      text={t('tooltips.searchLanguage')}
                                    >
                                      <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                    </Tooltip>
                                    <select
                                      value={form.searchLanguage}
                                      onChange={(e) => {
                                        const newSearchLanguage =
                                          e.target.value;

                                        trackInteraction(
                                          'search_language_change',
                                          {
                                            formId: form.id,
                                            newLanguage: newSearchLanguage,
                                          }
                                        );

                                        updateForm(form.id, {
                                          searchLanguage: newSearchLanguage,
                                        });
                                      }}
                                      className={`select select-bordered w-full mt-1 ${
                                        theme === 'dark'
                                          ? 'bg-gray-600 text-gray-200 border-gray-500'
                                          : 'bg-white text-gray-800 border-gray-300'
                                      }`}
                                    >
                                      {searchLanguages.map((lang) => (
                                        <option
                                          key={lang.value}
                                          value={lang.value}
                                        >
                                          {t(`searchLanguages.${lang.value}`)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}*/}

                            {/*<div className="flex items-center space-x-4">
                                                                <div className="form-control">
                                                                    <label
                                                                        className={`label cursor-pointer space-x-2 ${theme === "dark"
                                                                            ? "text-gray-300"
                                                                            : "text-gray-700"
                                                                            }`}
                                                                    >
                                                                        <span className="label-text flex items-center">
                                                                            FAQ
                                                                            <Tooltip
                                                                                text={t('tooltips.faq')}
                                                                                position="right"
                                                                            >
                                                                                <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                                                            </Tooltip>
                                                                        </span>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={form.includeFAQ}
                                                                            onChange={(e) =>
                                                                                updateForm(form.id, {

  includeFAQ: e.target.checked,
                                                                                })
                                                                            }
                                                                            className={`toggle ${theme === "dark"
                                                                                ? "toggle-accent bg-gray-700"
                                                                                : "toggle-primary bg-gray-200"
                                                                                }`}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                <div className="form-control">
                                                                    <label
                                                                        className={`label cursor-pointer space-x-2 ${theme === "dark"
                                                                            ? "text-gray-300"
                                                                            : "text-gray-700"
                                                                            }`}
                                                                    >
                                                                        <span className="label-text flex items-center">
                                                                            Tabela
                                                                            <Tooltip
                                                                                text={t('tooltips.table')}
                                                                                position="right"
                                                                            >
                                                                                <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                                                            </Tooltip>
                                                                        </span>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={form.includeTable}
                                                                            onChange={(e) =>
                                                                                updateForm(form.id, {

  includeTable: e.target.checked,
                                                                                })
                                                                            }
                                                                            className={`toggle ${theme === "dark"
                                                                                ? "toggle-accent bg-gray-700"
                                                                                : "toggle-primary bg-gray-200"
                                                                                }`}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    htmlFor={`tone-${form.id}`}
                                                                    className={`label flex items-center ${theme === "dark"
                                                                        ? "text-gray-300"
                                                                        : "text-gray-700"
                                                                        }`}
                                                                >
                                                                    {t('inputs.tone')}

                                                                    <Tooltip text={t('tooltips.tone')}>
                                                                        <HelpCircle className="w-4 h-4 ml-1 text-gray-500 cursor-help" />
                                                                    </Tooltip>
                                                                </label>
                                                                <select
                                                                    id={`tone-${form.id}`}
                                                                    value={form.tone}
                                                                    onChange={(e) =>
                                                                        updateForm(form.id, { tone: e.target.value })
                                                                    }
                                                                    className={`select select-bordered w-full ${theme === "dark"
                                                                        ? "bg-gray-600 text-gray-200 border-gray-500"
                                                                        : "bg-white text-gray-800 border-gray-300"
                                                                        }`}
                                                                >
                                                                    <option value="nieformalny">{t('tone.informal')}</option>
                                                                    <option value="oficjalny">{t('tone.formal')}</option>
                                                                    <option value="bezosobowy">{t('tone.impersonal')}</option>
                                                                </select>
                                                            </div>*/}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label
                            className={`label flex items-center ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            }`}
                          >
                            <span className="label-text block mt-4 mb-1">
                              {t('inputs.topic')}
                            </span>
                          </label>

                          <div
                            className={`rounded-lg p-0 ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-200'
                                : 'bg-gray-100 text-gray-800'
                            } border border-gray-300`}
                          >
                            <textarea
                              value={form.topic}
                              onChange={(e) => {
                                updateForm(form.id, {
                                  topic: e.target.value,
                                });
                              }}
                              placeholder={t('inputs.topicPlaceholder')}
                              className={`textarea w-full ${
                                theme === 'dark'
                                  ? 'bg-gray-700 text-gray-200'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                              style={{
                                minHeight: '40px',
                                height: 'auto',
                                resize: 'none',
                                overflow: 'hidden',
                              }}
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                              }}
                              required
                            />
                          </div>
                        </div>

                        <span className="label-text block mt-4 mb-1">
                          {t('inputs.guidelines')}
                        </span>
                        <div
                          className={`rounded-lg p-0 ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-gray-100 text-gray-800'
                          } border border-gray-300`}
                        >
                          <textarea
                            value={form.prompt}
                            onChange={(e) => {
                              updateForm(form.id, { prompt: e.target.value });
                            }}
                            onBlur={(e) => {
                              // Śledzimy tylko końcowy stan po zakończeniu edycji
                              updateForm(form.id, {
                                displayTitle: formatTitle(e.target.value),
                              });
                            }}
                            placeholder={t('inputs.guideline')}
                            className={`textarea w-full h-40 ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-200'
                                : 'bg-gray-100 text-gray-800'
                            } `}
                          />
                        </div>
                        {form.textLength && (
                          <PriceDisplay
                            price={form.price}
                            theme={theme}
                            locale={locale}
                            showMinPaymentInfo={textForms.length === 1}
                            contentType={form.contentType}
                          />
                        )}
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Sekcja "Dodaj tekst" i łączna cena - zmodyfikowana na responsywną
          {textForms.length > 1 ? (
            <div
              className={`mt-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addNewForm}
                  className={`btn btn-sm px-4 w-full sm:w-auto ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('buttons.addText')}
                </motion.button>

                <div className="w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <TotalPriceDisplay
                    totalPrice={totalPrice}
                    theme={theme}
                    locale={locale}
                  />
                </div>
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addNewForm}
              className={`btn btn-sm mb-4 w-full ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('buttons.addText')}
            </motion.button>
          )}

         Zamień obecny button na ten: */}
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              const invalidForms = textForms.filter((form) => {
                if (!form.textLength) return true;

                // Dodana walidacja pola temat dla prac licencjackich i magisterskich

                if (
                  (form.contentType === 'licencjacka' ||
                    form.contentType === 'magisterska') &&
                  !form.topic
                )
                  return true;
                // Walidacja customContentType gdy wybrano "Inny"
                if (
                  form.contentType === 'custom' &&
                  !form.customContentType.trim()
                )
                  return true;
                return false;
              });
              if (invalidForms.length > 0) {
                const invalidFields = invalidForms.map((form, index) => {
                  const missingFields = [];
                  if (!form.textLength) missingFields.push(te('textLength'));

                  // Walidacja customContentType w komunikacie
                  if (
                    form.contentType === 'custom' &&
                    !form.customContentType.trim()
                  )
                    missingFields.push(
                      'Podaj własny rodzaj tekstu w sekcji „Wpisz własny rodzaj pracy"'
                    );
                  return `${te('text')} ${index + 1}: ${missingFields.join(` ${te('and')} `)}`;
                });
                setAlertMessage(
                  `${te('fillFields')}\n${invalidFields.join('\n')}`
                );
              } else {
                if (textForms.length > 1) {
                  handleSubmitAll(e);
                } else {
                  handleSubmit(e, textForms[0].id);
                }
              }
            }}
            disabled={isLoading}
            className={`btn w-full mt-4 relative flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{t('buttons.generating')}</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  <span>
                    {textForms.length > 1
                      ? t('buttons.generateAllTexts')
                      : t('buttons.generateText')}
                  </span>
                </>
              )}
            </div>
          </button>

          <AlertModal
            isOpen={!!alertMessage}
            onClose={() => setAlertMessage(null)}
            message={alertMessage || ''}
          />
        </div>
      </div>

      {enlargedAttachment !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setEnlargedAttachment(null)}
        >
          <div className="relative w-4/5 h-4/5">
            <Image
              src={attachments[enlargedAttachment].preview}
              alt={`Powiększony załącznik ${enlargedAttachment + 1}`}
              layout="fill"
              objectFit="contain"
            />
          </div>
          <SuccessModalHandler />
        </div>
      )}
    </>
  );
}
