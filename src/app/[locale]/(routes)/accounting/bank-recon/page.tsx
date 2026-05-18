'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Upload, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/card';
import { Badge } from '@/components/badge';
import api from '@/services/api/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BankStatementModal } from '@/components/modals/BankStatementModal';

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  _count: {
    transactions: number;
    reconciliations: number;
  };
}

export default function BankReconPage() {
  const t = useTranslations('ModuleMenu.BankRecon');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const locale = params.locale as string;
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bank-account');
      if (response.data.success) {
        setBankAccounts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error(t('errorFetching'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsUploadOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button className="vibrant-gradient text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> {t('addAccount')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse bg-accent/20 h-[200px]" />
          ))
        ) : bankAccounts.length === 0 ? (
          <Card className="col-span-full py-12 text-center glass-card border-dashed">
            <CardContent className="space-y-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{t('noAccounts')}</h3>
                <p className="text-muted-foreground">{t('noAccountsDesc')}</p>
              </div>
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> {t('setupFirstAccount')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          bankAccounts.map((account) => (
            <Card key={account.id} className="glass-card hover-card transition-all duration-300 border-primary/10 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{account.name}</CardTitle>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {account.currency}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">{account.bankName}</div>
                <div className="text-xs font-mono mb-4">**** {account.accountNumber.slice(-4)}</div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-muted-foreground">{t('ledgerBalance')}</div>
                    <div className="text-2xl font-bold">
                      {account.currency} {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{t('unreconciled')}</div>
                    <div className="flex items-center text-amber-500 font-medium">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {account._count.transactions}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-primary/5 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleUploadClick(account.id)}
                >
                  <Upload className="mr-2 h-4 w-4" /> {t('uploadStatement')}
                </Button>
                <Link href={`/${locale}/accounting/bank-recon/${account.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-between group">
                    <span>{t('reconcileNow')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <BankStatementModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        bankAccountId={selectedAccountId || ''}
        onSuccess={fetchBankAccounts}
      />
    </div>
  );
}
