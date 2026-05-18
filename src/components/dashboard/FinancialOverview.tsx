'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { reportAPI } from '@/services/api/report';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Receipt,
  Scale
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface FinancialStats {
  revenue: number;
  expenses: number;
  netProfit: number;
  receivables: number;
  payables: number;
  profitMargin: number;
}

export function FinancialOverview() {
  const t = useTranslations('AccountingDashboard');
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const start = format(startOfMonth(now), 'yyyy-MM-dd');
        const end = format(endOfMonth(now), 'yyyy-MM-dd');

        // Fetch P&L for current month
        const plRes = await reportAPI.getProfitAndLoss(start, end);
        const plData = plRes.data.data || plRes.data;

        // Fetch Balance Sheet for current status
        const bsRes = await reportAPI.getBalanceSheet(format(now, 'yyyy-MM-dd'));
        const bsData = bsRes.data.data || bsRes.data;

        // Extract receivables and payables
        // These are hardcoded codes in the autoJournal service: 1200 (AR), 2100 (AP)
        const findBalance = (accounts: any[], codes: string[]) => {
            return accounts
                .filter((a: any) => codes.includes(a.code))
                .reduce((sum: number, a: any) => sum + (a.amount || a.total || 0), 0);
        };

        setStats({
          revenue: plData.totalRevenue || 0,
          expenses: plData.totalExpenses || plData.totalExpense || 0,
          netProfit: plData.netProfit || 0,
          receivables: findBalance(bsData.assets || [], ['1200']),
          payables: findBalance(bsData.liabilities || [], ['2100']),
          profitMargin: plData.totalRevenue ? (plData.netProfit / plData.totalRevenue) * 100 : 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card animate-pulse h-32"></Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: t('revenue'),
      value: stats?.revenue || 0,
      icon: <TrendingUp className="text-green-500" />,
      trend: stats?.revenue ? '+12%' : '0%',
      color: 'text-green-500'
    },
    {
      title: t('expenses'),
      value: stats?.expenses || 0,
      icon: <TrendingDown className="text-red-500" />,
      trend: stats?.expenses ? '+5%' : '0%',
      color: 'text-red-500'
    },
    {
      title: t('netProfit'),
      value: stats?.netProfit || 0,
      icon: <DollarSign className="text-primary" />,
      trend: (stats?.netProfit || 0) > 0 ? '+15%' : '0%',
      color: 'text-primary'
    }
  ];

  const subStats = [
    { title: t('receivables'), value: stats?.receivables || 0, icon: <Receipt size={16}/> },
    { title: t('payables'), value: stats?.payables || 0, icon: <Wallet size={16}/> },
    { title: t('profitMargin'), value: `${(stats?.profitMargin || 0).toFixed(1)}%`, icon: <Scale size={16}/> }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden border-white/10 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/5 rounded-lg">
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                   {stat.trend} <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className={`text-2xl font-black mt-1 ${stat.color}`}>RM {(stat.value as number).toFixed(2)}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="glass-card border-white/10 overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Scale size={20} className="text-primary" /> {t('performance')}
               </CardTitle>
               <CardDescription>{t('last30Days')}</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {subStats.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-lg text-primary">
                             {sub.icon}
                          </div>
                          <span className="text-sm font-medium">{sub.title}</span>
                       </div>
                       <span className="font-bold">
                          {typeof sub.value === 'number' ? `RM ${sub.value.toFixed(2)}` : sub.value}
                       </span>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="glass-card border-white/10 overflow-hidden">
            <CardHeader>
               <CardTitle className="text-lg">Metric Trends</CardTitle>
               <CardDescription>Visualizing financial health</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[200px] items-center justify-center border-t border-white/5 bg-white/5">
                <div className="text-center space-y-2">
                   <p className="text-xs text-muted-foreground italic">Chart library pending approval...</p>
                   {/* Fallback CSS bar chart if needed */}
                   <div className="flex items-end gap-2 h-20 px-4">
                      <div className="w-8 bg-green-500/50 rounded-t h-[60%] animate-bounce"></div>
                      <div className="w-8 bg-red-500/50 rounded-t h-[40%] animate-bounce [animation-delay:200ms]"></div>
                      <div className="w-8 bg-green-500/50 rounded-t h-[80%] animate-bounce [animation-delay:400ms]"></div>
                      <div className="w-8 bg-red-500/50 rounded-t h-[30%] animate-bounce [animation-delay:600ms]"></div>
                   </div>
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
