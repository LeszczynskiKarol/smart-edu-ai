// src/app/[locale]/dashboard/layout.tsx
import { Suspense } from 'react';
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import AuthRedirect from "../../../components/auth/AuthRedirect";
import { ThemeProvider } from "../../../context/ThemeContext";
import { OrderProvider } from "../../../context/OrderContext";
import { OrderStatusProvider } from "../../../context/OrderStatusContext";
import { unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export function generateStaticParams() {
  return ['en', 'pl'].map((locale) => ({ locale }));
}

const getFilteredMessages = async (locale: string): Promise<AbstractIntlMessages> => {
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return messages;
};

export default async function DashboardPageLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Sprawdź czy locale jest prawidłowe
  if (!['en', 'pl'].includes(locale)) {
    locale = 'pl'; // domyślny język
  }

  unstable_setRequestLocale(locale);

  let messages: AbstractIntlMessages;
  try {
    messages = await getFilteredMessages(locale);
    // Dodaj logowanie

  } catch (error) {
    console.error('Failed to load messages for locale:', locale, error);
    return null;
  }


  return (
    <Suspense fallback={<Loader />}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <OrderProvider>
          <OrderStatusProvider>
            <ThemeProvider>
              <AuthRedirect currentPath="/dashboard">
                <DashboardLayout>{children}</DashboardLayout>
              </AuthRedirect>
            </ThemeProvider>
          </OrderStatusProvider>
        </OrderProvider>
      </NextIntlClientProvider>
    </Suspense>
  );
} 