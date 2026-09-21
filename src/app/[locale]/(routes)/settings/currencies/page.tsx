'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { useToast } from '@/components/usetoast';
import {
  Coins,
  DollarSign,
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  Globe,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  currencyAPI,
  SupportedCurrency,
  ExchangeRateItem,
} from '@/services/api/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';

export default function CurrenciesPage() {
  const { toast } = useToast();
  const [baseCurrency, setBaseCurrency] = useState('MYR');
  const [selectedBase, setSelectedBase] = useState('MYR');
  const [supportedCurrencies, setSupportedCurrencies] = useState<SupportedCurrency[]>([]);
  const [rates, setRates] = useState<ExchangeRateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBase, setSavingBase] = useState(false);

  // Add rate dialog state
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MYR');
  const [rateValue, setRateValue] = useState('');
  const [source, setSource] = useState('Wise');
  const [notes, setNotes] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCurrencyData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await currencyAPI.getSettings();
      if (res.data?.data) {
        const { baseCurrency: base, supportedCurrencies: supported, rates: rateList } = res.data.data;
        setBaseCurrency(base);
        setSelectedBase(base);
        setSupportedCurrencies(supported);
        setRates(rateList);
        setToCurrency(base);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch currency settings';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCurrencyData();
  }, [fetchCurrencyData]);

  const handleSaveBaseCurrency = async () => {
    try {
      setSavingBase(true);
      await currencyAPI.setBaseCurrency(selectedBase);
      setBaseCurrency(selectedBase);
      toast({
        title: 'Base Currency Updated',
        description: `Company accounting base currency is now ${selectedBase}.`,
      });
      fetchCurrencyData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update base currency';
      toast({
        title: 'Update Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setSavingBase(false);
    }
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericRate = parseFloat(rateValue);
    if (isNaN(numericRate) || numericRate <= 0) {
      toast({
        title: 'Invalid Rate',
        description: 'Please enter a valid positive exchange rate.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingRate(true);
      await currencyAPI.createRate({
        fromCurrency,
        toCurrency,
        rate: numericRate,
        source,
        notes,
      });

      toast({
        title: 'Exchange Rate Saved',
        description: `1 ${fromCurrency} = ${numericRate} ${toCurrency} saved successfully.`,
      });

      setIsAddRateOpen(false);
      setRateValue('');
      setNotes('');
      fetchCurrencyData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save exchange rate';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setSubmittingRate(false);
    }
  };

  const handleDeleteRate = async (id: string) => {
    try {
      setActionLoadingId(id);
      await currencyAPI.deleteRate(id);
      toast({
        title: 'Rate Deleted',
        description: 'Exchange rate record removed.',
      });
      fetchCurrencyData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete rate';
      toast({
        title: 'Delete Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-3">
            <Coins className="w-8 h-8 text-indigo-400" />
            Currencies & Exchange Rates
          </h1>
          <p className="text-muted-foreground text-sm">
            Set your accounting base currency and maintain default conversion rates. You can always override the exact rate on individual invoices and bills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCurrencyData}
            disabled={loading}
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsAddRateOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exchange Rate
          </Button>
        </div>
      </div>

      {/* Top Config Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Base Currency Card */}
        <Card className="glass-card border-white/10 shadow-lg md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Company Base Currency
            </CardTitle>
            <CardDescription>
              All primary financial reports (Balance Sheet, Profit & Loss, Trial Balance) are denominated in this base currency.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[220px]"
            >
              {supportedCurrencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>

            <Button
              onClick={handleSaveBaseCurrency}
              disabled={savingBase || selectedBase === baseCurrency}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {savingBase ? 'Saving...' : selectedBase === baseCurrency ? 'Current Base' : 'Set as Base Currency'}
            </Button>

            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 py-1 px-3 ml-auto">
              Current: {baseCurrency}
            </Badge>
          </CardContent>
        </Card>

        {/* User Rates Policy Card */}
        <Card className="glass-card border-white/10 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              User-Input Rate Control
            </CardTitle>
            <CardDescription>
              Different providers (Stripe, Wise, Maybank) charge different spreads.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-1.5 text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              Invoice & Bill rate override enabled
            </p>
            <p>
              When issuing foreign currency transactions, you can freely type your exact conversion rate to match your actual bank slip.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rates History Table */}
      <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-white/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            Standard & Default Exchange Rates
          </CardTitle>
          <CardDescription>
            Reference conversion rates used to pre-fill new transaction forms.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm">Loading exchange rates...</p>
            </div>
          ) : rates.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Coins className="w-10 h-10 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No custom exchange rates saved</p>
              <p className="text-xs max-w-sm text-center">
                Add default conversion rates for your frequent trading currencies (e.g. USD to {baseCurrency}, SGD to {baseCurrency}).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddRateOpen(true)}
                className="mt-2 border-white/10"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Rate
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Currency Pair</th>
                    <th className="px-6 py-4">Exchange Rate</th>
                    <th className="px-6 py-4">Effective Date</th>
                    <th className="px-6 py-4">Source / Provider</th>
                    <th className="px-6 py-4">Notes</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rates.map((r) => {
                    const isDeleting = actionLoadingId === r.id;
                    const formattedDate = new Date(r.effectiveDate).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <span className="text-indigo-400">{r.fromCurrency}</span> / {r.toCurrency}
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-foreground">
                          1 {r.fromCurrency} = {Number(r.rate).toFixed(6)} {r.toCurrency}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <Badge className="bg-white/5 text-foreground border-white/10">
                            {r.source || 'Manual'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                          {r.notes || '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isDeleting}
                            onClick={() => handleDeleteRate(r.id)}
                            className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Rate Modal Dialog */}
      <Dialog open={isAddRateOpen} onOpenChange={setIsAddRateOpen}>
        <DialogContent className="glass-card border-white/20 sm:max-w-lg">
          <form onSubmit={handleCreateRate}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-400" />
                Add Exchange Rate
              </DialogTitle>
              <DialogDescription>
                Define a default conversion rate for this currency pair.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    From Currency *
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {supportedCurrencies.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                        {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    To Currency (Base) *
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {supportedCurrencies.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                        {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rate (1 {fromCurrency} = ? {toCurrency}) *
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 4.450000"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 font-mono text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Source / Provider
                </label>
                <Input
                  placeholder="e.g. Wise, Stripe, Maybank, CIMB, Manual"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <Input
                  placeholder="e.g. Standard monthly billing conversion"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddRateOpen(false)}
                disabled={submittingRate}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingRate}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
              >
                {submittingRate ? 'Saving...' : 'Save Rate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
