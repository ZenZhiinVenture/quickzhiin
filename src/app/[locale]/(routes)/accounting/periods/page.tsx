'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { useToast } from '@/components/usetoast';
import {
  Lock,
  Unlock,
  Plus,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  accountingPeriodAPI,
  AccountingPeriodItem,
} from '@/services/api/accountingPeriod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';

export default function AccountingPeriodsPage() {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<AccountingPeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Dialog state for creating a new period
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const res = await accountingPeriodAPI.getAll();
      if (res.data?.data) {
        setPeriods(res.data.data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch periods';
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
    fetchPeriods();
  }, [fetchPeriods]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please provide period name, start date, and end date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreateSubmitting(true);
      await accountingPeriodAPI.create({ name, startDate, endDate, notes });
      toast({
        title: 'Period Created',
        description: `Accounting period "${name}" has been created successfully.`,
      });
      setIsCreateOpen(false);
      setName('');
      setStartDate('');
      setEndDate('');
      setNotes('');
      fetchPeriods();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create accounting period.';
      toast({
        title: 'Creation Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleClosePeriod = async (period: AccountingPeriodItem) => {
    try {
      setActionLoadingId(period.id);
      await accountingPeriodAPI.close(period.id);
      toast({
        title: 'Period Locked',
        description: `"${period.name}" is now CLOSED. Backdated transactions are blocked.`,
      });
      fetchPeriods();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to close period.';
      toast({
        title: 'Action Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReopenPeriod = async (period: AccountingPeriodItem) => {
    try {
      setActionLoadingId(period.id);
      await accountingPeriodAPI.reopen(period.id);
      toast({
        title: 'Period Reopened',
        description: `"${period.name}" is now OPEN. Transactions can now be recorded.`,
      });
      fetchPeriods();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reopen period.';
      toast({
        title: 'Action Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePeriod = async (period: AccountingPeriodItem) => {
    if (!confirm(`Are you sure you want to delete period "${period.name}"?`)) return;
    try {
      setActionLoadingId(period.id);
      await accountingPeriodAPI.delete(period.id);
      toast({
        title: 'Period Deleted',
        description: `"${period.name}" removed successfully.`,
      });
      fetchPeriods();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete period.';
      toast({
        title: 'Delete Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openPeriodsCount = periods.filter((p) => p.status === 'OPEN').length;
  const closedPeriodsCount = periods.filter((p) => p.status === 'CLOSED').length;

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-3">
            <Lock className="w-8 h-8 text-indigo-400" />
            Accounting Periods
          </h1>
          <p className="text-muted-foreground text-sm">
            Control fiscal periods, lock completed months, and guard historical ledger records against tampering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPeriods}
            disabled={loading}
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/10 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Open Periods</p>
              <p className="text-2xl font-black text-foreground">{openPeriodsCount}</p>
              <p className="text-xs text-muted-foreground">Currently accepting postings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Closed / Locked</p>
              <p className="text-2xl font-black text-foreground">{closedPeriodsCount}</p>
              <p className="text-xs text-muted-foreground">Books sealed & protected</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Book Protection</p>
              <p className="text-lg font-bold text-foreground">Guard Active</p>
              <p className="text-xs text-muted-foreground">API blocks closed-period mutations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Periods Table */}
      <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-white/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Fiscal Periods List
          </CardTitle>
          <CardDescription>
            Audit and manage lock state for monthly, quarterly, or annual periods.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm">Loading periods...</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <AlertCircle className="w-10 h-10 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">No accounting periods defined yet</p>
              <p className="text-xs max-w-sm text-center">
                Create your first accounting period (e.g. for the current month or fiscal year) to begin locking closed books.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2 border-white/10"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Period
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Period Name</th>
                    <th className="px-6 py-4">Date Range</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Closed Details</th>
                    <th className="px-6 py-4">Notes</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {periods.map((period) => {
                    const isClosed = period.status === 'CLOSED';
                    const isWorking = actionLoadingId === period.id;

                    const formattedStart = new Date(period.startDate).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });
                    const formattedEnd = new Date(period.endDate).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr
                        key={period.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {period.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {formattedStart} → {formattedEnd}
                        </td>
                        <td className="px-6 py-4">
                          {isClosed ? (
                            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 gap-1.5 py-1 px-2.5">
                              <Lock className="w-3 h-3" /> CLOSED
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 gap-1.5 py-1 px-2.5">
                              <CheckCircle2 className="w-3 h-3" /> OPEN
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {isClosed && period.closedAt ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                {new Date(period.closedAt).toLocaleDateString('en-MY')}
                              </span>
                              {period.closedBy && (
                                <span className="text-[11px] text-muted-foreground/70">
                                  by {period.closedBy}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                          {period.notes || '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isClosed ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isWorking}
                                onClick={() => handleReopenPeriod(period)}
                                className="h-8 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                              >
                                <Unlock className="w-3.5 h-3.5 mr-1" />
                                Reopen
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isWorking}
                                  onClick={() => handleClosePeriod(period)}
                                  className="h-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                >
                                  <Lock className="w-3.5 h-3.5 mr-1" />
                                  Close Book
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isWorking}
                                  onClick={() => handleDeletePeriod(period)}
                                  className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* New Period Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card border-white/20 sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Create Accounting Period
              </DialogTitle>
              <DialogDescription>
                Define the date range for this fiscal period. Transactions entered within this range can be sealed when you close the period.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Period Name *
                </label>
                <Input
                  placeholder="e.g. October 2025, Q4 2025, FY 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <Input
                  placeholder="e.g. Standard monthly closing period"
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
                onClick={() => setIsCreateOpen(false)}
                disabled={createSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
              >
                {createSubmitting ? 'Creating...' : 'Create Period'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
