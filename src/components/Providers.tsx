'use client';

import { NextIntlClientProvider } from 'next-intl';

export function Providers({ children, messages, locale }: {
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}