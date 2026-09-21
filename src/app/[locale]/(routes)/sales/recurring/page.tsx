'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { useToast } from '@/components/usetoast';
import {
  Repeat,
  Play,
  Pause,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dropdown';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  recurringInvoiceAPI,
  RecurringInvoiceProfile,
} from '@/services/api/recurringInvoice';
import { RecurringInvoiceModal } from '@/components/modals/recurring-invoice-modal';
import dayjs from 'dayjs';

export default function RecurringInvoicesPage() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<RecurringInvoiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await recurringInvoiceAPI.list({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setProfiles(res.data?.data || []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load recurring invoice profiles',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, toast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRunBatchNow = async () => {
    try {
      setProcessingBatch(true);
      const res = await recurringInvoiceAPI.processBatch();
      const result = res.data?.data;
      const count = result?.processedCount || 0;
      if (count > 0) {
        toast({
          title: 'Batch Complete',
          description: `Successfully generated ${count} invoice(s).`,
        });
      } else {
        toast({
          title: 'All Up to Date',
          description: 'No recurring profiles are currently due for billing.',
        });
      }
      fetchProfiles();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Batch Error',
        description: err.response?.data?.message || 'Failed to process recurring invoices',
      });
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleTogglePause = async (profile: RecurringInvoiceProfile) => {
    try {
      if (profile.status === 'ACTIVE') {
        await recurringInvoiceAPI.pause(profile.id);
        toast({ title: 'Paused', description: `Profile "${profile.profileName}" is now paused.` });
      } else {
        await recurringInvoiceAPI.resume(profile.id);
        toast({ title: 'Resumed', description: `Profile "${profile.profileName}" is now active.` });
      }
      fetchProfiles();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile status' });
    }
  };

  const handleDelete = (profile: RecurringInvoiceProfile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Recurring Profile',
      description: `Are you sure you want to delete "${profile.profileName}"? Invoices already generated will not be affected.`,
      onConfirm: async () => {
        try {
          await recurringInvoiceAPI.delete(profile.id);
          toast({ title: 'Deleted', description: 'Recurring profile removed successfully.' });
          fetchProfiles();
        } catch {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete profile' });
        }
      },
    });
  };

  // Derived Stats
  const activeCount = profiles.filter((p) => p.status === 'ACTIVE').length;
  const dueTodayCount = profiles.filter((p) => {
    if (p.status !== 'ACTIVE') return false;
    return dayjs(p.nextRunDate).isBefore(dayjs().endOf('day'));
  }).length;
  const totalInvoicesGenerated = profiles.reduce((acc, p) => acc + (p.invoicesGenerated || 0), 0);

  const calculateProfileTotal = (profile: RecurringInvoiceProfile) => {
    const rawLines = Array.isArray(profile.lineItems) ? profile.lineItems : [];
    return rawLines.reduce((acc, l) => acc + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/sales"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sales
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Repeat className="h-8 w-8 text-primary" /> Recurring Invoices & Retainers
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Automate periodic subscriptions, monthly retainers, and scheduled billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRunBatchNow}
            disabled={processingBatch}
            className="glass hover:bg-accent/50 transition-all gap-2"
          >
            <Zap className={`h-4 w-4 text-amber-500 ${processingBatch ? 'animate-spin' : ''}`} />
            {processingBatch ? 'Processing...' : 'Run Due Invoices Now'}
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="vibrant-gradient text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all gap-2"
          >
            <Plus className="h-4 w-4" /> New Recurring Profile
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Profiles
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-foreground">{profiles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Managed schedules</p>
          </div>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Schedules
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-emerald-500">{activeCount}</div>
            <p className="text-xs text-emerald-600/80 mt-1">Generating periodically</p>
          </div>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Due For Run
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className={`text-3xl font-bold ${dueTodayCount > 0 ? 'text-amber-500' : 'text-primary'}`}>
              {dueTodayCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled today or overdue</p>
          </div>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Invoices Generated
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold text-indigo-500">{totalInvoicesGenerated}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime automated runs</p>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="glass-card border-none shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-accent/5 p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex gap-2">
            {(['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED'] as const).map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'ghost'}
                onClick={() => setStatusFilter(st)}
                className={`text-xs capitalize font-medium ${statusFilter === st ? 'vibrant-gradient text-white' : ''}`}
              >
                {st.toLowerCase()}
              </Button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search by profile or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass h-9 text-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading recurring profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Repeat size={48} className="mb-4 opacity-20" />
              <p className="font-semibold text-base">No recurring profiles found</p>
              <p className="text-sm mt-1">Create automated retainer schedules for your clients.</p>
              <Button className="mt-4 vibrant-gradient text-white" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" /> Create First Profile
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground bg-accent/10">
                    <th className="p-4">Profile & Customer</th>
                    <th className="p-4">Frequency</th>
                    <th className="p-4">Next Run Date</th>
                    <th className="p-4">Amount / Cycle</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {profiles.map((profile) => {
                    const isDue =
                      profile.status === 'ACTIVE' && dayjs(profile.nextRunDate).isBefore(dayjs().endOf('day'));

                    return (
                      <tr key={profile.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{profile.profileName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {profile.contact?.legalname || 'Client'}
                            {profile.paymentTerms ? ` • ${profile.paymentTerms}` : ''}
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                            {profile.frequency}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Clock
                              className={`h-3.5 w-3.5 ${isDue ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}
                            />
                            <span className={isDue ? 'text-amber-600 font-semibold' : ''}>
                              {dayjs(profile.nextRunDate).format('DD MMM YYYY')}
                            </span>
                          </div>
                          {isDue && <span className="text-[10px] text-amber-500 font-medium">Due Now</span>}
                        </td>

                        <td className="p-4 font-medium">
                          {profile.currency} {calculateProfileTotal(profile).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-4 text-xs text-muted-foreground">
                          {profile.invoicesGenerated} generated
                          {profile.maxOccurrences ? ` / ${profile.maxOccurrences}` : ''}
                        </td>

                        <td className="p-4">
                          {profile.status === 'ACTIVE' ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                              Active
                            </Badge>
                          ) : profile.status === 'PAUSED' ? (
                            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
                              Paused
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">Completed</Badge>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass">
                              <DropdownMenuLabel>Manage Profile</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {profile.status !== 'COMPLETED' && (
                                <DropdownMenuItem onClick={() => handleTogglePause(profile)}>
                                  {profile.status === 'ACTIVE' ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2 text-amber-500" /> Pause Schedule
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2 text-emerald-500" /> Resume Schedule
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(profile)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Creation Modal */}
      <RecurringInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProfiles}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
