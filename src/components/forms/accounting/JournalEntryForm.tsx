'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/forms';
import { Input } from '@/components/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/select';
import { Textarea } from '@/components/textarea';
import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Plus, Trash, AlertCircle } from 'lucide-react';
import { accountAPI } from '@/services/api/account';
import { useToast } from '@/components/usetoast';

const journalEntryLineSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  description: z.string().optional(),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
});

const journalEntryFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  number: z.string().min(1, 'Number is required'),
  reference: z.string().optional(),
  narration: z.string().optional(),
  status: z.enum(['DRAFT', 'READY']).default('READY'),
  lines: z.array(journalEntryLineSchema).min(2, 'At least 2 lines are required'),
});

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

interface JournalEntryFormProps {
  initialValues?: Partial<JournalEntryFormValues>;
  onSubmit: (values: JournalEntryFormValues) => void;
  isLoading?: boolean;
}

interface Account {
  id: string;
  code: string;
  name: string;
}

export function JournalEntryForm({ initialValues, onSubmit, isLoading }: JournalEntryFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { toast } = useToast();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema) as any,
    defaultValues: {
      date: initialValues?.date || new Date().toISOString().split('T')[0],
      number: initialValues?.number || '',
      reference: initialValues?.reference || '',
      narration: initialValues?.narration || '',
      lines: initialValues?.lines || [
        { accountId: '', description: '', debit: 0, credit: 0 },
        { accountId: '', description: '', debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control as any,
    name: 'lines',
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await accountAPI.getAll();
        setAccounts(response.data.accounts || []);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch accounts',
        });
      }
    };
    fetchAccounts();
  }, [toast]);

  const watchLines = form.watch('lines');
  const totalDebit = watchLines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = watchLines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Header Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. JRN-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional reference" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="narration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narration</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Overall description..." className="h-10 py-2 min-h-[40px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Entry Lines</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ accountId: '', description: '', debit: 0, credit: 0 })}
            >
              <Plus size={16} className="mr-1" /> Add Line
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-muted/30 p-2 rounded-md border border-muted">
                  <div className="col-span-12 md:col-span-4">
                    <FormField
                      control={form.control as any}
                      name={`lines.${index}.accountId`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select Account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  {acc.code} - {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-12 md:col-span-4">
                    <FormField
                      control={form.control as any}
                      name={`lines.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Line description" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-5 md:col-span-1.5 flex flex-col gap-1">
                    <FormField
                      control={form.control as any}
                      name={`lines.${index}.debit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                className="bg-background text-right" 
                                {...field} 
                                onFocus={(e) => e.target.select()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-5 md:col-span-1.5 flex flex-col gap-1">
                    <FormField
                      control={form.control as any}
                      name={`lines.${index}.credit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                className="bg-background text-right" 
                                {...field} 
                                onFocus={(e) => e.target.select()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1 flex justify-center pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive h-8 w-8"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted flex flex-col md:flex-row justify-between items-center gap-4">
              {!isBalanced && (
                <div className="flex items-center text-destructive text-sm font-medium">
                  <AlertCircle size={16} className="mr-2" />
                  Out of balance by: RM {diff.toFixed(2)}
                </div>
              )}
              {isBalanced && (
                <div className="text-green-600 text-sm font-medium">
                  Journal is balanced.
                </div>
              )}
              <div className="flex gap-8 text-sm">
                <div className="text-right">
                  <div className="text-muted-foreground">Total Debits</div>
                  <div className="text-lg font-bold">RM {totalDebit.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Total Credits</div>
                  <div className="text-lg font-bold">RM {totalCredit.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            disabled={isLoading || !isBalanced}
            onClick={() => {
                form.setValue('status', 'DRAFT');
                form.handleSubmit(onSubmit)();
            }}
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button 
            type="button" 
            className="vibrant-gradient text-white px-8" 
            disabled={isLoading || !isBalanced}
            onClick={() => {
                form.setValue('status', 'READY');
                form.handleSubmit(onSubmit)();
            }}
          >
            {isLoading ? 'Posting...' : 'Post Journal'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
