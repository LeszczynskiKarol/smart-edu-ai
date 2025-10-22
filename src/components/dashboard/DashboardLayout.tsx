// src/components/dashboard/DashboardLayout.tsx
'use client';
import React, { useRef, useState, useEffect } from 'react';
import OrderStatusBox from '../OrderStatusBox';
import MobileCookieLinks from './MobileCookieLinks';
import { useOrderStatus } from '../../hooks/useOrderStatus';
import CookieSettings from '@/components/CookieSettings';
import ContactModal from '@/components/ContactModal';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useLocale, useTranslations } from 'next-intl';
import {
  NotebookPen,
  Menu,
  DollarSign,
  FileText,
  User,
  LogOut,
  PlusCircle,
  Sun,
  Moon,
  CreditCard,
  Home,
} from 'lucide-react';
import { useExchangeRate, formatCurrency } from '../../hooks/useExchangeRate';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import TopUpModal from './TopUpModal';
import Loader from '../ui/Loader';
import TopUpSuccessModal from './TopUpSuccessModal';
//import PaymentSuccessModal from "./PaymentSuccessModal";
import { Order } from '../../types/order';
import { getCookie } from '../../utils/cookies';
import LanguageDropdown from './LanguageDropdown';

interface PaymentDetails {
  orderId: string;
  orderNumber?: number;
  amount: number;
  paidAmount: number;
  discount: number;
  remainingBalance: number;
  paymentId: string;
  isTopUp: boolean;
  itemsCount?: number;
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeOrders, refreshOrders } = useOrderStatus();
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const { trackEvent } = useAnalytics();
  const pageViewTracked = useRef(false);
  const { refreshSession, logout, user, refreshUserData } = useAuth();
  const { trackModal, trackNavigation, trackInteraction, trackError } =
    useTracking('DashboardLayout');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: number;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOrderStatusVisible, setIsOrderStatusVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { rate } = useExchangeRate();
  const isUSD = locale === 'en';
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    orderId: '',
    orderNumber: undefined,
    amount: 0,
    paidAmount: 0,
    discount: 0,
    remainingBalance: 0,
    paymentId: '',
    isTopUp: false,
    itemsCount: undefined,
  });
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false);
  const [topUpDetails, setTopUpDetails] = useState({
    amount: 0,
    paidAmount: 0,
    discount: 0,
    newBalance: 0,
    paymentId: '',
  });

  useEffect(() => {
    // Usuwamy pageViewTracked.current, będziemy śledzić każdą zmianę ścieżki
    trackEvent('pageView', {
      action: 'page_load',
      path: pathname,
      component: 'DashboardLayout',
      referrer: sessionStorage.getItem('lastPath') || '',
    });

    sessionStorage.setItem('lastPath', pathname);
  }, [pathname]);

  const hasVisibleOrders = (orders: Order[]) => {
    return orders.some(
      (order) =>
        order.items.some((item) => item.status === 'w trakcie') ||
        (order.items.every((item) => item.status === 'zakończone') &&
          !localStorage.getItem(`order-${order._id}-hidden`))
    );
  };

  useEffect(() => {
    const handleOrderUpdate = (e: CustomEvent) => {
      if (e.detail?.orderAdded) {
        setForceShow(true);
        refreshOrders();
      }
    };

    window.addEventListener(
      'orderStatusUpdate',
      handleOrderUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        'orderStatusUpdate',
        handleOrderUpdate as EventListener
      );
    };
  }, [refreshOrders, refreshUserData]);

  useEffect(() => {
    const hasVisibleOrders = (orders: Order[]) => {
      return orders.some(
        (order) =>
          order.items.some((item) => item.status === 'w trakcie') ||
          (order.items.every((item) => item.status === 'zakończone') &&
            !localStorage.getItem(`order-${order._id}-hidden`))
      );
    };

    if (hasVisibleOrders(activeOrders)) {
      setIsOrderStatusVisible(true);
      sessionStorage.setItem('orderStatusVisible', 'true');
    }
  }, [activeOrders]);

  useEffect(() => {
    if (hasVisibleOrders(activeOrders)) {
      const savedVisibilityState = sessionStorage.getItem('orderStatusVisible');
      if (savedVisibilityState !== null) {
        // Jeśli jest zapisany stan, używamy go
        setIsOrderStatusVisible(savedVisibilityState === 'true');
      } else {
        // Jeśli nie ma zapisanego stanu, domyślnie otwieramy
        setIsOrderStatusVisible(true);
      }
    } else {
      // Gdy nie ma widocznych zamówień, zamykamy i czyścimy stan
      setIsOrderStatusVisible(false);
      sessionStorage.removeItem('orderStatusVisible');
    }
  }, [activeOrders]);

  const handleOrderPaymentSuccess = async (sessionId: string) => {
    try {
      const trackingKey = `ttq_order_payment_tracked_${sessionId}`;
      if (sessionStorage.getItem(trackingKey)) {
        console.log('Event płatności za zamówienie już został wysłany');
        return;
      }

      const response = await fetch(`/api/stripe/session/${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        const savedCurrency = localStorage.getItem('order_currency');
        const orderValue = Number(data.totalPrice) || 0;

        if (window.ttq && !sessionStorage.getItem(trackingKey)) {
          // Zmodyfikowane parametry eventu zgodnie z wymaganiami TikToka
          window.ttq.track('CompletePayment', {
            contents: [
              {
                content_id: data.orderId || 'order',
                content_type: 'product', // Zmienione na 'product' zgodnie z wymaganiami
                content_name: data.orderNumber
                  ? `Order #${data.orderNumber}`
                  : 'Order',
                currency: savedCurrency || (locale === 'en' ? 'USD' : 'PLN'),
                price: orderValue,
              },
            ],
            value: orderValue,
            currency: savedCurrency || (locale === 'en' ? 'USD' : 'PLN'),
            status: 'completed',
          });

          sessionStorage.setItem(trackingKey, 'true');
        }

        // Czyścimy dane
        localStorage.removeItem('order_currency');
        localStorage.removeItem('auth_token_temp');
        localStorage.removeItem('analytical_session_id');
        localStorage.removeItem('payment_pending');

        setPaymentDetails({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          amount: data.totalPrice || 0,
          paidAmount: data.paidAmount || data.totalPrice || 0,
          discount: data.appliedDiscount || 0,
          remainingBalance: data.remainingBalance || 0,
          paymentId: sessionId,
          isTopUp: false,
          itemsCount: data.items?.length || 0,
        });

        setShowPaymentSuccessModal(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  const navItems = [
    { name: t('panel'), icon: PlusCircle, href: '/dashboard' },
    { name: t('orders'), icon: FileText, href: '/dashboard/orders' },
    {
      name: t('invoices'),
      icon: DollarSign,
      href: '/dashboard/payment-history',
    },
    //{ name: t("billingDetails"), icon: User, href: "/dashboard/profile" },
  ];

  const clearCompletedOrders = () => {
    activeOrders.forEach((order) => {
      if (order.items.every((item) => item.status === 'zakończone')) {
        localStorage.setItem(`order-${order._id}-hidden`, 'true');
      }
    });
  };

  const changeLanguage = async (newLocale: string) => {
    const segments = pathname.split('/');

    const localeIndex = segments.findIndex(
      (segment) => segment === 'en' || segment === 'pl'
    );

    if (localeIndex !== -1) {
      segments[localeIndex] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPathname = segments.join('/');

    router.push(newPathname);
  };

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      const sessionRefreshed = await refreshSession();
      if (sessionRefreshed) {
        await refreshUserData();
      }
    };

    // Sprawdzaj i odświeżaj sesję co 15 minut
    const intervalId = setInterval(checkAndRefreshSession, 15 * 60 * 1000);

    // Oczyść interwał przy odmontowaniu komponentu
    return () => clearInterval(intervalId);
  }, [refreshSession, refreshUserData]);

  const handleTopUpSuccess = async (sessionId: string) => {
    try {
      // Najpierw sprawdźmy czy już nie wysłaliśmy tego eventu
      const trackingKey = `ttq_payment_tracked_${sessionId}`;
      if (sessionStorage.getItem(trackingKey)) {
        console.log('Event już został wysłany dla tej sesji');
        return;
      }

      const response = await fetch(`/api/stripe/session/${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        const savedCurrency = localStorage.getItem('top_up_currency');

        if (window.ttq && !sessionStorage.getItem(trackingKey)) {
          window.ttq.track('CompletePayment', {
            contents: [
              {
                content_id: 'top_up',
                content_type: 'product',
                content_name:
                  savedCurrency === 'USD'
                    ? 'Account Top-up'
                    : 'Doładowanie konta',
              },
            ],
            value: data.paidAmount,
            currency: savedCurrency || (locale === 'en' ? 'USD' : 'PLN'),
            status: 'completed',
          });

          // Oznacz event jako wysłany
          sessionStorage.setItem(trackingKey, 'true');
        }

        // Wyczyść dane po zakończeniu
        localStorage.removeItem('top_up_currency');

        setTopUpDetails({
          amount: data.totalPrice || data.amount || 0,
          paidAmount: data.paidAmount || data.totalPrice || 0,
          discount: data.appliedDiscount || 0,
          newBalance: data.remainingBalance || 0,
          paymentId: data.stripeSessionId || sessionId,
        });
        setShowTopUpSuccess(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    const handleSessionAfterPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const type = searchParams.get('type'); // Dodaj sprawdzanie typu płatności

      if (sessionId) {
        try {
          const response = await fetch(
            `/api/stripe/session-token/${sessionId}`
          );
          const data = await response.json();

          if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            await refreshUserData();

            // Sprawdź typ płatności z URL
            if (type === 'top_up') {
              await handleTopUpSuccess(sessionId);
            } else if (type === 'payment') {
              await handleOrderPaymentSuccess(sessionId);
            }
            // Usuń parametry z URL bez przeładowania strony
            router.push(pathname);
          }
        } catch (error) {
          console.error('Error handling session after payment:', error);
        }
      }
    };

    handleSessionAfterPayment();
  }, [searchParams]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    trackInteraction('sidebar_toggle', { state: newState ? 'open' : 'closed' });
    setIsSidebarOpen(newState);
  };

  useEffect(() => {
    const checkTempToken = async () => {
      const tempToken = getCookie('temp_auth_token');
      if (tempToken) {
        localStorage.setItem('token', tempToken);
        document.cookie =
          'temp_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        await refreshUserData();
      }
    };

    checkTempToken();
  }, []);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/active`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setActiveOrder(data.data[0]);
          }
        }
      } catch (error) {
        console.error('Błąd podczas pobierania aktywnego zamówienia:', error);
      }
    };

    fetchActiveOrder();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const itemName = target.getAttribute('data-name') || '';
    const isLogo = itemName === t('appName');

    if (isLogo) {
      trackEvent('logo_click', {
        component: 'DashboardLayout',
        action: 'click',
        destination: '/dashboard',
      });
    } else {
      trackEvent('pageView', {
        component: 'DashboardLayout',
        page: itemName,
        path: target.getAttribute('href') || '',
      });
    }

    setIsSidebarOpen(false);
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/latest`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails({
          orderId: data.orderId,
          amount: data.totalPrice,
          paidAmount: data.paidAmount,
          discount: data.appliedDiscount,
          remainingBalance: data.remainingBalance,
          paymentId: data.stripeSessionId,
          isTopUp: false,
        });
        setShowPaymentSuccessModal(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const closeTopUpSuccessModal = () => {
    trackModal('close', 'topUpSuccessModal', {});
    setShowTopUpSuccess(false);
    router.push(pathname);
  };

  useEffect(() => {
    const orderSuccess = searchParams.get('order_success');
    const paymentSuccess = searchParams.get('payment_success');

    if (paymentSuccess === 'true') {
      fetchOrderDetails();
    } else if (orderSuccess === 'true') {
      const lastOrderConfirmed = localStorage.getItem('lastOrderConfirmed');
      if (lastOrderConfirmed) {
        const orderDetails = JSON.parse(lastOrderConfirmed);
        setConfirmedOrder(orderDetails);
        setShowSuccessModal(true);
        localStorage.removeItem('lastOrderConfirmed');
      }
    }
    // Usuń parametry z URL
    if (orderSuccess || paymentSuccess) {
      router.replace('/dashboard/orders');
    }
  }, [searchParams, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      clearCompletedOrders();
      const keysToRemove = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith('order-') ||
          key.startsWith('orderProgress-') ||
          key.startsWith('orderStartTimes-')
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      await logout();
      trackInteraction('logout_success', {});
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Błąd podczas wylogowywania:', error);
        trackError(error, 'logout_failed');
      } else {
        console.error('Nieoczekiwany błąd podczas wylogowywania:', error);
        trackError(
          new Error('Nieoczekiwany błąd podczas wylogowywania'),
          'logout_failed'
        );
      }
    } finally {
      setIsLoading(false);
      setIsLogoutDialogOpen(false);
      sessionStorage.clear();
    }
  };

  useEffect(() => {
    clearCompletedOrders();
  }, []);

  useEffect(() => {
    const uniqueOrderIds = new Set(activeOrders.map((order) => order._id));
    if (uniqueOrderIds.size !== activeOrders.length) {
      console.warn('Wykryto duplikaty zamówień:', {
        wszystkieZamowienia: activeOrders.length,
        unikatowe: uniqueOrderIds.size,
      });

      // Usuń duplikaty z activeOrders
      const uniqueOrders = Array.from(uniqueOrderIds).map((id) =>
        activeOrders.find((order) => order._id === id)
      );

      // Zaktualizuj stan w kontekście
      refreshOrders();
    }
  }, [activeOrders]);

  return (
    <div className="relative flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md z-50`}
      >
        <div className="flex items-center px-4 py-1">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow-md mr-4"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          <Link
            href="/dashboard"
            onClick={handleNavItemClick}
            data-name={t('appName')}
            className={`flex items-center text-xl md:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            } hover:text-blue-600 transition duration-300`}
          >
            <NotebookPen className="w-4 h-4 md:w-8 md:h-8 mr-2 text-blue-600" />
            {t('appName')}
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        inset-y-0 left-0
        w-56 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md
        flex flex-col
        transition-transform duration-300 ease-in-out
        z-40 lg:z-auto
      `}
      >
        {/* Logo */}
        <div className="p-4">
          <Link
            href="/dashboard"
            onClick={handleNavItemClick}
            data-name={t('appName')}
            className={`flex items-center text-lg font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            } hover:text-blue-100 transition duration-300`}
          >
            <NotebookPen className="w-8 h-8 mr-2 text-blue-600" />
            {t('appName')}
          </Link>
        </div>

        <nav className="flex-grow mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              data-name={item.name}
              className={`
        flex items-center px-4 py-2 w-full
        ${
          pathname === item.href
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
        }
        transition-colors duration-200
      `}
              onClick={handleNavItemClick}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.name}
            </Link>
          ))}

          {/*<button
            onClick={() => {
              trackModal('open', 'topUpModal', { source: 'dashboard' });
              setIsTopUpModalOpen(true);
            }}
            className="flex items-center w-full px-4 py-2 mt-1 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {t('topUp')}
          </button>*/}
        </nav>

        <div className="p-4 bg-gray-100 dark:bg-gray-700">
          <p
            className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-full"
            title={user?.email}
          >
            {user?.email}
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('balance')}:{' '}
            {user?.accountBalance && user.accountBalance > 0
              ? formatCurrency(
                  isUSD ? user.accountBalance : user.accountBalance * rate,
                  locale
                )
              : formatCurrency(0, locale)}
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <Link
            href={process.env.NEXT_PUBLIC_CLIENT_URL || '/'}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded"
            onClick={() => {
              trackInteraction('home_link_click', {
                component: 'DashboardLayout',
                destination: process.env.NEXT_PUBLIC_CLIENT_URL || '/',
                source: 'sidebar',
              });
            }}
          >
            <Home className="w-5 h-5 mr-2" />
            {t('goToHome')}
          </Link>

          <button
            onClick={() => {
              setIsLogoutDialogOpen(true);
            }}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('logoutButton')}
          </button>
        </div>

        <MobileCookieLinks
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
          theme={theme}
        />
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 overflow-x-hidden overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        } pt-16 lg:pt-0`}
      >
        <div className="container mx-auto px-2 md:px-6 py-4">
          {/* Theme toggle button */}
          <div className="absolute top-0 right-0 z-10">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-2 mt-1 text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 mr-2" />
              ) : (
                <Moon className="w-5 h-5 mr-2" />
              )}
            </button>
          </div>

          {/* OrderStatusBox */}
          <OrderStatusBox orders={activeOrders} forceShow={forceShow} />

          {children}
        </div>
      </main>

      {/* Modals and dialogs */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => {
          trackModal('close', 'topUpModal', {});
          setIsTopUpModalOpen(false);
        }}
      />
      {showTopUpSuccess && (
        <TopUpSuccessModal
          isOpen={showTopUpSuccess}
          onClose={closeTopUpSuccessModal}
          amount={topUpDetails.amount}
          paidAmount={topUpDetails.paidAmount}
          discount={topUpDetails.discount}
          newBalance={topUpDetails.newBalance}
          paymentId={topUpDetails.paymentId}
        />
      )}

      {/*{showPaymentSuccessModal && (
        <PaymentSuccessModal
          isOpen={showPaymentSuccessModal}
          onClose={() => {
            setShowPaymentSuccessModal(false);
            setPaymentDetails({
              orderId: '',
              orderNumber: undefined,
              amount: 0,
              paidAmount: 0,
              discount: 0,
              remainingBalance: 0,
              paymentId: '',
              isTopUp: false,
              itemsCount: 0
            });
          }}
          {...paymentDetails}
        />
      )}
*/}

      {isLoading && <Loader />}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              {t('logout.title')}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t('logout.description')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  trackInteraction('logout_cancel', { action: 'cancel' });
                  trackModal('close', 'logoutDialog', { reason: 'cancel' });
                  setIsLogoutDialogOpen(false);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                disabled={isLoading}
              >
                {t('logout.cancel')}
              </button>
              <button
                onClick={async () => {
                  trackInteraction('logout_confirm', { action: 'confirm' });
                  await handleLogout();
                  trackModal('close', 'logoutDialog', { reason: 'confirm' });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : t('logout.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      <CookieSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
