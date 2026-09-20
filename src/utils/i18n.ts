import { createNavigation } from 'next-intl/navigation';
import { locales } from '@/i18n/i18n';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
});

export function getLocaleFromPath(path: string): string {
  const segments = path.split('/');
  const localeSegment = segments[1];

  if (locales.includes(localeSegment as any)) {
    return localeSegment;
  }

  return 'en'; // Default locale
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
