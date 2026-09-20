'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, ShoppingCart, ClipboardList, PackageCheck, TrendingDown, History } from 'lucide-react';
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

export default function PurchasesDashboard() {
  const t = useTranslations('Navigation');
  const { toast } = useToast();
  const [grns, setGrns] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'PURCHASE_REQUISITION' | 'PURCHASE_ORDER'>('PURCHASE_ORDER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grnRes, prRes, poRes] = await Promise.all([
        tradeAPI.getGRNs(),
        tradeAPI.getPurchaseRequisitions(),
        tradeAPI.getPurchaseOrders()
      ]);
      setGrns(grnRes.data.data?.items || []);
      setRequisitions(prRes.data.data?.items || []);
      setOrders(poRes.data.data?.items || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch purchase data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const grnColumns = [
    { accessorKey: 'number', header: 'GRN #' },
    { accessorKey: 'vendor.legalname', header: 'Vendor' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'purchaseOrder.number', header: 'PO #', cell: ({ row }: any) => row.original.purchaseOrder?.number || 'Direct' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge>{row.original.status}</Badge> },
  ];

  const prColumns = [
    { accessorKey: 'number', header: 'PR #' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'requester.firstName', header: 'Requester', cell: ({ row }: any) => `${row.original.requester?.firstName || ''} ${row.original.requester?.lastName || ''}` },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }: any) => <Badge variant="outline">{row.original.priority}</Badge> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge>{row.original.status}</Badge> },
  ];

  const poColumns = [
    { accessorKey: 'number', header: 'PO #' },
    { accessorKey: 'contact.legalname', header: 'Vendor' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${parseFloat(row.original.total || 0).toFixed(2)}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge>{row.original.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/20">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('purchases')}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" />
              Manage procurement and supplier relationships.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass hover:bg-accent/50 transition-all duration-300">
            <History size={18} className="mr-2" /> Purchase History
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="vibrant-gradient text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
                <Plus size={18} className="mr-2" /> New Document
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Procurement</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setWizardType('PURCHASE_REQUISITION'); setIsWizardOpen(true); }}>
                <ClipboardList size={14} className="mr-2" /> New Requisition
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setWizardType('PURCHASE_ORDER'); setIsWizardOpen(true); }}>
                <ShoppingCart size={14} className="mr-2" /> New Purchase Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Purchase Req.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">Expected this week</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{grns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Goods received notes posted</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <Tabs defaultValue="grn" className="w-full">
          <CardHeader className="border-b border-border/50 bg-accent/5 pb-0">
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent gap-6 h-auto p-0">
                <TabsTrigger 
                  value="requisitions" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <ClipboardList size={18} className="mr-2" /> {t('requisitions')}
                </TabsTrigger>
                <TabsTrigger 
                  value="purchase-orders" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <ShoppingCart size={18} className="mr-2" /> {t('purchaseOrders')}
                </TabsTrigger>
                <TabsTrigger 
                  value="grn" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <PackageCheck size={18} className="mr-2" /> {t('goodsReceived')}
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="requisitions" className="m-0 focus-visible:ring-0">
              <DataTable columns={prColumns} data={requisitions} search="number" />
            </TabsContent>
            <TabsContent value="purchase-orders" className="m-0 focus-visible:ring-0">
              <DataTable columns={poColumns} data={orders} search="number" />
            </TabsContent>
            <TabsContent value="grn" className="m-0 focus-visible:ring-0">
              <DataTable columns={grnColumns} data={grns} search="number" />
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
