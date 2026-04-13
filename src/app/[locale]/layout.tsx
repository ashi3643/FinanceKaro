import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '../../../i18n';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import InstallPWA from '@/components/InstallPWA';
import LanguageDetector from '@/components/LanguageDetector';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Footer from '@/components/Footer';
import PersonaSelection from '@/components/PersonaSelection';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <ErrorBoundary>
      <NextIntlClientProvider messages={messages}>
        <LanguageDetector />
        <TopBar />
        <div className="flex flex-col w-full h-full">
          <div className="flex-1 p-4 overflow-y-auto">
            {children}
          </div>
          <Footer />
        </div>
        <BottomNav />
        <InstallPWA />
        <PersonaSelection />
      </NextIntlClientProvider>
    </ErrorBoundary>
  );
}
