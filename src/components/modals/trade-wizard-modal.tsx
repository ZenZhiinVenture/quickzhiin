'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
  Users,
  Package,
  Loader2,
  Receipt
} from 'lucide-react';
import { EntitySelect } from '../forms/entity-select';
import { DocumentLineItems } from '../forms/document-line-items';
import { tradeAPI } from '@/services/api/trade';
import { useToast } from '@/components/usetoast';
import { cn } from '@/utils/cn';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/label';

const schema = z.object({
  contactId: z.string({
    required_error: "Please select a contact",
  }).min(1, "Please select a contact"),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  date: z.string(),
  currency: z.string().default('RM'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentTerms: z.string().optional(),
  lines: z.array(z.object({
    productId: z.any().optional(),
    productName: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    classificationCode: z.string().optional(),
    msicCode: z.string().optional(),
    msicDescription: z.string().optional(),
    quantity: z.number().min(0.01, "Quantity must be at least 0.01"),
    unitPrice: z.number().min(0),
    discount: z.number().default(0),
    tax: z.number().default(0),
  })).min(1, "Please add at least one item"),
});

type TradeWizardType = 'SALES_QUOTE' | 'SALES_ORDER' | 'SALES_INVOICE' | 'PURCHASE_ORDER' | 'PURCHASE_REQUISITION' | 'SUPPLIER_BILL';

interface TradeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TradeWizardType;
  onSuccess?: () => void;
}

export function TradeWizardModal({ isOpen, onClose, type, onSuccess }: TradeWizardModalProps) {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      currency: 'RM',
      lines: [],
      paymentTerms: 'Cash',
    }
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = methods;

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Transform IDs to numbers to avoid Prisma validation errors
      const payload = {
        ...data,
        contactId: Number(data.contactId),
        lines: data.lines.map((line: any) => ({
          ...line,
          productId: line.productId ? Number(line.productId) : undefined,
          quantity: Number(line.quantity) || 0,
          unitPrice: Number(line.unitPrice) || 0,
          discount: Number(line.discount) || 0,
          tax: Number(line.tax) || 0,
          productName: line.productName || '',
          description: line.description || '',
          classificationCode: line.classificationCode || undefined,
          msicCode: line.msicCode || undefined,
          msicDescription: line.msicDescription || undefined,
        }))
      };

      let response;
      switch (type) {
        case 'SALES_QUOTE':
          response = await tradeAPI.createQuote(payload);
          break;
        case 'SALES_ORDER':
          response = await tradeAPI.createOrder(payload);
          break;
        case 'SALES_INVOICE':
          response = await tradeAPI.createInvoice(payload);
          break;
        case 'PURCHASE_ORDER':
          response = await tradeAPI.createPurchaseOrder(payload);
          break;
        case 'PURCHASE_REQUISITION':
          response = await tradeAPI.createPurchaseRequisition(payload);
          break;
        case 'SUPPLIER_BILL':
          response = await tradeAPI.createBill(payload);
          break;
      }

      toast({
        title: "Success",
        description: "Document created successfully.",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create document",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'SALES_QUOTE': return "Create Sales Quote";
      case 'SALES_ORDER': return "Create Sales Order";
      case 'SALES_INVOICE': return "Create Tax Invoice";
      case 'PURCHASE_ORDER': return "Create Purchase Order";
      case 'PURCHASE_REQUISITION': return "Create Purchase Requisition";
      case 'SUPPLIER_BILL': return "Create Supplier Bill";
    }
  };

  const getRecipientLabel = () => {
    if (type.startsWith('SALES')) return 'Customer';
    return 'Supplier';
  };

  const getEntityType = () => {
    if (type.startsWith('SALES')) return 'CUSTOMER';
    return 'VENDOR';
  }

  // Reset step when modal opens
  React.useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] w-[95vw] h-[90vh] flex flex-col p-0 bg-background border-none shadow-2xl overflow-hidden text-foreground">
        <DialogHeader className="p-8 pb-4 border-b border-white/5 bg-accent/5 text-foreground">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {type === 'SALES_INVOICE' ? <Receipt size={28} className="text-primary" /> : <FileText size={28} className="text-primary" />} {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Follow the steps to generate your {type.replace('_', ' ').toLowerCase()} accurately.
          </DialogDescription>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
                  step >= s ? "bg-primary text-white" : "bg-primary/20 text-primary/40"
                )}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  step >= s ? "text-foreground" : "text-foreground/40"
                )}>
                  {s === 1 ? "Recipient" : s === 2 ? "Items" : "Review"}
                </span>
                {s < 3 && <div className="w-12 h-[2px] bg-foreground/10" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-background/50 text-foreground">
          <FormProvider {...methods}>
            <form id="trade-wizard-form" onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Select {getRecipientLabel()}
                      </Label>
                      <EntitySelect
                        type={getEntityType()}
                        value={watch('contactId')}
                        onChange={(id, entity) => {
                          setValue('contactId', id);
                          if (entity) {
                            setValue('contactName', entity.legalname);
                            setValue('contactEmail', entity.email);
                          }
                        }}
                      />
                      {errors.contactId && <p className="text-xs text-red-500">{String(errors.contactId.message)}</p>}
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Document Date</Label>
                      <Input type="date" {...methods.register('date')} className="glass h-11" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Payment Terms</Label>
                      <Input
                        placeholder="e.g. Cash, COD, Net 30"
                        className="glass h-11"
                        {...methods.register('paymentTerms')}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Currency</Label>
                      <Input
                        className="glass h-11 bg-accent/20"
                        readOnly
                        {...methods.register('currency')}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Additional Terms & Notes</Label>
                    <Textarea
                      placeholder="Add specific terms, shipping info or private notes..."
                      className="glass min-h-[120px] resize-none"
                      {...methods.register('notes')}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <DocumentLineItems />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col items-center justify-center py-10 text-center bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Check size={40} className="vibrancy-icon" />
                    </div>
                    <h3 className="text-2xl font-bold">Ready to finalize?</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                      Please double check the recipient and the total amounts before clicking "Finish & Save".
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <Card className="glass-card shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users size={18} className="text-primary" /> Recipient Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{getRecipientLabel()}:</span>
                          <span className="font-semibold">{watch('contactName') || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-semibold">{watch('contactEmail') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-semibold">{watch('date')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Terms:</span>
                          <span className="font-semibold">{watch('paymentTerms')}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="glass-card shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package size={18} className="text-primary" /> Item Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Items:</span>
                          <span className="font-semibold">{watch('lines')?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-muted-foreground">Grand Total:</span>
                          <span className="bg-primary/10 px-3 py-1 rounded-full text-primary font-bold">
                            RM {watch('lines')?.reduce((acc: number, cur: any) => acc + (cur.quantity * cur.unitPrice - cur.discount + cur.tax), 0).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </form>
          </FormProvider>
        </div>

        <DialogFooter className="p-8 border-t border-white/5 bg-accent/5">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="glass hover:bg-accent/50"
                  disabled={loading}
                >
                  <ChevronLeft size={18} className="mr-2" /> Previous
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="vibrant-gradient text-white shadow-lg shadow-primary/20"
                disabled={step === 1 && !watch('contactId')}
              >
                Next Step <ChevronRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="trade-wizard-form"
                className="vibrant-gradient text-white shadow-lg shadow-primary/20 px-10"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}
                Finish & Save Document
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
