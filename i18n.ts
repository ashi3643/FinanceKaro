import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'hi', 'te'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});