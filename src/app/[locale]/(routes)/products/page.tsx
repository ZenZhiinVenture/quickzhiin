'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/datatable';
import { ColumnDef } from '@tanstack/react-table';
import { productAPI } from '@/services/api/product';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, Package, ShoppingBag, Tags, MoreHorizontal, Edit, Trash, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/dropdown';
import { useToast } from '@/components/usetoast';

interface Product {
  id: string;
  name: string;
  description: string;
  salePrice: number;
  purchasePrice: number;
  classificationCode: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      // The backend returns it in a property called 'products' based on my audit
      setData(response.data.products?.items || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch products',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => <span className="font-bold">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'classificationCode',
      header: 'SKU/Code',
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('classificationCode') || 'N/A'}</span>,
    },
    {
      accessorKey: 'salePrice',
      header: 'Sale Price',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('salePrice'));
        return <span className="font-medium text-primary">RM {price.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Cost',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('purchasePrice'));
        return <span className="text-muted-foreground">RM {price.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}>
          {row.original.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center gap-2">
                <BarChart3 size={14} /> View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Edit size={14} /> Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 flex items-center gap-2">
                <Trash size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
          <p className="text-muted-foreground">Manage your inventory, pricing, and catalog.</p>
        </div>
        <Button className="vibrant-gradient text-white flex gap-2">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,491</div>
            <p className="text-xs text-muted-foreground">Active in catalog</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-destructive font-medium">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Electronics</div>
            <p className="text-xs text-primary font-medium">45% of total sales</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Catalog Management</CardTitle>
          <CardDescription>View and manage all items in your product catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} search="name" />
        </CardContent>
      </Card>
    </div>
  );
}
