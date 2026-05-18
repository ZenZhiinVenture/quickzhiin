'use client';

import * as React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ProductSelect } from './product-select';
import { cn } from '@/utils/cn';
import { Separator } from '@/components/separator';

export function DocumentLineItems() {
  const { control, register, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchLines = useWatch({
    control,
    name: "lines",
  });

  const paymentTerms = useWatch({
    control,
    name: "paymentTerms",
  });

  // Calculate Subtotal dynamically
  const subtotal = watchLines?.reduce((acc: number, line: any) => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unitPrice) || 0;
    const discount = Number(line.discount) || 0;
    return acc + (qty * price) - discount;
  }, 0) || 0;

  const totalTax = watchLines?.reduce((acc: number, line: any) => {
    return acc + (Number(line.tax) || 0);
  }, 0) || 0;

  let rounding = 0;
  const isCash = paymentTerms?.toLowerCase() === 'cash' || paymentTerms?.toLowerCase() === 'cod';
  const subtotalWithTax = subtotal + totalTax;

  if (isCash) {
    // Malaysian 5-sen rounding logic
    const rounded = Math.round(subtotalWithTax * 20) / 20;
    rounding = Number((rounded - subtotalWithTax).toFixed(2));
  }

  const grandTotal = subtotalWithTax + rounding;

  const handleProductSelect = (index: number, product: any) => {
    setValue(`lines.${index}.productId`, product.id);
    setValue(`lines.${index}.productName`, product.name);
    setValue(`lines.${index}.unitPrice`, Number(product.salePrice || product.price) || 0);
    setValue(`lines.${index}.classificationCode`, product.sku || product.classificationCode || '');
    setValue(`lines.${index}.msicCode`, product.msicCode || '');
    setValue(`lines.${index}.msicDescription`, product.msicDescription || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Calculator size={20} className="text-primary" /> Document Items
        </h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => append({ productName: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 })}
          className="glass hover:bg-accent/50"
        >
          <Plus size={16} className="mr-2" /> Add Item
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent/10 border-b border-border/50">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-[40%]">Item Details</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-[15%]">Quantity</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-[15%]">Unit Price</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-[15%]">Discount</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-[15%] text-right font-mono">Line Total</th>
              <th className="px-4 py-3 w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {fields.map((field, index) => {
              const line = watchLines?.[index] || {};
              const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0) - (Number(line.discount) || 0);
              
              return (
                <tr key={field.id} className="group hover:bg-accent/5 transition-colors">
                  <td className="p-4">
                    <ProductSelect 
                      value={String(line.productId || '')} 
                      onChange={(_, product) => handleProductSelect(index, product)} 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      step="any"
                      {...register(`lines.${index}.quantity`, { valueAsNumber: true })} 
                      className="glass transition-all focus:ring-primary h-11"
                    />
                  </td>
                  <td className="p-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">RM</span>
                        <Input 
                            type="number" 
                            step="any"
                            {...register(`lines.${index}.unitPrice`, { valueAsNumber: true })} 
                            className="pl-9 glass transition-all focus:ring-primary h-11"
                        />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">RM</span>
                        <Input 
                            type="number" 
                            step="any"
                            {...register(`lines.${index}.discount`, { valueAsNumber: true })} 
                            className="pl-9 glass transition-all focus:ring-primary h-11"
                        />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-bold text-primary tabular-nums">
                      {lineTotal.toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)}
                      className="text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {fields.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-accent/5">
            <Calculator size={48} className="mb-4 opacity-10" />
            <p className="font-medium">No items added</p>
            <p className="text-sm">Click "Add Item" to start building your document.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <div className="w-[300px] space-y-3 glass-card p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">RM {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax Amount</span>
            <span className="font-semibold text-foreground">RM {totalTax.toFixed(2)}</span>
          </div>
          {isCash && rounding !== 0 && (
            <div className="flex justify-between text-sm text-amber-500 font-medium">
                <span>Rounding Adjustment</span>
                <span>{rounding > 0 ? '+' : ''}RM {rounding.toFixed(2)}</span>
            </div>
          )}
          <Separator className="bg-white/5" />
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-foreground">Grand Total</span>
            <span className="text-2xl font-bold text-primary tracking-tight vibrancy-text">
                RM {grandTotal.toFixed(2)}
            </span>
          </div>
          <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Totals are calculated automatically. Ensure all line item values are correct before finalizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
