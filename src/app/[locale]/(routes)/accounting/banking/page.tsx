'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import {
  Plus, Landmark, MoreVertical, Trash2, ArrowDownCircle,
  ArrowUpCircle, ArrowLeftRight, TrendingUp, TrendingDown, Loader2
} from 'lucide-react';
import { bankingAPI } from '@/services/api/banking';
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
import dayjs from 'dayjs';

const TAB_TRIGGER_CLASS =
  'px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold transition-all duration-300';

type TransactionType = 'income' | 'expense' | 'transfer';

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
  onAction,
}: {
  icon: React.ElementType;
  label: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon size={48} className="mb-4 opacity-20" />
      <p className="font-semibold text-base">No {label} yet</p>
      <p className="text-sm mt-1">Add your first {label.toLowerCase()} transaction.</p>
      <Button className="mt-4 vibrant-gradient text-white" onClick={onAction}>
        <Plus size={16} className="mr-2" /> New {label.charAt(0).toUpperCase() + label.slice(1)}
      </Button>
    </div>
  );
}

interface BankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  onSuccess: () => void;
}

function BankingModal({ isOpen, onClose, type, onSuccess }: BankingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bankAccount: '',
    toAccount: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    reference: '',
  });

  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.amount || !form.date) {
      toast({ variant: 'destructive', title: 'Error', description: 'Amount and date are required.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        bankAccount: form.bankAccount,
        date: form.date,
        amount: Number(form.amount),
        description: form.description,
        reference: form.reference,
        ...(type === 'transfer' ? { toAccount: form.toAccount } : {}),
      };
      if (type === 'income') await bankingAPI.createIncome(payload);
      else if (type === 'expense') await bankingAPI.createExpense(payload);
      else await bankingAPI.createTransfer(payload);
      toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} recorded.` });
      onSuccess();
      onClose();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.response?.data?.message || 'Failed to save transaction' });
    } finally {
      setLoading(false);
    }
  };

  const labels: Record<TransactionType, string> = {
    income: 'New Income',
    expense: 'New Expense',
    transfer: 'New Transfer',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'income' && <ArrowDownCircle size={20} className="text-green-500" />}
            {type === 'expense' && <ArrowUpCircle size={20} className="text-red-500" />}
            {type === 'transfer' && <ArrowLeftRight size={20} className="text-blue-500" />}
            {labels[type]}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {type === 'transfer' ? (
            <>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">From Account</Label>
                <Input value={form.bankAccount} onChange={(e) => handleChange('bankAccount', e.target.value)} placeholder="e.g. Maybank Current" className="glass h-10" />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">To Account</Label>
                <Input value={form.toAccount} onChange={(e) => handleChange('toAccount', e.target.value)} placeholder="e.g. CIMB Savings" className="glass h-10" />
              </div>
            </>
          ) : (
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bank Account</Label>
              <Input value={form.bankAccount} onChange={(e) => handleChange('bankAccount', e.target.value)} placeholder="e.g. Maybank Current" className="glass h-10" />
            </div>
          )}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Date</Label>
            <Input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} className="glass h-10" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount (RM)</Label>
            <Input type="number" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="0.00" className="glass h-10" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</Label>
            <Input value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Optional description" className="glass h-10" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Reference</Label>
            <Input value={form.reference} onChange={(e) => handleChange('reference', e.target.value)} placeholder="e.g. TXN-0001" className="glass h-10" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading} className="glass">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="vibrant-gradient text-white">
            {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</> : 'Save Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BankingPage() {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [modalType, setModalType] = useState<TransactionType>('income');
  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; id: string; type: TransactionType | ''; label: string;
  }>({ isOpen: false, id: '', type: '', label: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [iRes, eRes, tRes] = await Promise.all([
        bankingAPI.getIncomes().catch(() => ({ data: { data: { items: [] } } })),
        bankingAPI.getExpenses().catch(() => ({ data: { data: { items: [] } } })),
        bankingAPI.getTransfers().catch(() => ({ data: { data: { items: [] } } })),
      ]);
      setIncomes(iRes.data.data?.items || iRes.data.data || []);
      setExpenses(eRes.data.data?.items || eRes.data.data || []);
      setTransfers(tRes.data.data?.items || tRes.data.data || []);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch banking data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      if (confirmState.type === 'income') await bankingAPI.deleteIncome(confirmState.id);
      else if (confirmState.type === 'expense') await bankingAPI.deleteExpense(confirmState.id);
      else if (confirmState.type === 'transfer') await bankingAPI.deleteTransfer(confirmState.id);
      toast({ title: 'Deleted', description: `${confirmState.label} deleted.` });
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.response?.data?.message || 'Delete failed' });
    } finally {
      setActionLoading(false);
      setConfirmState({ isOpen: false, id: '', type: '', label: '' });
    }
  };

  // Stats
  const totalIncome = incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Columns
  const incomeColumns = [
    { accessorKey: 'reference', header: 'Reference', cell: ({ row }: any) => row.original.reference || '—' },
    { accessorKey: 'bankAccount', header: 'Bank Account', cell: ({ row }: any) => row.original.bankAccount || row.original.account || '—' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'description', header: 'Description', cell: ({ row }: any) => row.original.description || '—' },
    {
      accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          RM {Number(row.original.amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status || 'COMPLETED'} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: item.id, type: 'income', label: item.reference || `Income #${item.id}` })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const expenseColumns = [
    { accessorKey: 'reference', header: 'Reference', cell: ({ row }: any) => row.original.reference || '—' },
    { accessorKey: 'bankAccount', header: 'Bank Account', cell: ({ row }: any) => row.original.bankAccount || row.original.account || '—' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    { accessorKey: 'description', header: 'Description', cell: ({ row }: any) => row.original.description || '—' },
    {
      accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-semibold text-red-600 dark:text-red-400">
          RM {Number(row.original.amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <StatusBadge status={row.original.status || 'COMPLETED'} /> },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: item.id, type: 'expense', label: item.reference || `Expense #${item.id}` })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const transferColumns = [
    { accessorKey: 'bankAccount', header: 'From Account', cell: ({ row }: any) => row.original.bankAccount || row.original.fromAccount || '—' },
    { accessorKey: 'toAccount', header: 'To Account', cell: ({ row }: any) => row.original.toAccount || '—' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }: any) => dayjs(row.original.date).format('DD MMM YYYY') },
    {
      accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-semibold">
          RM {Number(row.original.amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { accessorKey: 'reference', header: 'Reference', cell: ({ row }: any) => row.original.reference || '—' },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setConfirmState({ isOpen: true, id: item.id, type: 'transfer', label: item.reference || `Transfer #${item.id}` })}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setIsBankingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banking</h1>
            <p className="text-muted-foreground text-sm">Manage cash flows, income and expense transactions.</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="vibrant-gradient text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              <Plus size={18} className="mr-2" /> New Transaction
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass">
            <DropdownMenuLabel>Transaction Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openModal('income')}>
              <ArrowDownCircle size={14} className="mr-2 text-green-500" /> New Income
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal('expense')}>
              <ArrowUpCircle size={14} className="mr-2 text-red-500" /> New Expense
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal('transfer')}>
              <ArrowLeftRight size={14} className="mr-2 text-blue-500" /> New Transfer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" /> Total Income
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-green-500">RM {totalIncome.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{incomes.length} income transactions</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" /> Total Expenses
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-red-500">RM {totalExpenses.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} expense transactions</p>
          </div>
        </Card>
        <Card className="glass-card hover:translate-y-[-4px] transition-transform duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Cash Flow</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netCashFlow < 0 ? '-' : ''}RM {Math.abs(netCashFlow).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs mt-1 ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <Tabs defaultValue="income" className="w-full">
          <CardHeader className="border-b border-border/50 bg-accent/5 pb-0">
            <TabsList className="bg-transparent gap-6 h-auto p-0">
              <TabsTrigger value="income" className={TAB_TRIGGER_CLASS}>
                <ArrowDownCircle size={18} className="mr-2 text-green-500" /> Income
              </TabsTrigger>
              <TabsTrigger value="expenses" className={TAB_TRIGGER_CLASS}>
                <ArrowUpCircle size={18} className="mr-2 text-red-500" /> Expenses
              </TabsTrigger>
              <TabsTrigger value="transfers" className={TAB_TRIGGER_CLASS}>
                <ArrowLeftRight size={18} className="mr-2 text-blue-500" /> Transfers
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="income" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : incomes.length === 0 ? (
                <EmptyState icon={ArrowDownCircle} label="income" onAction={() => openModal('income')} />
              ) : (
                <DataTable columns={incomeColumns} data={incomes} search="reference" />
              )}
            </TabsContent>
            <TabsContent value="expenses" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : expenses.length === 0 ? (
                <EmptyState icon={ArrowUpCircle} label="expense" onAction={() => openModal('expense')} />
              ) : (
                <DataTable columns={expenseColumns} data={expenses} search="reference" />
              )}
            </TabsContent>
            <TabsContent value="transfers" className="m-0 focus-visible:ring-0">
              {loading ? <SkeletonRows /> : transfers.length === 0 ? (
                <EmptyState icon={ArrowLeftRight} label="transfer" onAction={() => openModal('transfer')} />
              ) : (
                <DataTable columns={transferColumns} data={transfers} search="reference" />
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Modals */}
      <BankingModal
        isOpen={isBankingModalOpen}
        onClose={() => setIsBankingModalOpen(false)}
        type={modalType}
        onSuccess={fetchData}
      />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: '', type: '', label: '' })}
        onConfirm={handleDelete}
        title={`Delete ${confirmState.label}?`}
        description={`This action cannot be undone. This transaction will be permanently deleted.`}
        confirmLabel="Yes, Delete"
        variant="destructive"
        isLoading={actionLoading}
      />
    </div>
  );
}
