'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import {
  Plus, ShoppingBag, ClipboardList, Truck, TrendingUp, History,
  FileText, Receipt, MoreVertical, Mail, Send, CheckCircle,
  RefreshCw, Trash2, Eye, FileX, Repeat
} from 'lucide-react';
import { tradeAPI } from '@/services/api/trade';
import { DataTable } from '@/components/datatable';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/dropdown';
import { useToast } from '@/components/usetoast';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { TradeWizardModal } from '@/components/modals/trade-wizard-modal';
import { ActivityLogModal } from '@/components/modals/activity-log-modal';

const TAB_TRIGGER_CLASS =
  'px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300';

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-accent/30 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  label,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  label: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon size={48} className="mb-4 opacity-20" />
      <p className="font-semibold text-base">No {label} yet</p>
      <p className="text-sm mt-1">Create your first {label.toLowerCase()} to get started.</p>
      <Button className="mt-4 vibrant-gradient text-white" onClick={onAction}>
        <Plus size={16} className="mr-2" /> {actionLabel}
      </Button>
    </div>
  );
}

export default function SalesDashboard() {
  const t = useTranslations('Navigation');
  const { toast } = useToast();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'SALES_QUOTE' | 'SALES_ORDER' | 'SALES_INVOICE'>('SALES_QUOTE');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    id: string;
    type: string;
    label: string;
  }>({ isOpen: false, id: '', type: '', label: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, oRes, iRes, cnRes, rfRes] = await Promise.all([
        tradeAPI.getQuotes(),
        tradeAPI.getOrders(),
        tradeAPI.getInvoices(),
        tradeAPI.getSalesCreditNotes().catch(() => ({ data: { data: { items: [] } } })),
        tradeAPI.getSalesRefunds().catch(() => ({ data: { data: { items: [] } } })),
      ]);
      setQuotes(qRes.data.data?.items || []);
      setOrders(oRes.data.data?.items || []);
      setInvoices(iRes.data.data?.items || []);
      setCreditNotes(cnRes.data.data?.items || []);
      setRefunds(rfRes.data.data?.items || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch sales data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAcceptQuote = async (id: string, target: 'ORDER' | 'INVOICE') => {
    try {
      setActionLoading(true);
      await tradeAPI.acceptQuote(id, target);
      toast({ title: 'Success', description: `Quote converted to ${target.toLowerCase()} successfully.` });
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to convert quote' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmedDelete = async () => {
    setActionLoading(true);
    try {
      if (confirmState.type === 'quote') await tradeAPI.deleteQuote(confirmState.id);
      else if (confirmState.type === 'order') await tradeAPI.deleteOrder(confirmState.id);
      else if (confirmState.type === 'credit-note') await tradeAPI.deleteSalesCreditNote(confirmState.id);
      else if (confirmState.type === 'refund') await tradeAPI.deleteSalesRefund(confirmState.id);
      toast({ title: 'Deleted', description: `${confirmState.label} has been deleted.` });
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.response?.data?.message || 'Delete failed' });
    } finally {
      setActionLoading(false);
      setConfirmState({ isOpen: false, id: '', type: '', label: '' });
    }
  };

  // --- Computed Stats ---
  const totalQuotesValue = quotes.reduce((acc, q) => acc + Number(q.total || 0), 0);
  const totalOrdersValue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.total || 0), 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + Number(i.total || 0), 0);

  // --- Columns ---
  const quoteColumns = [
    { accessorKey: 'number', header: 'Quote #' },
    {
      accessorKey: 'contact.legalname', header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || row.original.customer?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const quote = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const orderColumns = [
    { accessorKey: 'number', header: 'Order #' },
    {
      accessorKey: 'contact.legalname', header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || row.original.customer?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
  ];

  const invoiceColumns = [
    { accessorKey: 'number', header: 'Inv #' },
    {
      accessorKey: 'contact.legalname', header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || row.original.customer?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/invoice/${invoice.id}/pdf`;
                window.open(pdfUrl, '_blank');
              }}>
                <FileText className="mr-2 h-4 w-4" /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const creditNoteColumns = [
    { accessorKey: 'number', header: 'CN #' },
    {
      accessorKey: 'contact.legalname', header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Amount', cell: ({ row }: any) => `RM ${Number(row.original.total || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status || 'DRAFT'} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const cn = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: cn.id, type: 'credit-note', label: cn.number })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const refundColumns = [
    { accessorKey: 'number', header: 'Ref #' },
    {
      accessorKey: 'contact.legalname', header: 'Customer',
      cell: ({ row }: any) => row.original.contact?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }: any) => `RM ${Number(row.original.amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status || 'PENDING'} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const refund = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: refund.id, type: 'refund', label: refund.number })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Link href="/sales/recurring">
            <Button variant="outline" className="glass hover:bg-accent/50 transition-all duration-300 gap-2">
              <Repeat size={18} className="text-primary" /> Recurring Invoices
            </Button>
          </Link>
          <Button variant="outline" className="glass hover:bg-accent/50 transition-all duration-300" onClick={() => setIsActivityLogOpen(true)}>
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Quotes Value</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-primary">RM {totalQuotesValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{quotes.length} active quotes</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders Value</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-indigo-500">RM {totalOrdersValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{orders.length} orders to fulfill</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Invoiced</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-orange-500">RM {totalInvoiced.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{invoices.length} invoices issued</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Paid</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-green-500">RM {totalPaid.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-500 mt-1">Collected revenue</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <Tabs defaultValue="quotes" className="w-full">
          <CardHeader className="border-b border-border/50 bg-accent/5 pb-0">
            <TabsList className="bg-transparent gap-6 h-auto p-0">
              <TabsTrigger value="quotes" className={TAB_TRIGGER_CLASS}>
                <ClipboardList size={18} className="mr-2" /> {t('quotes')}
              </TabsTrigger>
              <TabsTrigger value="orders" className={TAB_TRIGGER_CLASS}>
                <ShoppingBag size={18} className="mr-2" /> {t('orders')}
              </TabsTrigger>
              <TabsTrigger value="deliveries" className={TAB_TRIGGER_CLASS}>
                <Truck size={18} className="mr-2" /> {t('deliveries')}
              </TabsTrigger>
              <TabsTrigger value="invoices" className={TAB_TRIGGER_CLASS}>
                <Receipt size={18} className="mr-2" /> {t('invoices')}
              </TabsTrigger>
              <TabsTrigger value="credit-notes" className={TAB_TRIGGER_CLASS}>
                <FileX size={18} className="mr-2" /> Credit Notes
              </TabsTrigger>
              <TabsTrigger value="refunds" className={TAB_TRIGGER_CLASS}>
                <RefreshCw size={18} className="mr-2" /> Refunds
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="quotes" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : quotes.length === 0 ? (
                <EmptyState icon={ClipboardList} label="Quotes" actionLabel="New Quote"
                  onAction={() => { setWizardType('SALES_QUOTE'); setIsWizardOpen(true); }} />
              ) : (
                <DataTable columns={quoteColumns} data={quotes} search="number" />
              )}
            </TabsContent>
            <TabsContent value="orders" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : orders.length === 0 ? (
                <EmptyState icon={ShoppingBag} label="Orders" actionLabel="New Order"
                  onAction={() => { setWizardType('SALES_ORDER'); setIsWizardOpen(true); }} />
              ) : (
                <DataTable columns={orderColumns} data={orders} search="number" />
              )}
            </TabsContent>
            <TabsContent value="deliveries" className="m-0 focus-visible:ring-0">
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-accent/5 rounded-2xl border-2 border-dashed border-border/50">
                <Truck size={48} className="mb-4 opacity-20" />
                <p className="font-semibold text-base">Delivery tracking module</p>
                <p className="text-sm mt-1">Deliveries are created from Sales Orders.</p>
              </div>
            </TabsContent>
            <TabsContent value="invoices" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : invoices.length === 0 ? (
                <EmptyState icon={Receipt} label="Invoices" actionLabel="New Invoice"
                  onAction={() => { setWizardType('SALES_INVOICE'); setIsWizardOpen(true); }} />
              ) : (
                <DataTable columns={invoiceColumns} data={invoices} search="number" />
              )}
            </TabsContent>
            <TabsContent value="credit-notes" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : creditNotes.length === 0 ? (
                <EmptyState icon={FileX} label="Credit Notes" actionLabel="New Credit Note" onAction={() => {}} />
              ) : (
                <DataTable columns={creditNoteColumns} data={creditNotes} search="number" />
              )}
            </TabsContent>
            <TabsContent value="refunds" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : refunds.length === 0 ? (
                <EmptyState icon={RefreshCw} label="Refunds" actionLabel="New Refund" onAction={() => {}} />
              ) : (
                <DataTable columns={refundColumns} data={refunds} search="number" />
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Modals */}
      <TradeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        type={wizardType}
        onSuccess={fetchData}
      />
      <ActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
      />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: '', type: '', label: '' })}
        onConfirm={handleConfirmedDelete}
        title={`Delete ${confirmState.label}?`}
        description={`This action cannot be undone. "${confirmState.label}" will be permanently deleted.`}
        confirmLabel="Yes, Delete"
        variant="destructive"
        isLoading={actionLoading}
      />
    </div>
  );
}
