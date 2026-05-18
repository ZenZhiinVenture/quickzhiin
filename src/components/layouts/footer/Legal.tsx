import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface LegalProps {
  className?: string;
}

function Legal({ className }: LegalProps) {
  const t = useTranslations('footer');

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{t('legal')}</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/terms"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {t('terms')}
          </Link>
        </li>
        <li>
          <Link
            href="/privacy"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {t('privacy')}
          </Link>
        </li>
        <li>
          <Link
            href="/compliance"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {t('compliance')}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Legal;
