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

interface LocationItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  location: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  inventoryValue: number;
}

export default function InventoryByLocationReport() {
  const router = useRouter();
  const t = useTranslations('inventory');
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocationItem[]>([]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getInventoryByLocation();
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to fetch Inventory By Location',
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

  // Group by warehouse
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.warehouseName]) {
      acc[item.warehouseName] = { items: [], totalValue: 0, totalQty: 0 };
    }
    acc[item.warehouseName].items.push(item);
    acc[item.warehouseName].totalValue += item.inventoryValue;
    acc[item.warehouseName].totalQty += item.quantity;
    return acc;
  }, {} as Record<string, { items: LocationItem[], totalValue: number, totalQty: number }>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('inventoryByLocation') || 'Inventory By Location'}</h1>
            <p className="text-muted-foreground">Breakdown of stock levels across all warehouses and stores</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No inventory assigned to locations found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-8">
            {Object.entries(groupedData).map(([warehouseName, group]) => (
              <Card key={warehouseName} className="glass-card overflow-hidden shadow-2xl border-white/10">
                <CardHeader className="bg-muted/30 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tighter text-primary">{warehouseName}</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-80">
                      Total Assets: {formatCurrency(group.totalValue)} • Items Stored: {group.totalQty}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                          <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-black">
                              <tr>
                                  <th className="px-6 py-3 text-left">SKU</th>
                                  <th className="px-6 py-3 text-left">Product Name</th>
                                  <th className="px-6 py-3 text-right">Quantity</th>
                                  <th className="px-6 py-3 text-right">Value</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {group.items.map(item => (
                                  <tr key={item.id} className="hover:bg-muted/20 transition-all border-l-4 border-transparent hover:border-primary/50 cursor-pointer">
                                      <td className="px-6 py-3 font-mono font-bold text-muted-foreground">{item.sku || '-'}</td>
                                      <td className="px-6 py-3 font-bold">{item.productName}</td>
                                      <td className="px-6 py-3 text-right font-mono font-bold text-primary">{item.quantity}</td>
                                      <td className="px-6 py-3 text-right font-mono">{formatCurrency(item.inventoryValue)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl glass border border-white/10 flex flex-col gap-4 shadow-2xl sticky top-6">
                <Button className="w-full vibrant-gradient text-white flex gap-3 justify-center py-7 text-lg font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <Printer size={22} /> PRINT REPORT
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
