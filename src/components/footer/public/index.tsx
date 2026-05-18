'use client';

import LanguageSwitcher from '@/components/languageSwitcher';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="flex items-center justify-center w-full px-4 py-8 mx-auto">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 py-8 mx-auto">
        <LanguageSwitcher />
        <p className="text-sm">
          &copy; {new Date().getFullYear()} ZenZhiin Venture (202503103006). {t('rights')}
        </p>
        <div className="mt-2">
          <Link href="/terms" className="mx-2 hover:underline ml-4">
            {t('terms')}
          </Link>
          {' | '}
          <Link href="/policy" className="mx-2 hover:underline ml-4">
            {t('policy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
