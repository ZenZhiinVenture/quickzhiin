'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api/report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { ChevronLeft, Printer, FileText, Calendar, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/input';
import { useToast } from '@/components/usetoast';

interface MovementItem {
  id: string;
  date: string;
  productId: string;
  productName: string;
  sku: string;
  type: string;
  quantity: number;
  fromWarehouse: string | null;
  toWarehouse: string | null;
  referenceId: string | null;
  notes: string | null;
}

export default function InventoryDetailReport() {
  const router = useRouter();
  const t = useTranslations('inventory');
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MovementItem[]>([]);
  
  // Default to last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getInventoryDetail(startDate, endDate);
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to fetch Inventory Detail',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const getMovementColor = (type: string, quantity: number) => {
    if (quantity > 0) return 'text-green-400 bg-green-500/10';
    if (quantity < 0) return 'text-red-400 bg-red-500/10';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('inventoryDetail') || 'Inventory Detail'}</h1>
            <p className="text-muted-foreground">Detailed ledger of all stock movements</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-end gap-3 glass p-4 rounded-xl border border-white/20 shadow-lg">
          <div className="space-y-1.5 px-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> Start Date
            </label>
            <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-9 w-40 bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-1.5 px-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> End Date
            </label>
            <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-9 w-40 bg-background/50 border-white/10"
            />
          </div>
          <Button onClick={fetchReport} className="vibrant-gradient text-white h-9 px-6 shadow-md transition-all active:scale-95">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : data.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No stock movements found in this period.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30 border-b border-white/5 p-8">
                <CardTitle className="text-2xl font-black tracking-tighter">STOCK MOVEMENT LEDGER</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Product</th>
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                                <th className="px-6 py-4 text-left">Location (From ➔ To)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map(item => (
                                <tr key={item.id} className="hover:bg-muted/20 transition-all border-l-4 border-transparent hover:border-primary/50 cursor-pointer">
                                    <td className="px-6 py-4 font-mono text-muted-foreground">{format(new Date(item.date), 'dd/MM/yyyy HH:mm')}</td>
                                    <td className="px-6 py-4 font-bold">
                                      {item.productName}
                                      <div className="text-[10px] text-muted-foreground font-mono">{item.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="px-2 py-1 rounded bg-muted/50 text-[10px] font-bold uppercase tracking-wider">{item.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-black">
                                      <span className={`px-2 py-1 rounded ${getMovementColor(item.type, item.quantity)}`}>
                                        {item.quantity > 0 ? '+' : ''}{item.quantity}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                      {item.fromWarehouse || 'External'} ➔ {item.toWarehouse || 'External'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl glass border border-white/10 flex flex-col gap-4 shadow-2xl sticky top-6">
                <Button className="w-full vibrant-gradient text-white flex gap-3 justify-center py-7 text-lg font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <Printer size={22} /> PRINT LEDGER
                </Button>
                <Button variant="outline" className="w-full border-white/10 py-6 text-sm font-bold hover:bg-white/5 transition-all flex gap-2">
                    <FileText size={18} /> EXPORT CSV
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
