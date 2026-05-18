'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api/report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { 
  ChevronLeft, 
  Calendar, 
  Filter, 
  Download, 
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '@/components/badge';
import { Input } from '@/components/input';
import { useToast } from '@/components/usetoast';

interface LedgerLine {
  id: string;
  date: string;
  number: string;
  reference: string | null;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  lines: LedgerLine[];
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export default function GeneralLedgerPage() {
  const [data, setData] = useState<LedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations('Navigation');
  const { toast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getGeneralLedger(startDate, endDate);
      const rawData = response.data.data || response.data;
      setData(rawData.accounts || []);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch General Ledger report',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedAccounts(newSet);
  };

  const expandAll = () => setExpandedAccounts(new Set(data.map(a => a.id)));
  const collapseAll = () => setExpandedAccounts(new Set());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('ledger')}</h1>
            <p className="text-muted-foreground">General Ledger Report</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-end gap-3 glass p-4 rounded-xl border border-white/20 shadow-sm">
          <div className="space-y-1.5 px-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Calendar size={12} /> From
            </label>
            <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-9 w-40 bg-background"
            />
          </div>
          <div className="space-y-1.5 px-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Calendar size={12} /> To
            </label>
            <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-9 w-40 bg-background"
            />
          </div>
          <Button onClick={fetchReport} className="vibrant-gradient text-white h-9 px-6 transition-all active:scale-95 shadow-lg shadow-primary/20">
            <Filter size={16} className="mr-2" /> Run Report
          </Button>
          
          <div className="flex gap-2 ml-auto">
             <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
             <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.length === 0 ? (
            <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No transactions found for the selected period.</CardContent></Card>
          ) : (
            data.map((account) => (
                <Card key={account.id} className="glass-card overflow-hidden transition-all duration-300 border border-white/10 shadow-md">
                    <div 
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors ${expandedAccounts.has(account.id) ? 'bg-muted/50 border-b border-white/10' : ''}`}
                        onClick={() => toggleExpand(account.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg vibrant-gradient flex items-center justify-center text-white shadow-md transition-transform duration-300 ${expandedAccounts.has(account.id) ? 'rotate-90' : ''}`}>
                                {expandedAccounts.has(account.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                            <div>
                                <div className="font-mono text-sm text-muted-foreground">{account.code}</div>
                                <div className="text-xl font-bold">{account.name}</div>
                            </div>
                        </div>
                        <div className="flex gap-8 text-right pr-4">
                            <div className="hidden lg:block">
                                <div className="text-xs text-muted-foreground uppercase">Opening</div>
                                <div className="font-bold">RM {account.openingBalance.toFixed(2)}</div>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-xs text-muted-foreground uppercase">Debit</div>
                                <div className="font-bold">RM {account.totalDebit.toFixed(2)}</div>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-xs text-muted-foreground uppercase">Credit</div>
                                <div className="font-bold">RM {account.totalCredit.toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase">Closing</div>
                                <div className={`text-xl font-black ${account.closingBalance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    RM {account.closingBalance.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {expandedAccounts.has(account.id) && (
                        <div className="p-0 animate-in slide-in-from-top-2 duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Date</th>
                                            <th className="px-6 py-3 text-left">Ref / Number</th>
                                            <th className="px-6 py-3 text-left">Description</th>
                                            <th className="px-6 py-3 text-right">Debit</th>
                                            <th className="px-6 py-3 text-right">Credit</th>
                                            <th className="px-6 py-3 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="bg-muted/10 italic">
                                            <td className="px-6 py-4 whitespace-nowrap">{format(new Date(startDate), 'dd MMM yyyy')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono">-</td>
                                            <td className="px-6 py-4 font-bold">Opening Balance</td>
                                            <td className="px-6 py-4 text-right">-</td>
                                            <td className="px-6 py-4 text-right">-</td>
                                            <td className="px-6 py-4 text-right font-bold">RM {account.openingBalance.toFixed(2)}</td>
                                        </tr>
                                        {account.lines.map((line) => (
                                            <tr key={line.id} className="hover:bg-accent/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(line.date), 'dd MMM yyyy')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono">{line.number}</td>
                                                <td className="px-6 py-4">{line.description}</td>
                                                <td className="px-6 py-4 text-right">RM {Number(line.debit).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">RM {Number(line.credit).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-medium">RM {Number(line.balance).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>
            ))
          )}
        </div>
      )}

      <div className="flex gap-4 justify-center py-8">
        <Button variant="outline" className="vibrant-gradient-hover hover:text-white flex gap-2">
            <Printer size={16} /> Print Report
        </Button>
        <Button variant="outline" className="vibrant-gradient-hover hover:text-white flex gap-2">
            <Download size={16} /> Download Excel
        </Button>
      </div>
    </div>
  );
}
