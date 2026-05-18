import { getRequestConfig } from 'next-intl/server';
import { locales } from '@/i18n/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Default to 'en' if locale is not supported
  const validLocale =
    typeof locale === 'string' &&
      locales.includes(locale as 'en' | 'ms' | 'zh' | 'es' | 'fr')
      ? locale
      : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
