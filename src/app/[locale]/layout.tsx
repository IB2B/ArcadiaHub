import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeConfig } from '@/i18n';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Arcadia Hub - Harlock Partner Portal',
  description: 'The operational, training, and informational reference point for Harlock partners.',
  icons: {
    icon: '/harlock-favicon.png',
    shortcut: '/harlock-favicon.png',
    apple: '/harlock-favicon.png',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure the locale is valid
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  // Get text direction for the locale
  const dir = localeConfig[locale as keyof typeof localeConfig].dir;

  return (
    <html lang={locale} dir={dir}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
