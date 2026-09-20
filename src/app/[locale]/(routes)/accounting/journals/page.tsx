'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/datatable';
import { ColumnDef } from '@tanstack/react-table';
import { journalEntryAPI } from '@/services/api/journalEntry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, BookText, MoreHorizontal, Eye, MessageSquareQuote, Upload } from 'lucide-react';
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
import { format } from 'date-fns';
import Modal from '@/components/modals';
import { JournalEntryForm, JournalEntryFormValues } from '@/components/forms/accounting/JournalEntryForm';
import { ImportModal } from '@/components/modals/import-modal';

interface JournalEntryLine {
  id: string;
  account: {
    code: string;
    name: string;
  };
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  number: string;
  date: string;
  reference: string | null;
  narration: string | null;
  status: string;
  lines: JournalEntryLine[];
}

export default function JournalEntriesPage() {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewingJournal, setViewingJournal] = useState<JournalEntry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('Navigation');

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const response = await journalEntryAPI.getAll();
      setData(response.data.journalEntries || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch journal entries',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSubmit = async (values: JournalEntryFormValues) => {
    try {
      setSubmitting(true);
      await journalEntryAPI.create(values);
      toast({ title: 'Success', description: 'Journal entry posted successfully' });
      setIsModalOpen(false);
      fetchJournals();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to post journal entry',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<JournalEntry>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span>{format(new Date(row.original.date), 'dd MMM yyyy')}</span>,
    },
    {
      accessorKey: 'number',
      header: 'Number',
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('number')}</span>,
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('reference') || '-'}</span>,
    },
    {
        id: 'total',
        header: 'Total Amount',
        cell: ({ row }) => {
          const totalDebit = row.original.lines.reduce((sum, line) => sum + Number(line.debit), 0);
          return <span className="font-bold">RM {totalDebit.toFixed(2)}</span>;
        },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={
            row.getValue('status') === 'READY' ? 'bg-green-500' : 
            row.getValue('status') === 'DRAFT' ? 'bg-yellow-500' : 'bg-blue-500'
        }>
          {row.getValue('status')}
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
                onClick={() => {
                   setViewingJournal(row.original);
                   setIsViewModalOpen(true);
                }}
              >
                <Eye size={14} /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <MessageSquareQuote size={14} /> View Journal
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
          <h1 className="text-3xl font-bold tracking-tight">{t('journalEntries')}</h1>
          <p className="text-muted-foreground">View and record manual journal entries for your business.</p>
        </div>
        <Button 
          className="vibrant-gradient text-white flex gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} /> New Manual Journal
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Journal History</CardTitle>
          <CardDescription>Comprehensive list of all manual and system-generated journal entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} search="number" />
        </CardContent>
      </Card>

      <Modal
        title="New Manual Journal"
        description="Record a manual journal entry with balanced debit and credit lines."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-4xl"
      >
        <JournalEntryForm 
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </Modal>

      <Modal
        title={`Journal Entry: ${viewingJournal?.number}`}
        description={`Posted on ${viewingJournal ? format(new Date(viewingJournal.date), 'dd MMMM yyyy') : ''}`}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        className="max-w-4xl"
      >
        {viewingJournal && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
               <div>
                  <div className="text-xs text-muted-foreground uppercase">Reference</div>
                  <div className="font-bold">{viewingJournal.reference || '-'}</div>
               </div>
               <div>
                  <div className="text-xs text-muted-foreground uppercase">Status</div>
                  <Badge className="bg-green-500">{viewingJournal.status}</Badge>
               </div>
               <div className="col-span-2">
                  <div className="text-xs text-muted-foreground uppercase">Narration</div>
                  <div className="text-sm">{viewingJournal.narration || 'No narration provided.'}</div>
               </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                   <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                      <tr>
                         <th className="px-4 py-3 text-left">Account</th>
                         <th className="px-4 py-3 text-right">Debit</th>
                         <th className="px-4 py-3 text-right">Credit</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {viewingJournal.lines.map((line) => (
                         <tr key={line.id} className="hover:bg-accent/5">
                            <td className="px-4 py-4">
                               <div className="font-bold">{line.account.name}</div>
                               <div className="text-xs font-mono text-muted-foreground">{line.account.code}</div>
                            </td>
                            <td className="px-4 py-4 text-right">
                               {Number(line.debit) > 0 ? `RM ${Number(line.debit).toFixed(2)}` : '-'}
                            </td>
                            <td className="px-4 py-4 text-right">
                               {Number(line.credit) > 0 ? `RM ${Number(line.credit).toFixed(2)}` : '-'}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                   <tfoot className="bg-muted/50 font-bold border-t border-white/10">
                      <tr>
                         <td className="px-4 py-4 text-right">Totals</td>
                         <td className="px-4 py-4 text-right text-primary">
                            RM {viewingJournal.lines.reduce((sum, l) => sum + Number(l.debit), 0).toFixed(2)}
                         </td>
                         <td className="px-4 py-4 text-right text-primary">
                            RM {viewingJournal.lines.reduce((sum, l) => sum + Number(l.credit), 0).toFixed(2)}
                         </td>
                      </tr>
                   </tfoot>
                </table>
            </div>
            
            <div className="flex justify-end pt-4">
               <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)}
        title="Import Journal Entries"
        description="Upload a CSV file containing your journal lines. Rows with the same 'reference' will be grouped as one entry. Must include 'accountId', 'debit', and 'credit'."
        onUpload={async (file) => {
          try {
            const res = await journalEntryAPI.importCsv(file);
            return { success: true, message: res.data.message };
          } catch (err: any) {
            return { success: false, message: err.response?.data?.message || 'Upload failed', errors: err.response?.data?.errors };
          }
        }}
        onSuccess={() => {
          fetchJournals();
        }}
      />
    </div>
  );
}
