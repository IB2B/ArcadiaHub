import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'it';

// Locale labels and RTL configuration
export const localeConfig = {
  it: {
    label: 'Italiano',
    dir: 'ltr' as const,
  },
  en: {
    label: 'English',
    dir: 'ltr' as const,
  },
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request
  let locale = await requestLocale;

  // If no locale in request, try to get from headers or use default
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
