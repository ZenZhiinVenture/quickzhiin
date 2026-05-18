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
  Scale,
  ShieldCheck,
  AlertTriangle,
  Zap,
  DollarSign
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/input';
import { useToast } from '@/components/usetoast';

interface ReportAccount {
  id: string;
  code: string;
  name: string;
  total: number;
}

interface BalanceSheetData {
  asOfDate: string;
  assets: ReportAccount[];
  liabilities: ReportAccount[];
  equity: ReportAccount[];
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanceCheck: boolean;
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations('Navigation');
  const { toast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getBalanceSheet(asOfDate);
      const rawData = response.data.data || response.data;
      
      setData({
        ...rawData,
        assets: rawData.assets || [],
        liabilities: rawData.liabilities || [],
        equity: rawData.equity || [],
        netIncome: rawData.currentYearEarnings || rawData.netIncome || 0,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch Balance Sheet report',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('balanceSheet')}</h1>
            <p className="text-muted-foreground">Statement of Financial Position</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-end gap-3 glass p-4 rounded-xl shadow-lg border border-white/20">
          <div className="space-y-1 px-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar size={10} /> As of Date
            </label>
            <Input 
                type="date" 
                value={asOfDate} 
                onChange={(e) => setAsOfDate(e.target.value)} 
                className="h-9 w-44 bg-background/50 border-white/10"
            />
          </div>
          <Button onClick={fetchReport} className="vibrant-gradient text-white h-9 px-6 shadow-md transition-all active:scale-95">
            <Filter size={16} className="mr-2" /> Recalculate
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30 border-b border-white/5 p-8 text-center">
                <CardTitle className="text-3xl font-black">BALANCE SHEET</CardTitle>
                <CardDescription className="text-lg">
                  At {format(new Date(asOfDate), 'dd MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {/* ASSETS */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <Zap size={22} /> Assets
                    </h3>
                    <div className="space-y-4">
                        {data.assets.map(acc => (
                            <div key={acc.id} className="flex justify-between items-center px-4 py-2 hover:bg-muted/20 border-l-2 border-blue-400/20 rounded-r transition-all">
                                <span className="text-lg text-muted-foreground">{acc.code} - {acc.name}</span>
                                <span className="text-lg font-bold">RM {acc.total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-2xl font-black">
                        <span>TOTAL ASSETS</span>
                        <span className="text-blue-400">RM {data.totalAssets.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* LIABILITIES */}
                  <div className="p-8 bg-muted/10">
                    <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <AlertTriangle size={22} /> Liabilities
                    </h3>
                    <div className="space-y-4">
                        {data.liabilities.map(acc => (
                            <div key={acc.id} className="flex justify-between items-center px-4 py-2 hover:bg-muted/20 border-l-2 border-red-400/20 rounded-r transition-all">
                                <span className="text-lg text-muted-foreground">{acc.code} - {acc.name}</span>
                                <span className="text-lg font-bold">RM {acc.total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-2xl font-black">
                        <span>TOTAL LIABILITIES</span>
                        <span className="text-red-400">RM {data.totalLiabilities.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* EQUITY */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <DollarSign size={22} /> Equity
                    </h3>
                    <div className="space-y-4">
                        {data.equity.map(acc => (
                            <div key={acc.id} className="flex justify-between items-center px-4 py-2 hover:bg-muted/20 border-l-2 border-purple-400/20 rounded-r transition-all">
                                <span className="text-lg text-muted-foreground">{acc.code} - {acc.name}</span>
                                <span className="text-lg font-bold">RM {acc.total.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center px-4 py-2 bg-purple-500/5 border-l-2 border-purple-500 rounded-r">
                            <span className="text-lg font-semibold text-purple-200">Current Period Net Income</span>
                            <span className="text-lg font-bold text-purple-200">RM {data.netIncome.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-2xl font-black">
                        <span>TOTAL EQUITY</span>
                        <span className="text-purple-400">RM {data.totalEquity.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* GRAND TOTAL L+E */}
                  <div className="p-10 vibrant-gradient text-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase tracking-[0.2em] shadow-sm">Total Liabilities & Equity</h3>
                        <p className="text-xs text-white/70">Calculated sum of liabilities and adjusted equity</p>
                    </div>
                    <div className="text-5xl font-black drop-shadow-lg">
                        RM {(data.totalLiabilities + data.totalEquity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className={`glass-card shadow-xl border-white/10 transition-all duration-700 ${data.balanceCheck ? 'border-green-500/50' : 'border-red-500/50 animate-pulse'}`}>
                <CardHeader>
                    <CardTitle className="text-center text-lg uppercase tracking-widest font-bold">Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 pb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center p-4 transition-all duration-500 ${data.balanceCheck ? 'bg-green-500/20 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}>
                        {data.balanceCheck ? <ShieldCheck size={48} /> : <AlertTriangle size={48} />}
                    </div>
                    <div className="text-center space-y-1">
                        <p className={`text-xl font-black ${data.balanceCheck ? 'text-green-400' : 'text-red-400'}`}>
                            {data.balanceCheck ? 'IN BALANCE' : 'OUT OF BALANCE'}
                        </p>
                        <p className="text-xs text-muted-foreground px-4">
                            Assets equals Liabilities plus Equity.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card shadow-lg border-white/10">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold uppercase tracking-widest">Reports Action</h4>
                        <div className="w-full flex flex-col gap-2">
                            <Button className="w-full vibrant-gradient text-white flex gap-2">
                                <Printer size={16} /> Print Statement
                            </Button>
                            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 text-primary font-bold mb-1">
                            <Scale size={16} /> <span className="text-xs uppercase">Liquidity Check</span>
                        </div>
                        <div className="text-lg font-black">
                            {(data.totalAssets / data.totalLiabilities).toFixed(2)}
                            <span className="text-[10px] text-muted-foreground ml-1">Current Ratio</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
