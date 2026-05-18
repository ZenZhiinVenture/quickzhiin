'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, Package } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/dropdown';
import { Input } from '@/components/input';
import { ScrollArea } from '@/components/scrollarea';
import { productAPI } from '@/services/api/product';
import { ProductModal } from '../modals/product-modal';
import { PlusCircle } from 'lucide-react';

interface ProductSelectProps {
  value?: string;
  onChange: (value: string, product: any) => void;
  placeholder?: string;
}

export function ProductSelect({ 
  value, 
  onChange, 
  placeholder = "Search and add product..." 
}: ProductSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const fetchProducts = async (search: string = '') => {
    try {
      setLoading(true);
      const response = await productAPI.getAll({ search });
      setProducts(response.data.products?.items || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial product if we have a value but no selectedProduct
  React.useEffect(() => {
    if (value && !selectedProduct) {
      const fetchSelected = async () => {
        try {
          const response = await productAPI.getById(value);
          setSelectedProduct(response.data.product);
        } catch (error) {
          console.error('Failed to fetch selected product', error);
        }
      };
      fetchSelected();
    }
    fetchProducts();
  }, [value]);

  const handleSelect = (product: any) => {
    setSelectedProduct(product);
    onChange(String(product.id), product);
    setOpen(false);
  };

  const handleCreateSuccess = (newProduct: any) => {
    fetchProducts();
    handleSelect(newProduct);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left px-0 hover:bg-transparent h-auto"
          >
            <div className="flex items-center gap-3 w-full group">
              <div className="h-10 w-10 min-w-[40px] rounded-xl glass border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                <Package size={20} />
              </div>
              <div className="flex flex-col flex-1 truncate">
                {selectedProduct ? (
                  <>
                    <span className="font-semibold text-foreground text-sm leading-tight">{selectedProduct.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{selectedProduct.sku || selectedProduct.classificationCode || "No SKU"}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground font-medium text-sm">{placeholder}</span>
                )}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-0 w-[500px] bg-background text-foreground shadow-2xl border border-border" align="start">
          <div className="flex flex-col">
            <div className="flex items-center border-b border-border/50 px-3 h-12">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input 
                placeholder="Search products by name or SKU..." 
                className="flex h-9 w-full rounded-md bg-transparent border-none focus-visible:ring-0 px-0 py-3 text-sm"
                autoFocus
                onChange={(e) => fetchProducts(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <ScrollArea className="max-h-[400px] overflow-y-auto overflow-x-hidden">
              <div className="p-1">
                {loading && products.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
                ) : products.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-4">
                    <p>No items found.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="vibrant-gradient text-white border-none gap-2 px-6"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddModal(true);
                        setOpen(false);
                      }}
                    >
                      <PlusCircle size={16} /> Create New Product
                    </Button>
                  </div>
                ) : (
                  <>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowAddModal(true);
                        setOpen(false);
                      }}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer text-primary font-bold hover:bg-primary/5 focus:bg-primary/5 outline-none rounded-md"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <PlusCircle size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span>Add New Product</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Quickly add a new item to catalog</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border/30 my-1" />
                    
                    {products.map((product) => (
                      <DropdownMenuItem
                        key={product.id}
                        onSelect={() => handleSelect(product)}
                        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-md"
                      >
                        <div className="h-10 w-10 rounded-xl glass flex items-center justify-center text-primary shrink-0 font-bold border border-white/10 overflow-hidden">
                          {product.image ? (
                              <img src={product.image} className="object-cover h-full w-full" alt="" />
                          ) : (
                              <Package size={20} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 truncate">
                          <span className="font-semibold text-sm">{product.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground bg-accent/30 px-1.5 py-0.5 rounded font-bold">{product.sku || product.classificationCode}</span>
                              <span className="text-xs text-primary font-bold">RM {Number(product.salePrice || 0).toFixed(2)}</span>
                              <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded uppercase">{product.quantityOnHand || 0} In Stock</span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 text-primary",
                            value === String(product.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
