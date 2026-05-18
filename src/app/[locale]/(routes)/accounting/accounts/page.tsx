'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/datatable';
import { ColumnDef } from '@tanstack/react-table';
import { accountAPI } from '@/services/api/account';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, Library, MoreHorizontal, Edit, Trash, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/dropdown';
import { useToast } from '@/components/usetoast';
import { useTranslations } from 'next-intl';
import Modal from '@/components/modals';
import { AccountForm, AccountFormValues } from '@/components/forms/accounting/AccountForm';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  subtype: string | null;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
}

export default function ChartOfAccountsPage() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('Navigation');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getAll();
      setData(response.data.accounts || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch chart of accounts',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await accountAPI.delete(id);
      toast({ title: 'Success', description: 'Account deleted successfully' });
      fetchAccounts();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete account' });
    }
  };

  const handleSubmit = async (values: AccountFormValues) => {
    try {
      setSubmitting(true);
      if (editingAccount) {
        await accountAPI.update(editingAccount.id, values);
        toast({ title: 'Success', description: 'Account updated successfully' });
      } else {
        await accountAPI.create(values);
        toast({ title: 'Success', description: 'Account created successfully' });
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save account',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('code')}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Account Name',
      cell: ({ row }) => <span className="font-bold">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {(row.getValue('type') as string).toLowerCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'isSystem',
      header: 'System',
      cell: ({ row }) => (
        row.original.isSystem ? (
          <CheckCircle2 size={16} className="text-blue-500" />
        ) : (
          <XCircle size={16} className="text-muted-foreground/30" />
        )
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.isActive ? 'bg-green-500' : 'bg-gray-400'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => handleEdit(row.original)}
              >
                <Edit size={14} /> Edit Account
              </DropdownMenuItem>
              {!row.original.isSystem && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-500 flex items-center gap-2"
                    onClick={() => handleDelete(row.original.id)}
                  >
                    <Trash size={14} /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('chartOfAccounts')}</h1>
          <p className="text-muted-foreground">Manage your business accounts and tracking categories.</p>
        </div>
        <Button 
          className="vibrant-gradient text-white flex gap-2"
          onClick={handleCreate}
        >
          <Plus size={18} /> Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.filter(a => a.type === 'ASSET').length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.filter(a => a.type === 'LIABILITY').length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.filter(a => a.type === 'EQUITY').length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue/Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.filter(a => ['REVENUE', 'EXPENSE'].includes(a.type)).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Accounts List</CardTitle>
          <CardDescription>View and manage all accounts in your general ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} search="name" />
        </CardContent>
      </Card>

      <Modal
        title={editingAccount ? "Edit Account" : "Add Account"}
        description={editingAccount ? "Update the details of your account." : "Create a new account in your chart of accounts."}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AccountForm 
          initialValues={(editingAccount as any) || {}}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </Modal>
    </div>
  );
}
