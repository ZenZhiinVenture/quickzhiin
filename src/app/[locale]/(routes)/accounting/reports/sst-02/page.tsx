'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api/report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { ChevronLeft, Printer, FileText, Calendar, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/input';
import { useToast } from '@/components/usetoast';

interface SST02Data {
  period: { start: string; end: string };
  sales: { taxableAmount: number; taxAmount: number; totalAmount: number };
  purchases: { taxableAmount: number; taxAmount: number; totalAmount: number };
  summary: { netTaxPayable: number };
}

export default function SST02Report() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SST02Data | null>(null);
  
  // Default to current year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const [startDate, setStartDate] = useState(startOfYear.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getSST02(startDate, endDate);
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to fetch SST-02 Report',
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
            <h1 className="text-3xl font-bold">SST-02 Form Preparation</h1>
            <p className="text-muted-foreground">Calculate Output and Input Sales & Service Tax</p>
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
      ) : !data ? (
        <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No tax records found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sales / Output Tax Card */}
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tighter text-blue-500">1. SALES (OUTPUT TAX)</CardTitle>
                  <CardDescription className="text-sm font-medium opacity-80">
                    SST Collected from Invoices
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-muted-foreground font-medium">Total Value of Taxable Goods Sold (Excl. Tax)</span>
                      <span className="font-mono font-bold text-lg">{formatCurrency(data.sales.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-muted-foreground font-medium">Total Amount of Tax Levied (SST Collected)</span>
                      <span className="font-mono font-black text-xl text-blue-500">{formatCurrency(data.sales.taxAmount)}</span>
                  </div>
              </CardContent>
            </Card>

            {/* Purchases / Input Tax Card */}
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10">
              <CardHeader className="bg-muted/30 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tighter text-orange-500">2. PURCHASES (INPUT TAX)</CardTitle>
                  <CardDescription className="text-sm font-medium opacity-80">
                    SST Paid on Bills & Expenses
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-muted-foreground font-medium">Total Value of Taxable Goods Purchased (Excl. Tax)</span>
                      <span className="font-mono font-bold text-lg">{formatCurrency(data.purchases.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-muted-foreground font-medium">Total Amount of Tax Paid (SST Deducted)</span>
                      <span className="font-mono font-black text-xl text-orange-500">{formatCurrency(data.purchases.taxAmount)}</span>
                  </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="glass-card overflow-hidden shadow-2xl border-white/10 border-t-4 border-t-primary">
              <CardHeader className="bg-primary/5 border-b border-white/5 p-6 text-center">
                  <CardTitle className="text-3xl font-black tracking-tighter uppercase text-primary">Total Net Tax Payable</CardTitle>
                  <CardDescription className="text-sm font-medium opacity-80 uppercase tracking-widest mt-2">
                    (Output Tax - Input Tax)
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center">
                  <span className={`text-6xl font-black font-mono tracking-tighter ${data.summary.netTaxPayable < 0 ? 'text-red-500' : 'text-primary'}`}>
                      {formatCurrency(data.summary.netTaxPayable)}
                  </span>
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl glass border border-white/10 flex flex-col gap-4 shadow-2xl sticky top-6">
                <Button className="w-full vibrant-gradient text-white flex gap-3 justify-center py-7 text-lg font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <Printer size={22} /> PRINT FORM
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter mt-4 opacity-50 px-2 leading-relaxed">
                    This form summarizes your Output Tax (Sales) and Input Tax (Purchases) for the selected taxable period.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
