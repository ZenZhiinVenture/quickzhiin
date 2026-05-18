'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { 
  FileText, 
  BarChart3, 
  Scale, 
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function ReportsPage() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const reports = [
    {
      title: t('ledger'),
      description: 'Detailed transaction history for every account in your chart of accounts.',
      icon: History,
      href: `/${locale}/accounting/reports/ledger`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: t('profitLoss'),
      description: 'Summary of your revenue and expenses over a specific period. See your net profit.',
      icon: TrendingUp,
      href: `/${locale}/accounting/reports/profit-loss`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: t('balanceSheet'),
      description: 'A snapshot of your financial position: what you own and what you owe.',
      icon: Scale,
      href: `/${locale}/accounting/reports/balance-sheet`,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: t('trialBalance'),
      description: 'A summary of all your ledger account balances to ensure your books are in balance.',
      icon: Scale,
      href: `/${locale}/accounting/reports/trial-balance`,
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {t('reports')}
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive financial insights and regulatory statements for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Link key={report.href} href={report.href} className="group">
            <Card className="glass-card h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden ring-1 ring-white/10">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${report.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <report.icon size={24} />
                </div>
                <CardTitle className="text-2xl">{report.title}</CardTitle>
                <CardDescription className="text-base line-clamp-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary font-medium group-hover:underline">
                  View Report <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="glass-card border-dashed bg-transparent mt-12">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <BarChart3 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">More reports coming soon</h3>
            <p className="text-muted-foreground max-w-md">
              We are working on Tax Compliance reports (SST/GST/VAT) and Budgeting tools to help you stay ahead.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
