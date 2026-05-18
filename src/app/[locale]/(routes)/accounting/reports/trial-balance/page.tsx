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
  FileText
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/input';
import { useToast } from '@/components/usetoast';

interface TrialBalanceAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

interface TrialBalanceData {
  date: string;
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialBalanceData | null>(null);
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
      const response = await reportAPI.getTrialBalance(asOfDate);
      const rawData = response.data.data || response.data;
      setData(rawData || null);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch Trial Balance report',
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
            <h1 className="text-3xl font-bold">{t('trialBalance') || 'Trial Balance'}</h1>
            <p className="text-muted-foreground">Snapshot of all ledger account balances</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-end gap-3 glass p-4 rounded-xl border border-white/20 shadow-lg">
          <div className="space-y-1.5 px-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> Report Date
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
              <CardHeader className="bg-muted/30 border-b border-white/5 p-8 text-center bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-3xl font-black tracking-tighter">TRIAL BALANCE</CardTitle>
                <CardDescription className="text-lg font-medium opacity-80">
                  Status as of {format(new Date(data.date), 'dd MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="px-8 py-4 text-left">Code</th>
                                <th className="px-8 py-4 text-left">Account Name</th>
                                <th className="px-8 py-4 text-right">Debit</th>
                                <th className="px-8 py-4 text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.accounts.map(account => (
                                <tr key={account.id} className="hover:bg-muted/20 transition-all border-l-4 border-transparent hover:border-primary/50">
                                    <td className="px-8 py-4 font-mono font-bold text-primary/70">{account.code}</td>
                                    <td className="px-8 py-4 font-medium">{account.name}</td>
                                    <td className="px-8 py-4 text-right font-mono">
                                        {account.debit > 0 ? `RM ${account.debit.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-8 py-4 text-right font-mono">
                                        {account.credit > 0 ? `RM ${account.credit.toFixed(2)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-muted/30 border-t-2 border-primary/20">
                            <tr className="text-lg font-black bg-gradient-to-r from-primary/10 to-transparent">
                                <td colSpan={2} className="px-8 py-6 text-right uppercase tracking-widest">Grand Totals</td>
                                <td className="px-8 py-6 text-right text-primary underline decoration-double underline-offset-4">
                                    RM {data.totalDebit.toFixed(2)}
                                </td>
                                <td className="px-8 py-6 text-right text-primary underline decoration-double underline-offset-4">
                                    RM {data.totalCredit.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className={`glass-card shadow-xl border-white/10 transition-all duration-700 ${data.isBalanced ? 'border-green-500/50' : 'border-red-500/50 animate-pulse'}`}>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xs uppercase tracking-[0.3em] font-black text-muted-foreground">General Ledger Sync</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 pb-10">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center p-6 transition-all duration-700 ${data.isBalanced ? 'bg-green-500/10 text-green-400 shadow-[0_0_50px_rgba(34,197,94,0.3)] rotate-0' : 'bg-red-500/10 text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-bounce'}`}>
                        {data.isBalanced ? <ShieldCheck size={64} className="drop-shadow-glow" /> : <AlertTriangle size={64} className="drop-shadow-glow" />}
                    </div>
                    <div className="text-center space-y-2 px-4">
                        <p className={`text-2xl font-black tracking-tighter ${data.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                            {data.isBalanced ? 'FULLY BALANCED' : 'OUT OF BALANCE'}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {data.isBalanced 
                                ? 'Your internal ledger is mathematically correct. Total debits equal total credits.' 
                                : 'A discrepancy has been detected. Please audit your recent manual journal entries.'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 rounded-3xl glass border border-white/10 flex flex-col gap-4 shadow-2xl">
                <Button className="w-full vibrant-gradient text-white flex gap-3 justify-center py-7 text-lg font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <Printer size={22} /> PRINT TRIAL BALANCE
                </Button>
                <Button variant="outline" className="w-full border-white/10 py-6 text-sm font-bold hover:bg-white/5 transition-all flex gap-2">
                    <FileText size={18} /> EXPORT TO EXCEL
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter mt-2 opacity-50 px-2 leading-relaxed">
                    Generated automatically using double-entry logic and real-time ledger records.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
