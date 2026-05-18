'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, ShoppingBag, ClipboardList, Truck, TrendingUp, History, FileText, Receipt, MoreVertical } from 'lucide-react';
import { tradeAPI } from '@/services/api/trade';
import { DataTable } from '@/components/datatable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/dropdown';
import { useToast } from '@/components/usetoast';
import { Badge } from '@/components/badge';
import dayjs from 'dayjs';
import { TradeWizardModal } from '@/components/modals/trade-wizard-modal';

export default function SalesDashboard() {
  const t = useTranslations('Navigation');
  const { toast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'SALES_QUOTE' | 'SALES_ORDER' | 'SALES_INVOICE'>('SALES_QUOTE');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, oRes, iRes] = await Promise.all([
        tradeAPI.getQuotes(),
        tradeAPI.getOrders(),
        tradeAPI.getInvoices()
      ]);
      setQuotes(qRes.data.data?.items || []);
      setOrders(oRes.data.data?.items || []);
      setInvoices(iRes.data.data?.items || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch sales data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptQuote = async (id: string, target: 'ORDER' | 'INVOICE') => {
    try {
      setLoading(true);
      await tradeAPI.acceptQuote(id, target);
      toast({
        title: "Success",
        description: `Quote converted to ${target.toLowerCase()} successfully.`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to convert quote',
      });
    } finally {
      setLoading(false);
    }
  };

  const quoteColumns = [
    { accessorKey: 'number', header: 'Quote #' },
    { 
      accessorKey: 'contact.legalname', 
      header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || row.original.customer?.legalname || 'Unknown'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total).toFixed(2)}` },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'READY' ? 'secondary' : 'default'}>
          {row.original.status}
        </Badge>
      ) 
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const quote = row.original;
        if (quote.status === 'READY') return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleAcceptQuote(quote.id, 'INVOICE')}>
                <Receipt className="mr-2 h-4 w-4" /> Convert to Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAcceptQuote(quote.id, 'ORDER')}>
                <ShoppingBag className="mr-2 h-4 w-4" /> Convert to Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const orderColumns = [
    { accessorKey: 'number', header: 'Order #' },
    { 
      accessorKey: 'contact.legalname', 
      header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || row.original.customer?.legalname || 'Unknown'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total).toFixed(2)}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge>{row.original.status}</Badge> },
  ];

  const invoiceColumns = [
    { accessorKey: 'number', header: 'Invoice #' },
    { 
        accessorKey: 'contact.legalname', 
        header: 'Customer',
        cell: ({ row }: any) => row.original.contact?.legalname || row.original.customer?.legalname || 'Unknown'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total).toFixed(2)}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge variant="outline" className="border-green-500 text-green-500">{row.original.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl vibrant-gradient text-white shadow-lg shadow-primary/20">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('sales')}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" />
              Manage your sales cycle from lead to delivery.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass hover:bg-accent/50 transition-all duration-300">
            <History size={18} className="mr-2" /> Activity Log
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="vibrant-gradient text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
                <Plus size={18} className="mr-2" /> New Transaction
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Sales Transaction</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setWizardType('SALES_QUOTE'); setIsWizardOpen(true); }}>
                <ClipboardList size={14} className="mr-2" /> New Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setWizardType('SALES_ORDER'); setIsWizardOpen(true); }}>
                <ShoppingBag size={14} className="mr-2" /> New Sales Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setWizardType('SALES_INVOICE'); setIsWizardOpen(true); }}>
                <Receipt size={14} className="mr-2" /> New Tax Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{quotes.filter((q: any) => q.status === 'DRAFT').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for conversion</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Confirmed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-500">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">To be fulfilled</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unpaid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{invoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monthly Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              RM {(Number(orders.reduce((acc: number, cur: any) => acc + Number(cur.total), 0)) + Number(invoices.reduce((acc: number, cur: any) => acc + Number(cur.total), 0))).toFixed(2)}
            </div>
            <p className="text-xs text-green-500 mt-1">Confirmed sales this month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <Tabs defaultValue="quotes" className="w-full">
          <CardHeader className="border-b border-border/50 bg-accent/5 pb-0">
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent gap-6 h-auto p-0">
                <TabsTrigger 
                  value="quotes" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <ClipboardList size={18} className="mr-2" /> {t('quotes')}
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <ShoppingBag size={18} className="mr-2" /> {t('orders')}
                </TabsTrigger>
                <TabsTrigger 
                  value="invoices" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <Receipt size={18} className="mr-2" /> {t('invoices')}
                </TabsTrigger>
                <TabsTrigger 
                  value="deliveries" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <Truck size={18} className="mr-2" /> {t('deliveries')}
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="quotes" className="m-0 focus-visible:ring-0">
              <DataTable columns={quoteColumns} data={quotes} search="number" />
            </TabsContent>
            <TabsContent value="orders" className="m-0 focus-visible:ring-0">
              <DataTable columns={orderColumns} data={orders} search="number" />
            </TabsContent>
            <TabsContent value="invoices" className="m-0 focus-visible:ring-0">
              <DataTable columns={invoiceColumns} data={invoices} search="number" />
            </TabsContent>
            <TabsContent value="deliveries" className="m-0 focus-visible:ring-0">
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-accent/5 rounded-2xl border-2 border-dashed border-border/50">
                <Truck size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Delivery tracking module integrated</p>
                <p className="text-sm">Start by creating a Sales Order.</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <TradeWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        type={wizardType} 
        onSuccess={fetchData}
      />
    </div>
  );
}
