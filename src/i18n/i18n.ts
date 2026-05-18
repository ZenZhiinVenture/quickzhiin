import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ms', 'zh', 'es', 'fr'] as const;

export const localeNames: { [key: string]: string } = {
  en: 'English',
  ms: 'Bahasa Melayu',
  zh: '中文',
  // es: 'Español',
  // fr: 'Français',
};

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localePrefix = 'as-needed';

export default getRequestConfig(async ({ locale }) => {
  const validLocale =
    typeof locale === 'string' && locales.includes(locale as 'en' | 'ms' | 'zh' | 'es' | 'fr')
      ? locale
      : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
