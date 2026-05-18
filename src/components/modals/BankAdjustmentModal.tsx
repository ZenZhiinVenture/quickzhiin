'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/dialog';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/select';
import { PlusCircle, Loader2, Info, Receipt, ArrowDownUp } from 'lucide-react';
import api from '@/services/api/api';
import { accountAPI } from '@/services/api/account';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

interface BankAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankTransaction: {
    id: string;
    date: string;
    amount: string;
    description: string;
  } | null;
  onSuccess: () => void;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

export function BankAdjustmentModal({ isOpen, onClose, bankTransaction, onSuccess }: BankAdjustmentModalProps) {
  const t = useTranslations('ModuleMenu.BankRecon');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [offsetAccountId, setOffsetAccountId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      if (bankTransaction) {
        setDescription(bankTransaction.description || '');
        setAmount(Math.abs(parseFloat(bankTransaction.amount)));
      }
    }
  }, [isOpen, bankTransaction]);

  const fetchAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const response = await accountAPI.getAll();
      if (response.data.success) {
        // Filter out the bank account itself if possible, or just list all
        setAccounts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleSubmit = async () => {
    if (!bankTransaction || !offsetAccountId || !description || amount <= 0) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/bank-account/adjustment', {
        bankTransactionId: bankTransaction.id,
        date: bankTransaction.date,
        description,
        offsetAccountId,
        amount
      });

      if (response.data.success) {
        toast.success('Adjustment posted successfully');
        onSuccess();
        onClose();
        setOffsetAccountId('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bankTransaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-primary/20 p-0 overflow-hidden">
        <div className="vibrant-gradient h-2 w-full" />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black italic uppercase tracking-tighter">
              <PlusCircle className="w-6 h-6 text-primary" />
              Post Adjustment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80 font-medium">
              Create a manual journal entry to match this bank transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            {/* Transaction Summary Card */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Transaction Source</p>
                <p className="text-sm font-bold truncate max-w-[200px]">{bankTransaction.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(bankTransaction.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Balance Effect</p>
                <p className={cn(
                  "text-xl font-black",
                  parseFloat(bankTransaction.amount) > 0 ? "text-green-500" : "text-amber-500"
                )}>
                  RM {Math.abs(parseFloat(bankTransaction.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="account" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Offset Account (Where to record this?)
                </Label>
                <Select value={offsetAccountId} onValueChange={setOffsetAccountId}>
                  <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl">
                    <SelectValue placeholder="Select an account..." />
                  </SelectTrigger>
                  <SelectContent className="glass max-h-[250px]">
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-bold">{account.name}</span>
                          <span className="text-[10px] uppercase text-muted-foreground">{account.code} • {account.type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Narration / Description
                </Label>
                <Input 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="h-12 bg-background/50 border-white/10 rounded-xl"
                />
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start">
                <ArrowDownUp className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">Accounting Logic</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This will create a balanced <b>Double-Entry</b> record. One part affects your Bank Ledger, 
                    the other affects the <b>{accounts.find(a => a.id.toString() === offsetAccountId)?.name || 'Offset Account'}</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-6 flex items-center justify-between border-t border-white/5">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="font-bold uppercase tracking-widest text-xs">
            Cancel
          </Button>
          <Button 
            className="vibrant-gradient text-white px-8 h-11 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all font-black uppercase tracking-widest text-xs" 
            onClick={handleSubmit}
            disabled={!offsetAccountId || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Confirm Adjustment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
