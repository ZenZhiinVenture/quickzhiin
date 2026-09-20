'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import {
  Plus, Receipt, MoreVertical, Trash2, FileText, CreditCard,
  CheckCircle, AlertCircle, DollarSign
} from 'lucide-react';
import { tradeAPI } from '@/services/api/trade';
import { billAPI } from '@/services/api/bill';
import { paymentAPI } from '@/services/api/payment';
import { DataTable } from '@/components/datatable';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/dropdown';
import { useToast } from '@/components/usetoast';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/dialog';
import { Label } from '@/components/label';
import { Input } from '@/components/input';
import { Button as Btn } from '@/components/button';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { TradeWizardModal } from '@/components/modals/trade-wizard-modal';

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-accent/30 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Receipt size={48} className="mb-4 opacity-20" />
      <p className="font-semibold text-base">No bills yet</p>
      <p className="text-sm mt-1">Create your first supplier bill to get started.</p>
      <Button className="mt-4 vibrant-gradient text-white" onClick={onAction}>
        <Plus size={16} className="mr-2" /> New Bill
      </Button>
    </div>
  );
}

interface PaymentModalProps {
  bill: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function RecordPaymentModal({ bill, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [methods, setMethods] = useState<any[]>([]);
  const [methodId, setMethodId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(String(bill?.total || ''));
      paymentAPI.getMethods().then((r) => {
        const m = r.data.data || [];
        setMethods(m);
        if (m.length > 0) setMethodId(String(m[0].id));
      }).catch(() => {});
    }
  }, [isOpen, bill]);

  const handleSubmit = async () => {
    if (!amount || !methodId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all fields.' });
      return;
    }
    setLoading(true);
    try {
      await paymentAPI.recordBillPayment(bill.id, {
        amount: Number(amount),
        methodId,
        paidAt,
      });
      toast({ title: 'Success', description: 'Payment recorded successfully.' });
      onSuccess();
      onClose();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.response?.data?.message || 'Failed to record payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={20} className="text-primary" /> Record Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bill</Label>
            <p className="text-sm font-semibold">{bill?.number} — RM {Number(bill?.total || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount (RM)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="glass h-10" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Payment Date</Label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="glass h-10" />
          </div>
          {methods.length > 0 && (
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Payment Method</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm glass text-foreground"
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
              >
                {methods.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading} className="glass">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="vibrant-gradient text-white">
            {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</> : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BillsPage() {
  const { toast } = useToast();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; id: string; label: string;
  }>({ isOpen: false, id: '', label: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await tradeAPI.getBills();
      setBills(res.data.data?.items || []);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch bills' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await billAPI.delete(confirmState.id);
      toast({ title: 'Deleted', description: `Bill "${confirmState.label}" has been deleted.` });
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.response?.data?.message || 'Failed to delete bill' });
    } finally {
      setActionLoading(false);
      setConfirmState({ isOpen: false, id: '', label: '' });
    }
  };

  // Stats
  const totalBills = bills.reduce((acc, b) => acc + Number(b.total || 0), 0);
  const unpaidBills = bills.filter((b) => b.status !== 'PAID').reduce((acc, b) => acc + Number(b.total || 0), 0);
  const thisMonth = dayjs().format('YYYY-MM');
  const paidThisMonth = bills
    .filter((b) => b.status === 'PAID' && dayjs(b.updatedAt || b.date).format('YYYY-MM') === thisMonth)
    .reduce((acc, b) => acc + Number(b.total || 0), 0);

  const columns = [
    { accessorKey: 'number', header: 'Bill #' },
    {
      accessorKey: 'contact.legalname', header: 'Supplier',
      cell: ({ row }: any) => row.original.contact?.legalname || row.original.vendor?.legalname || '—'
    },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    {
      accessorKey: 'dueDate', header: 'Due Date',
      cell: ({ row }: any) => row.original.dueDate ? dayjs(row.original.dueDate).format('DD MMM YYYY') : '—'
    },
    {
      accessorKey: 'total', header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-semibold">RM {Number(row.original.total || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
      )
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
    {
      accessorKey: 'ledger', header: 'Ledger',
      cell: ({ row }: any) => row.original.ledger?.name || row.original.account?.name || '—'
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => { setSelectedBill(bill); setIsPaymentOpen(true); }}
                disabled={bill.status === 'PAID'}
              >
                <CreditCard className="mr-2 h-4 w-4 text-green-500" /> Record Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bill/${bill.id}/pdf`, '_blank')}>
                <FileText className="mr-2 h-4 w-4" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: bill.id, label: bill.number })}
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
          <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
            <p className="text-muted-foreground text-sm">Manage supplier bills and payments.</p>
          </div>
        </div>
        <Button className="vibrant-gradient text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300" onClick={() => setIsWizardOpen(true)}>
          <Plus size={18} className="mr-2" /> New Bill
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} /> Total Bills
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-primary">RM {totalBills.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{bills.length} bills total</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} /> Unpaid Bills
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-red-500">RM {unpaidBills.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding payables</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={14} /> Paid This Month
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-green-500">RM {paidThisMonth.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{dayjs().format('MMMM YYYY')}</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <CardContent className="p-6">
          {loading ? <SkeletonRows /> : bills.length === 0 ? (
            <EmptyState onAction={() => setIsWizardOpen(true)} />
          ) : (
            <DataTable columns={columns} data={bills} search="number" />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TradeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        type="SUPPLIER_BILL"
        onSuccess={fetchData}
      />
      {selectedBill && (
        <RecordPaymentModal
          bill={selectedBill}
          isOpen={isPaymentOpen}
          onClose={() => { setIsPaymentOpen(false); setSelectedBill(null); }}
          onSuccess={fetchData}
        />
      )}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: '', label: '' })}
        onConfirm={handleDelete}
        title={`Delete ${confirmState.label}?`}
        description={`This action cannot be undone. Bill "${confirmState.label}" will be permanently deleted.`}
        confirmLabel="Yes, Delete"
        variant="destructive"
        isLoading={actionLoading}
      />
    </div>
  );
}
