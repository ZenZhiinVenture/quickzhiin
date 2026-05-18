'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/datatable';
import { ColumnDef } from '@tanstack/react-table';
import { invoiceAPI } from '@/services/api/invoice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, Receipt, FileText, MoreHorizontal, Download, Trash, History as HistoryIcon } from 'lucide-react';
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
import dayjs from 'dayjs';
import { RecordPaymentModal } from '@/components/modals/record-payment-modal';

interface Invoice {
  id: string;
  number: string;
  date: string;
  total: number;
  status: string;
  dueDate: string;
  customer: {
    legalname: string;
  };
}

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll();
      setData(response.data.data?.items || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch invoices',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice? The associated accounting journals will also be permanently deleted.')) return;
    try {
      setLoading(true);
      await invoiceAPI.delete(id);
      toast({
        title: 'Success',
        description: 'Invoice and journal entries deleted successfully.',
      });
      fetchInvoices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete invoice',
      });
      setLoading(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'number',
      header: 'Invoice #',
      cell: ({ row }) => <span className="font-bold">{row.getValue('number')}</span>,
    },
    {
      accessorKey: 'customer.legalname',
      header: 'Customer',
      cell: ({ row }) => <span>{row.original.customer?.legalname || 'N/A'}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span>{dayjs(row.getValue('date')).format('DD MMM YYYY')}</span>,
    },
    {
      accessorKey: 'total',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('total'));
        return <span className="font-medium text-primary">RM {amount.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'default';

        switch (status.toUpperCase()) {
          case 'PAID': variant = 'default'; break;
          case 'DRAFT': variant = 'secondary'; break;
          case 'PENDING': variant = 'outline'; break;
          case 'OVERDUE': variant = 'destructive'; break;
        }

        return (
          <Badge className="px-2 py-1 rounded-full text-[10px] uppercase font-bold">
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'ledger',
      header: 'Ledger',
      cell: ({ row }) => {
        const status = row.original.status.toUpperCase();
        return (
          <div className="flex items-center gap-1.5 text-xs">
            {status !== 'DRAFT' ? (
                <div className="flex items-center gap-1 text-green-500 font-semibold px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20">
                    <HistoryIcon size={12} />
                    <span>SYNCD</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-muted-foreground font-medium px-2 py-0.5">
                    <HistoryIcon size={12} className="opacity-50" />
                    <span>DRAFT</span>
                </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isPaid = row.original.status.toUpperCase() === 'PAID';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isPaid && (
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-primary font-semibold"
                  onClick={() => {
                    setSelectedInvoice(row.original);
                    setIsPaymentModalOpen(true);
                  }}
                >
                  <Receipt size={14} /> Record Payment
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="flex items-center gap-2">
                <FileText size={14} /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Download size={14} /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 flex items-center gap-2 cursor-pointer" 
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash size={14} /> Delete
              </DropdownMenuItem>
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
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage and track your customer billings.</p>
        </div>
        <Button className="vibrant-gradient text-white flex gap-2">
          <Plus size={18} /> New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM 128,430.00</div>
            <p className="text-xs text-green-500 font-medium">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM 43,200.00</div>
            <p className="text-xs text-orange-500 font-medium">12 Overdue Invoices</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM 85,230.00</div>
            <p className="text-xs text-blue-500 font-medium">94% Collection Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>A list of all invoices generated for your clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} search="number" />
        </CardContent>
      </Card>

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={fetchInvoices}
      />
    </div>
  );
}
