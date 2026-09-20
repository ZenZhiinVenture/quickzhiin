'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api/report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { 
  ChevronLeft, 
  Printer,
  FileText
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from '@/components/usetoast';

interface AgedBucketItem {
  contactId: string;
  contactName: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
  total: number;
}

interface AgedReceivablesData {
  items: AgedBucketItem[];
  grandTotal: number;
}

export default function AgedReceivablesReport() {
  const router = useRouter();
  const t = useTranslations('accounting');
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AgedReceivablesData | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getAgedReceivables();
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to fetch Aged Receivables report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount === 0 ? '-' : `RM ${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('agedReceivables') || 'Aged Receivables'}</h1>
            <p className="text-muted-foreground">Monitor outstanding balances owed by customers</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !data ? (
        <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No outstanding receivables found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30 border-b border-white/5 p-8 text-center bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-3xl font-black tracking-tighter">AGED RECEIVABLES</CardTitle>
                <CardDescription className="text-lg font-medium opacity-80">
                  As of {format(new Date(), 'dd MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="px-6 py-4 text-left">Customer Name</th>
                                <th className="px-6 py-4 text-right">Current</th>
                                <th className="px-6 py-4 text-right">1-30 Days</th>
                                <th className="px-6 py-4 text-right">31-60 Days</th>
                                <th className="px-6 py-4 text-right">61-90 Days</th>
                                <th className="px-6 py-4 text-right text-red-400">90+ Days</th>
                                <th className="px-6 py-4 text-right text-primary font-bold">Total Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.items.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-8 py-12 text-center text-muted-foreground font-medium">
                                  Awesome! No customers owe you any money.
                                </td>
                              </tr>
                            ) : (
                              data.items.map(item => (
                                  <tr key={item.contactId} className="hover:bg-muted/20 transition-all border-l-4 border-transparent hover:border-primary/50 cursor-pointer">
                                      <td className="px-6 py-4 font-bold">{item.contactName}</td>
                                      <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.current)}</td>
                                      <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.days_1_30)}</td>
                                      <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.days_31_60)}</td>
                                      <td className="px-6 py-4 text-right font-mono text-orange-400/80">{formatCurrency(item.days_61_90)}</td>
                                      <td className="px-6 py-4 text-right font-mono text-red-400 font-bold">{formatCurrency(item.days_90_plus)}</td>
                                      <td className="px-6 py-4 text-right font-mono font-bold text-primary">{formatCurrency(item.total)}</td>
                                  </tr>
                              ))
                            )}
                        </tbody>
                        {data.items.length > 0 && (
                          <tfoot className="bg-muted/30 border-t-2 border-primary/20">
                              <tr className="text-lg font-black bg-gradient-to-r from-primary/10 to-transparent">
                                  <td className="px-6 py-6 text-right uppercase tracking-widest">Grand Total</td>
                                  <td className="px-6 py-6 text-right font-mono text-muted-foreground">{formatCurrency(data.items.reduce((sum, item) => sum + item.current, 0))}</td>
                                  <td className="px-6 py-6 text-right font-mono text-muted-foreground">{formatCurrency(data.items.reduce((sum, item) => sum + item.days_1_30, 0))}</td>
                                  <td className="px-6 py-6 text-right font-mono text-muted-foreground">{formatCurrency(data.items.reduce((sum, item) => sum + item.days_31_60, 0))}</td>
                                  <td className="px-6 py-6 text-right font-mono text-orange-400/80">{formatCurrency(data.items.reduce((sum, item) => sum + item.days_61_90, 0))}</td>
                                  <td className="px-6 py-6 text-right font-mono text-red-500">{formatCurrency(data.items.reduce((sum, item) => sum + item.days_90_plus, 0))}</td>
                                  <td className="px-6 py-6 text-right text-primary underline decoration-double underline-offset-4">
                                      {formatCurrency(data.grandTotal)}
                                  </td>
                              </tr>
                          </tfoot>
                        )}
                    </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl glass border border-white/10 flex flex-col gap-4 shadow-2xl">
                <Button className="w-full vibrant-gradient text-white flex gap-3 justify-center py-7 text-lg font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <Printer size={22} /> PRINT REPORT
                </Button>
                <Button variant="outline" className="w-full border-white/10 py-6 text-sm font-bold hover:bg-white/5 transition-all flex gap-2">
                    <FileText size={18} /> EXPORT CSV
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter mt-4 opacity-50 px-2 leading-relaxed">
                    This report tracks unpaid invoices to help you manage collections and cash flow efficiently.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
