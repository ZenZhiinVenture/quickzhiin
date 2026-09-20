'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, Warehouse, History, Package, ArrowLeftRight, Settings2 } from 'lucide-react';
import { tradeAPI } from '@/services/api/trade';
import { DataTable } from '@/components/datatable';
import { useToast } from '@/components/usetoast';
import { Badge } from '@/components/badge';

export default function InventoryDashboard() {
  const t = useTranslations('Navigation');
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await tradeAPI.getWarehouses();
      setWarehouses(res.data.data?.items || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch inventory data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const warehouseColumns = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge>{row.original.isActive ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <Warehouse size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('inventory')}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Package size={14} className="text-emerald-500" />
              Monitor stock levels across all storage locations.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass hover:bg-accent/50 transition-all duration-300">
            <ArrowLeftRight size={18} className="mr-2" /> Stock Transfer
          </Button>
          <Button className="vibrant-gradient text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
            <Plus size={18} className="mr-2" /> New Warehouse
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500 col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Multi-location storage active</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Stock Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">RM 0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Weighted average cost</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">Items below reorder point</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <Tabs defaultValue="warehouses" className="w-full">
          <CardHeader className="border-b border-border/50 bg-accent/5 pb-0">
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent gap-6 h-auto p-0">
                <TabsTrigger 
                  value="warehouses" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <Warehouse size={18} className="mr-2" /> {t('warehouses')}
                </TabsTrigger>
                <TabsTrigger 
                  value="movements" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <History size={18} className="mr-2" /> {t('stockMovements')}
                </TabsTrigger>
                <TabsTrigger 
                  value="adjustment" 
                  className="px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300"
                >
                  <Settings2 size={18} className="mr-2" /> Stock Adjustment
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="warehouses" className="m-0 focus-visible:ring-0">
              <DataTable columns={warehouseColumns} data={warehouses} search="name" />
            </TabsContent>
            <TabsContent value="movements" className="m-0 focus-visible:ring-0">
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <History size={48} className="mb-4 opacity-20" />
                <p>Select a product to view its stock movements.</p>
              </div>
            </TabsContent>
            <TabsContent value="adjustment" className="m-0 focus-visible:ring-0">
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Settings2 size={48} className="mb-4 opacity-20" />
                <p>Stock adjustment history will appear here.</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
