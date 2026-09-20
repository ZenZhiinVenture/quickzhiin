import { locales } from '@/i18n/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ThemeContextProvider from '@/contexts/ThemeContext';
import Footer from '@/components/layouts/footer';
import Sidebar from '@/components/layouts/sidebar';
import Topbar from '@/components/layouts/topbar';

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

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) {
    redirect(`/en`);
  }

  const token = (await cookies()).get('auth-token')?.value;

  if (!token) {
    redirect(`/${locale}/login`);
  }
  const messages = await getMessages(locale || 'en');

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex bg-background text-foreground transition-colors duration-300 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <Topbar />
          <main className="flex-1 p-6 transition-all duration-500 bg-background/50">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
