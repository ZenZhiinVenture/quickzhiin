'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/dialog';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { useToast } from '@/components/usetoast';
import { paymentAPI } from '@/services/api/payment';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    number: string;
    total: number;
    customerId: string;
  } | null;
  onSuccess: () => void;
}

export function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: 0,
    methodId: '',
    paidAt: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchMethods();
      if (invoice) {
        setFormData((prev) => ({ ...prev, amount: invoice.total }));
      }
    }
  }, [isOpen, invoice]);

  const fetchMethods = async () => {
    try {
      const response = await paymentAPI.getMethods();
      setMethods(response.data.data || []);
      if (response.data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, methodId: response.data.data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      setLoading(true);
      await paymentAPI.recordInvoicePayment(invoice.id, {
        ...formData,
        amount: Number(formData.amount),
        methodId: formData.methodId,
      });

      toast({
        title: 'Success',
        description: `Payment recorded for Invoice ${invoice.number}`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record payment',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a full payment for Invoice {invoice?.number}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RM)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select
              value={formData.methodId}
              onValueChange={(value) => setFormData({ ...formData, methodId: value })}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {methods.map((method) => (
                  <SelectItem key={method.id.toString()} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.paidAt}
              onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="vibrant-gradient text-white" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
