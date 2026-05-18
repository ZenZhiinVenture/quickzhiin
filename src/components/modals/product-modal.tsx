'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Textarea } from '@/components/textarea';
import { useToast } from '@/components/usetoast';
import { productAPI } from '@/services/api/product';
import { Loader2, Package, Tag, DollarSign, FileText } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  classificationCode: z.string().min(1, "SKU/Code is required"),
  productId: z.number().optional(),
  productType: z.string().optional(),
  msicCode: z.string().optional(),
  msicDescription: z.string().optional(),
  isInventory: z.boolean().optional(),
  description: z.string().optional(),
  salePrice: z.number().min(0, "Price must be positive"),
  purchasePrice: z.number().min(0, "Cost must be positive"),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof schema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: any) => void;
}

export function ProductModal({ isOpen, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      classificationCode: "",
      description: "",
      salePrice: 0,
      purchasePrice: 0,
      isActive: true,
      productType: "Service",
      isInventory: false,
      msicCode: "",
      msicDescription: ""
    }
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const payload = {
        product: {
          name: data.name,
          sku: data.classificationCode,
          salePrice: Number(data.salePrice) || 0,
          description: data.description || "",
          productType: data.productType || "Service",
          isInventory: data.isInventory ?? false,
          msicCode: data.msicCode || "",
          msicDescription: data.msicDescription || "",
        }
      };
      const response = await productAPI.create(payload);
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
      const newProduct = response.data.product || response.data.data || response.data;
      onSuccess?.(newProduct);
      reset();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create product",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] bg-background text-foreground border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 vibrancy-gradient text-white">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Package size={28} /> Quick Add Product
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Create a new product or service to add it to your document.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Tag size={14} /> Product Name
                </Label>
                <Input 
                    id="name" 
                    placeholder="e.g. Service Fee, Widget A" 
                    className="h-12 border-muted" 
                    {...register('name')} 
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                <Label htmlFor="classificationCode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Package size={14} /> SKU / Code
                </Label>
                <Input 
                    id="classificationCode" 
                    placeholder="e.g. SKU-001" 
                    className="h-12 border-muted" 
                    {...register('classificationCode')} 
                />
                {errors.classificationCode && <p className="text-xs text-red-500">{errors.classificationCode.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="msicCode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MSIC Code (E-Invoice)</Label>
                  <Input 
                    id="msicCode" 
                    placeholder="e.g. 62010" 
                    className="glass h-10" 
                    {...register('msicCode')} 
                    onChange={(e) => {
                      const code = e.target.value;
                      const descriptions: Record<string, string> = {
                        "62010": "Software Development",
                        "62021": "Computer Consultancy Services",
                        "62090": "Other Information Technology Activities",
                        "70209": "Other Management Consultancy Activities",
                        "46510": "Wholesale of Computers, Peripheral Equipment and Software"
                      };
                      if (descriptions[code]) {
                        setValue('msicDescription', descriptions[code]);
                      }
                      register('msicCode').onChange(e);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msicDescription" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MSIC Description</Label>
                  <Input id="msicDescription" placeholder="Software development" className="glass h-10" {...register('msicDescription')} />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isInventory" {...register('isInventory')} className="h-4 w-4 rounded border-white/20 bg-background text-primary" />
                  <Label htmlFor="isInventory" className="text-sm font-medium">Inventory Item</Label>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="salePrice" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign size={14} /> Sale Price (RM)
                </Label>
                <Input 
                    id="salePrice" 
                    type="number" 
                    step="any"
                    placeholder="0.00" 
                    className="h-12 border-muted" 
                    {...register('salePrice', { valueAsNumber: true })} 
                />
                {errors.salePrice && <p className="text-xs text-red-500">{errors.salePrice.message}</p>}
                </div>

                <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign size={14} /> Purchase Cost (RM)
                </Label>
                <Input 
                    id="purchasePrice" 
                    type="number" 
                    step="any"
                    placeholder="0.00" 
                    className="h-12 border-muted" 
                    {...register('purchasePrice', { valueAsNumber: true })} 
                />
                {errors.purchasePrice && <p className="text-xs text-red-500">{errors.purchasePrice.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText size={14} /> Description (Optional)
                </Label>
                <Textarea 
                id="description" 
                placeholder="Brief description of the product or service..." 
                className="min-h-[100px] resize-none border-muted" 
                {...register('description')} 
                />
            </div>

            <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
                </Button>
                <Button type="submit" className="vibrant-gradient text-white px-8" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Save Product"}
                </Button>
            </DialogFooter>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
