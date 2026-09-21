'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/dialog';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Plus, Trash2, Calendar, DollarSign, Repeat, User } from 'lucide-react';
import { useToast } from '@/components/usetoast';
import { contactsAPI } from '@/services/api/contact';
import {
  recurringInvoiceAPI,
  RecurringFrequency,
  RecurringInvoiceLineItem,
} from '@/services/api/recurringInvoice';

interface RecurringInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FREQUENCY_OPTIONS: { label: string; value: RecurringFrequency }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly (Every 3 Months)', value: 'QUARTERLY' },
  { label: 'Biannually (Every 6 Months)', value: 'BIANNUALLY' },
  { label: 'Annually (Once a Year)', value: 'ANNUALLY' },
];

export function RecurringInvoiceModal({ isOpen, onClose, onSuccess }: RecurringInvoiceModalProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [profileName, setProfileName] = useState('');
  const [contactId, setContactId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [maxOccurrences, setMaxOccurrences] = useState('');
  const [currency, setCurrency] = useState('MYR');
  const [exchangeRate, setExchangeRate] = useState('1.0');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [autoSendEmail, setAutoSendEmail] = useState(false);

  // Line items state
  const [lines, setLines] = useState<RecurringInvoiceLineItem[]>([
    { productName: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 },
  ]);

  useEffect(() => {
    if (isOpen) {
      const loadContacts = async () => {
        try {
          setLoadingContacts(true);
          const res = await contactsAPI.getAll();
          const items = res.data?.data?.items || res.data?.data || [];
          setContacts(items);
          if (items.length > 0 && !contactId) {
            setContactId(items[0].id.toString());
          }
        } catch {
          // Soft fail
        } finally {
          setLoadingContacts(false);
        }
      };
      loadContacts();
    }
  }, [isOpen]);

  const handleLineChange = (index: number, field: keyof RecurringInvoiceLineItem, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { productName: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return lines.reduce((acc, l) => acc + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please enter a profile name' });
      return;
    }
    if (!contactId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select a customer' });
      return;
    }
    if (lines.some((l) => !l.productName.trim())) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'All line items must have a description' });
      return;
    }

    try {
      setSubmitting(true);
      await recurringInvoiceAPI.create({
        profileName: profileName.trim(),
        contactId,
        frequency,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        maxOccurrences: maxOccurrences ? parseInt(maxOccurrences, 10) : undefined,
        currency,
        exchangeRate: parseFloat(exchangeRate) || 1.0,
        paymentTerms,
        notes: notes.trim() || undefined,
        autoSendEmail,
        lineItems: lines.map((l) => ({
          productName: l.productName,
          quantity: Number(l.quantity) || 1,
          unitPrice: Number(l.unitPrice) || 0,
          discount: Number(l.discount) || 0,
          tax: Number(l.tax) || 0,
        })),
      });

      toast({ title: 'Success', description: 'Recurring invoice profile created successfully.' });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create recurring profile',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Repeat className="h-5 w-5 text-primary" /> New Recurring Invoice Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Profile / Retainer Name *
              </label>
              <Input
                placeholder="e.g. Monthly SEO & Web Maintenance"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="glass"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Customer *
              </label>
              <div className="relative">
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="" disabled>Select Customer</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legalname} {c.taxNo ? `(${c.taxNo})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="p-4 rounded-xl bg-accent/20 border border-border/50 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Recurrence Schedule
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-sm"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">First Run Date *</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="glass"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">End Date (Optional)</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Max Occurrences</label>
                <Input
                  type="number"
                  placeholder="e.g. 12 (leave blank for unlimited)"
                  value={maxOccurrences}
                  onChange={(e) => setMaxOccurrences(e.target.value)}
                  className="glass"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-sm"
                >
                  <option value="MYR">MYR (Malaysian Ringgit)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="SGD">SGD (Singapore Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Exchange Rate ({currency} to MYR)
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="glass"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Template Line Items
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-8 gap-1 glass">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-card/40 p-2 rounded-lg border border-border/40">
                  <Input
                    placeholder="Description / Service"
                    value={line.productName}
                    onChange={(e) => handleLineChange(idx, 'productName', e.target.value)}
                    className="flex-1 glass"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                    className="w-20 glass"
                    min="1"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                    className="w-28 glass"
                    required
                  />
                  <div className="w-28 text-right font-medium text-sm">
                    {currency} {((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0)).toFixed(2)}
                  </div>
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(idx)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-3 text-sm font-semibold">
              Total per Run: {currency} {calculateSubtotal().toFixed(2)}
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Payment Terms
              </label>
              <Input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Net 30, Cash, etc."
                className="glass"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Invoice Notes
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes to appear on generated invoices"
                className="glass"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="vibrant-gradient text-white" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Recurring Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
