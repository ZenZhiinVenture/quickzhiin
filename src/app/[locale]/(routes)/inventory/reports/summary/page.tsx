'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api/report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { ChevronLeft, Printer, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from '@/components/usetoast';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  quantityOnHand: number;
  purchasePrice: number;
  salePrice: number;
  inventoryValue: number;
}

interface InventorySummaryData {
  items: InventoryItem[];
  totalAssetValue: number;
}

export default function InventorySummaryReport() {
  const router = useRouter();
  const t = useTranslations('inventory');
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventorySummaryData | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getInventorySummary();
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to fetch Inventory Summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount: number) => `RM ${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('inventorySummary') || 'Inventory Summary'}</h1>
            <p className="text-muted-foreground">Monitor current stock levels and total asset valuation</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !data ? (
        <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No inventory items found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30 border-b border-white/5 p-8 text-center bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-3xl font-black tracking-tighter">INVENTORY SUMMARY</CardTitle>
                <CardDescription className="text-lg font-medium opacity-80">
                  As of {format(new Date(), 'dd MMMM yyyy, HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="px-6 py-4 text-left">SKU</th>
                                <th className="px-6 py-4 text-left">Product Name</th>
                                <th className="px-6 py-4 text-right">Qty on Hand</th>
                                <th className="px-6 py-4 text-right">Avg Unit Cost</th>
                                <th className="px-6 py-4 text-right">Retail Price</th>
                                <th className="px-6 py-4 text-right text-primary font-bold">Total Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.items.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-8 py-12 text-center text-muted-foreground font-medium">
                                  No tracked inventory products found.
                                </td>
                              </tr>
                            ) : (
                              data.items.map(item => (
                                  <tr key={item.id} className="hover:bg-muted/20 transition-all border-l-4 border-transparent hover:border-primary/50 cursor-pointer">
                                      <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{item.sku || '-'}</td>
                                      <td className="px-6 py-4 font-bold">{item.name}</td>
                                      <td className="px-6 py-4 text-right font-mono font-bold">{item.quantityOnHand}</td>
                                      <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.purchasePrice)}</td>
                                      <td className="px-6 py-4 text-right font-mono text-muted-foreground">{formatCurrency(item.salePrice)}</td>
                                      <td className="px-6 py-4 text-right font-mono font-bold text-primary">{formatCurrency(item.inventoryValue)}</td>
                                  </tr>
                              ))
                            )}
                        </tbody>
                        {data.items.length > 0 && (
                          <tfoot className="bg-muted/30 border-t-2 border-primary/20">
                              <tr className="text-lg font-black bg-gradient-to-r from-primary/10 to-transparent">
                                  <td colSpan={5} className="px-6 py-6 text-right uppercase tracking-widest">Total Asset Value</td>
                                  <td className="px-6 py-6 text-right text-primary underline decoration-double underline-offset-4">
                                      {formatCurrency(data.totalAssetValue)}
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
                    This report represents the total financial value of all goods physically stored across all locations.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
