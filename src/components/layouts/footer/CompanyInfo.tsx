import React from 'react';
import { useTranslations } from 'next-intl';

interface CompanyInfoProps {
  className?: string;
}

function CompanyInfo({ className }: CompanyInfoProps) {
  const t = useTranslations('footer');

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">QuickZhiin</h3>
      <p className="text-sm text-gray-600 mb-2">{t('tagline')}</p>
      <p className="text-sm text-gray-600">{t('compliance')}</p>
    </div>
  );
}

export default CompanyInfo;
