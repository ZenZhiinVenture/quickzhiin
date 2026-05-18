import type { Metadata } from 'next';
import React from 'react';
import { useTranslations } from 'next-intl';

import { FinancialOverview } from '@/components/dashboard/FinancialOverview';

export const metadata: Metadata = {
  title: 'Dashboard | QuickZhiin',
  description: 'Financial dashboard and business insights',
};

export default function DashboardPage() {
  const t = useTranslations('AccountingDashboard');

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-black to-black/60 bg-clip-text text-transparent drop-shadow-xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">{t('subtitle')}</p>
      </div>

      <FinancialOverview />
    </div>
  );
}
