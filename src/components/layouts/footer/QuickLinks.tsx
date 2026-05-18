import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// QuickLinks component
interface QuickLinksProps {
  className?: string;
}

function QuickLinks({ className }: QuickLinksProps) {
  const t = useTranslations('footer');

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/help"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {t('help')}
          </Link>
        </li>
        <li>
          <Link
            href="/faq"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {t('faq')}
          </Link>
        </li>
        <li>
          <Link
            href="/api-docs"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {t('apiDocs')}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default QuickLinks;
