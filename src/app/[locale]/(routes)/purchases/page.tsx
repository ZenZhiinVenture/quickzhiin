'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import {
  Plus, ShoppingCart, ClipboardList, PackageCheck, TrendingDown,
  History, MoreVertical, Trash2, Eye, FileX, RefreshCw, CheckCircle
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
import { TradeWizardModal } from '@/components/modals/trade-wizard-modal';

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

export default function PurchasesDashboard() {
  const t = useTranslations('Navigation');
  const { toast } = useToast();

  const [grns, setGrns] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'PURCHASE_REQUISITION' | 'PURCHASE_ORDER'>('PURCHASE_ORDER');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    id: string;
    type: string;
    label: string;
  }>({ isOpen: false, id: '', type: '', label: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grnRes, prRes, poRes, cnRes, rfRes] = await Promise.all([
        tradeAPI.getGRNs(),
        tradeAPI.getPurchaseRequisitions(),
        tradeAPI.getPurchaseOrders(),
        tradeAPI.getPurchaseCreditNotes().catch(() => ({ data: { data: { items: [] } } })),
        tradeAPI.getPurchaseRefunds().catch(() => ({ data: { data: { items: [] } } })),
      ]);
      setGrns(grnRes.data.data?.items || []);
      setRequisitions(prRes.data.data?.items || []);
      setOrders(poRes.data.data?.items || []);
      setCreditNotes(cnRes.data.data?.items || []);
      setRefunds(rfRes.data.data?.items || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch purchase data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirmedDelete = async () => {
    setActionLoading(true);
    try {
      if (confirmState.type === 'po') await tradeAPI.deletePurchaseOrder(confirmState.id);
      else if (confirmState.type === 'grn') await tradeAPI.deleteGRN(confirmState.id);
      else if (confirmState.type === 'credit-note') await tradeAPI.deletePurchaseCreditNote(confirmState.id);
      else if (confirmState.type === 'refund') await tradeAPI.deletePurchaseRefund(confirmState.id);
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
  const pendingRequisitions = requisitions.filter((r) => r.status === 'PENDING').length;
  const activePOs = orders.filter((o) => ['PENDING', 'APPROVED', 'READY'].includes(o.status)).length;
  const totalGRNs = grns.length;
  const outstandingBalance = orders
    .filter((o) => o.status !== 'PAID' && o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  // --- Columns ---
  const prColumns = [
    { accessorKey: 'number', header: 'PR #' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    {
      accessorKey: 'requester.firstName', header: 'Requester',
      cell: ({ row }: any) => `${row.original.requester?.firstName || ''} ${row.original.requester?.lastName || ''}`.trim() || '—'
    },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }: any) => <StatusBadge status={row.original.priority || 'NORMAL'} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
  ];

  const poColumns = [
    { accessorKey: 'number', header: 'PO #' },
    {
      accessorKey: 'contact.legalname', header: 'Vendor',
      cell: ({ row }: any) => row.original.contact?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }: any) => `RM ${Number(row.original.total || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setWizardType('PURCHASE_ORDER'); setIsWizardOpen(true); }}>
                <ClipboardList className="mr-2 h-4 w-4" /> Edit (New)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  setActionLoading(true);
                  await tradeAPI.patchPurchaseOrderStatus(order.id, 'READY');
                  toast({ title: 'Success', description: 'PO marked as Ready.' });
                  fetchData();
                } catch (e: any) {
                  toast({ variant: 'destructive', title: 'Error', description: e.response?.data?.message || 'Update failed' });
                } finally { setActionLoading(false); }
              }} disabled={order.status !== 'PENDING'}>
                <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Mark Ready
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: order.id, type: 'po', label: order.number })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const grnColumns = [
    { accessorKey: 'number', header: 'GRN #' },
    {
      accessorKey: 'vendor.legalname', header: 'Vendor',
      cell: ({ row }: any) => row.original.vendor?.legalname || row.original.contact?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    {
      accessorKey: 'purchaseOrder.number', header: 'PO #',
      cell: ({ row }: any) => row.original.purchaseOrder?.number || 'Direct'
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const grn = row.original;
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
                onClick={() => setConfirmState({ isOpen: true, id: grn.id, type: 'grn', label: grn.number })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const creditNoteColumns = [
    { accessorKey: 'number', header: 'CN #' },
    { accessorKey: 'contact.legalname', header: 'Vendor', cell: ({ row }: any) => row.original.contact?.legalname || '—' },
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
    { accessorKey: 'contact.legalname', header: 'Vendor', cell: ({ row }: any) => row.original.contact?.legalname || '—' },
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Requisitions</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-orange-500">{pendingRequisitions}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Purchase Orders</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-blue-500">{activePOs}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Received GRN</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-purple-500">{totalGRNs}</div>
            <p className="text-xs text-muted-foreground mt-1">Goods received notes posted</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Outstanding Balance</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-red-500">RM {outstandingBalance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid purchase orders</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <Tabs defaultValue="requisitions" className="w-full">
          <CardHeader className="border-b border-border/50 bg-accent/5 pb-0">
            <TabsList className="bg-transparent gap-6 h-auto p-0">
              <TabsTrigger value="requisitions" className={TAB_TRIGGER_CLASS}>
                <ClipboardList size={18} className="mr-2" /> {t('requisitions')}
              </TabsTrigger>
              <TabsTrigger value="purchase-orders" className={TAB_TRIGGER_CLASS}>
                <ShoppingCart size={18} className="mr-2" /> {t('purchaseOrders')}
              </TabsTrigger>
              <TabsTrigger value="grn" className={TAB_TRIGGER_CLASS}>
                <PackageCheck size={18} className="mr-2" /> {t('goodsReceived')}
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
            <TabsContent value="requisitions" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : requisitions.length === 0 ? (
                <EmptyState icon={ClipboardList} label="Requisitions" actionLabel="New Requisition"
                  onAction={() => { setWizardType('PURCHASE_REQUISITION'); setIsWizardOpen(true); }} />
              ) : (
                <DataTable columns={prColumns} data={requisitions} search="number" />
              )}
            </TabsContent>
            <TabsContent value="purchase-orders" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : orders.length === 0 ? (
                <EmptyState icon={ShoppingCart} label="Purchase Orders" actionLabel="New Purchase Order"
                  onAction={() => { setWizardType('PURCHASE_ORDER'); setIsWizardOpen(true); }} />
              ) : (
                <DataTable columns={poColumns} data={orders} search="number" />
              )}
            </TabsContent>
            <TabsContent value="grn" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : grns.length === 0 ? (
                <EmptyState icon={PackageCheck} label="Goods Received Notes" actionLabel="Record GRN" onAction={() => {}} />
              ) : (
                <DataTable columns={grnColumns} data={grns} search="number" />
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
