import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../../../i18n';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import InstallPWA from '@/components/InstallPWA';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ErrorBoundary>
      <NextIntlClientProvider messages={messages}>
        <TopBar />
        <div className="flex-1 w-full h-full p-4 overflow-y-auto">
          {children}
        </div>
        <BottomNav />
        <InstallPWA />
      </NextIntlClientProvider>
    </ErrorBoundary>
  );
}