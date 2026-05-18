import type { Metadata } from 'next';
import '@/styles/globals.css';
import { locales } from '@/i18n/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { redirect } from 'next/navigation';
import ClientLayout from './clientLayout';

export const metadata: Metadata = {
  title: 'ZenZhiin Venture',
  description: 'ZenZhiin Venture is a venture capital firm that invests in early-stage startups.',
};

import logger from '@/utils/logger';

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    logger.error('Error loading messages', { locale, error });
    return {};
  }
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as 'en' | 'ms' | 'zh' | 'es' | 'fr')) {
    redirect(`/en/${locale}`);
  }
  const messages = await getMessages(locale || 'en');

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout locale={locale}>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
