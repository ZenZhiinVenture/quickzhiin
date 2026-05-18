'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api/report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import {
  ChevronLeft,
  Calendar,
  Filter,
  Printer,
  TrendingDown,
  TrendingUp,
  Percent,
  MinusCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '@/components/badge';
import { Input } from '@/components/input';
import { useToast } from '@/components/usetoast';
import { Progress } from '@/components/progress';

interface ReportAccount {
  id: string;
  code: string;
  name: string;
  total: number;
}

interface ProfitLossData {
  startDate: string;
  endDate: string;
  revenue: ReportAccount[];
  expenses: ReportAccount[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export default function ProfitLossPage() {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations('Navigation');
  const { toast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getProfitAndLoss(startDate, endDate);
      const rawData = response.data.data || response.data;
      
      setData({
        ...rawData,
        revenue: rawData.revenue || [],
        expenses: rawData.expenses || rawData.expense || [],
        totalExpenses: rawData.totalExpenses || rawData.totalExpense || 0
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch Profit & Loss report',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const profitMargin = data?.totalRevenue ? (data.netProfit / data.totalRevenue) * 100 : 0;
  const expenseRatio = data?.totalRevenue ? (data.totalExpenses / data.totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('profitLoss')}</h1>
            <p className="text-muted-foreground">Profit & Loss Statement</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 glass p-4 rounded-xl shadow-lg border border-white/20">
          <div className="space-y-1 px-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar size={10} /> Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-40 bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-1 px-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar size={10} /> End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-40 bg-background/50 border-white/10"
            />
          </div>
          <Button onClick={fetchReport} className="vibrant-gradient text-white h-9 px-6 shadow-md active:scale-95 transition-all">
            <Filter size={16} className="mr-2" /> Update Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !data ? (
        <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">Error loading report data.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30">
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>
                  For the period from {format(new Date(startDate), 'dd MMMM yyyy')} to {format(new Date(endDate), 'dd MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <TrendingUp size={20} /> Revenue
                    </h3>
                    <div className="space-y-3">
                      {data.revenue.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center px-2 py-1 hover:bg-muted/20 rounded transition-colors">
                          <span className="text-muted-foreground">{acc.code} - {acc.name}</span>
                          <span className="font-medium">RM {acc.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xl font-black">
                      <span>Total Revenue</span>
                      <span className="text-primary underline decoration-double underline-offset-4 decoration-primary/30">RM {data.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                      <TrendingDown size={20} /> Operating Expenses
                    </h3>
                    <div className="space-y-3">
                      {data.expenses.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center px-2 py-1 hover:bg-muted/20 rounded transition-colors">
                          <span className="text-muted-foreground">{acc.code} - {acc.name}</span>
                          <span className="font-medium">RM {acc.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xl font-black">
                      <span>Total Expenses</span>
                      <span className="text-red-500">RM {data.totalExpenses.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className={`p-8 vibrant-gradient text-white flex justify-between items-center`}>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase tracking-widest">NET PROFIT</h3>
                      <p className="text-xs text-white/70">Bottom-line earnings for the period</p>
                    </div>
                    <div className="text-4xl font-black shadow-text">
                      RM {data.netProfit.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card shadow-lg border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent size={18} /> Financial Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Profit Margin</span>
                    <span className="font-bold">{profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={profitMargin} className="h-2 bg-muted transition-all duration-500" />
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    {profitMargin > 20 ? 'Excellent! Above industry average.' : 'Good, but focus on cost optimization.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expense Ratio</span>
                    <span className="font-bold text-red-500">{expenseRatio.toFixed(1)}%</span>
                  </div>
                  <Progress value={expenseRatio} className="h-2 bg-muted transition-all duration-500" />
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Expenses represent {expenseRatio.toFixed(1)}% of your total revenue.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">Avg. Monthly</div>
                      <div className="text-lg font-bold">RM {(data.totalRevenue / 12).toFixed(2)}</div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Expenses</h4>
                      <div className="text-3xl font-black text-red-400">RM {data.totalExpenses.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl glass border border-white/10 flex flex-col gap-4">
              <Button className="w-full flex gap-2 justify-center py-6 text-lg font-bold shadow-xl shadow-primary/20 vibrant-gradient text-white">
                <Printer size={20} /> Print Statement
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                This report is generated automatically based on your journal entries and ledger data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
