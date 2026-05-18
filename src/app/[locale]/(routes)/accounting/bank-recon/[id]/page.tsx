'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  CreditCard,
  History,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/card';
import api from '@/services/api/api';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/badge';
import { cn } from '@/utils/cn';
import { BankAdjustmentModal } from '@/components/modals/BankAdjustmentModal';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: string;
}

interface LedgerTransaction {
  id: string;
  journalEntry: {
    number: string;
    date: string;
    description: string;
  };
  debit: string;
  credit: string;
}

export default function ReconcileWorkspace() {
  const t = useTranslations('ModuleMenu.BankRecon');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = params.locale as string;

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [selectedLedgerIds, setSelectedLedgerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  useEffect(() => {
    fetchUnreconciled();
  }, [id]);

  const fetchUnreconciled = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bank-account/${id}/unreconciled`);
      if (response.data.success) {
        setBankTransactions(response.data.data.bankTransactions);
        setLedgerTransactions(response.data.data.ledgerTransactions);
      }
    } catch (error) {
      console.error('Error fetching unreconciled data:', error);
      toast.error(t('errorFetching'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatch = async () => {
    if (selectedBankIds.length !== 1 || selectedLedgerIds.length === 0) {
      toast.error('Select 1 bank transaction and at least 1 ledger item');
      return;
    }

    try {
      setIsMatching(true);
      const bankTx = bankTransactions.find(t => t.id === selectedBankIds[0]);

      const response = await api.post('/bank-account/match', {
        bankTransactionId: selectedBankIds[0],
        journalEntryLineIds: selectedLedgerIds,
        amount: parseFloat(bankTx?.amount || '0')
      });

      if (response.data.success) {
        toast.success(t('matchSuccess'));
        setSelectedBankIds([]);
        setSelectedLedgerIds([]);
        fetchUnreconciled();
      }
    } catch (error) {
      toast.error('Matching failed');
    } finally {
      setIsMatching(false);
    }
  };

  const selectedBankAmount = selectedBankIds.reduce((sum, id) => {
    const tx = bankTransactions.find(t => t.id === id);
    return sum + (parseFloat(tx?.amount || '0'));
  }, 0);

  const selectedLedgerAmount = selectedLedgerIds.reduce((sum, id) => {
    const tx = ledgerTransactions.find(t => t.id === id);
    return sum + (parseFloat(tx?.debit || '0') + parseFloat(tx?.credit || '0'));
  }, 0);

  const isBalanced = Math.abs(selectedBankAmount - selectedLedgerAmount) < 0.01;

  if (isLoading) return <div className="p-8 text-center">Loading Workspace...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-background/50 backdrop-blur-sm sticky top-0 z-20 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('title')}
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <h1 className="text-xl font-bold">Reconciliation Workspace</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-2 rounded-lg border flex items-center gap-2 transition-all duration-300",
            isBalanced && selectedBankIds.length > 0 ? "bg-green-500/10 border-green-500 text-green-500" : "bg-accent/50 border-border"
          )}>
            <span className="text-xs uppercase font-bold tracking-wider">Difference:</span>
            <span className="font-mono font-bold">
              RM {(selectedBankAmount - selectedLedgerAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            {isBalanced && selectedBankIds.length > 0 && <CheckCircle2 className="h-4 w-4" />}
          </div>

          {selectedBankIds.length === 1 && (
            <Button
              variant="outline"
              className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
              onClick={() => setIsAdjustmentModalOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Adjustment
            </Button>
          )}

          <Button
            className="vibrant-gradient text-white shadow-lg disabled:opacity-50"
            disabled={!isBalanced || selectedBankIds.length === 0 || isMatching}
            onClick={handleMatch}
          >
            <Check className="mr-2 h-4 w-4" /> {t('match')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left: Bank Statement Transactions */}
        <Card className="flex flex-col glass-card overflow-hidden">
          <CardHeader className="bg-primary/5 py-4 border-b border-primary/10">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-2">
                <CreditCard size={18} /> {t('bankTransactions')}
              </span>
              <Badge variant="outline">{bankTransactions.length} Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm z-10">
                <tr className="text-muted-foreground text-left uppercase text-[10px] tracking-widest font-bold">
                  <th className="p-4 w-12" />
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {bankTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      "group cursor-pointer transition-colors duration-200",
                      selectedBankIds.includes(tx.id) ? "bg-primary/10" : "hover:bg-accent/30"
                    )}
                    onClick={() => setSelectedBankIds([tx.id])}
                  >
                    <td className="p-4 text-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        selectedBankIds.includes(tx.id) ? "border-primary bg-primary scale-110" : "border-border"
                      )}>
                        {selectedBankIds.includes(tx.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4 italic text-muted-foreground">{tx.description}</td>
                    <td className={cn(
                      "p-4 text-right font-bold font-mono",
                      tx.type === 'DEPOSIT' ? "text-green-500" : "text-amber-500"
                    )}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right: Ledger Transactions */}
        <Card className="flex flex-col glass-card overflow-hidden">
          <CardHeader className="bg-primary/5 py-4 border-b border-primary/10">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-2">
                <History size={18} /> {t('ledgerTransactions')}
              </span>
              <Badge variant="outline">{ledgerTransactions.length} Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 text-sm">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm z-10">
                <tr className="text-muted-foreground text-left uppercase text-[10px] tracking-widest font-bold">
                  <th className="p-4 w-12" />
                  <th className="p-4">Journal</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Debit</th>
                  <th className="p-4 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {ledgerTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      "group cursor-pointer transition-colors duration-200",
                      selectedLedgerIds.includes(tx.id) ? "bg-primary/10" : "hover:bg-accent/30"
                    )}
                    onClick={() => {
                      if (selectedLedgerIds.includes(tx.id)) {
                        setSelectedLedgerIds(prev => prev.filter(item => item !== tx.id));
                      } else {
                        setSelectedLedgerIds(prev => [...prev, tx.id]);
                      }
                    }}
                  >
                    <td className="p-4 text-center">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300",
                        selectedLedgerIds.includes(tx.id) ? "border-primary bg-primary scale-110" : "border-border"
                      )}>
                        {selectedLedgerIds.includes(tx.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-primary">{tx.journalEntry.number}</td>
                    <td className="p-4 max-w-[200px] truncate">{tx.journalEntry.description}</td>
                    <td className="p-4 text-right font-mono text-green-500 font-bold">
                      {parseFloat(tx.debit) > 0 ? parseFloat(tx.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-4 text-right font-mono text-amber-500 font-bold">
                      {parseFloat(tx.credit) > 0 ? parseFloat(tx.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <BankAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        bankTransaction={selectedBankIds.length === 1 ? bankTransactions.find(t => t.id === selectedBankIds[0]) || null : null}
        onSuccess={() => {
          setSelectedBankIds([]);
          setSelectedLedgerIds([]);
          fetchUnreconciled();
        }}
      />
    </div>
  );
}
