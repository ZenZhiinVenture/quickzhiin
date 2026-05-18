'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, User, PlusCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/button';
import { ContactModal } from '../modals/contact-modal';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/dropdown';
import { Input } from '@/components/input';
import { ScrollArea } from '@/components/scrollarea';
import { contactsAPI } from '@/services/api/contact';

interface EntitySelectProps {
  value?: string;
  onChange: (value: string, entity: any) => void;
  placeholder?: string;
  type?: 'CUSTOMER' | 'VENDOR' | 'BOTH';
}

export function EntitySelect({ 
  value, 
  onChange, 
  placeholder = "Select contact...",
  type = 'BOTH'
}: EntitySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [entities, setEntities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const fetchEntities = async (search: string = '') => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll({ search });
      // Filter by type if needed
      let items = response.data.data?.items || response.data.data || [];
      if (type === 'CUSTOMER') {
        items = items.filter((i: any) => i.isCustomer);
      } else if (type === 'VENDOR') {
        items = items.filter((i: any) => i.isSupplier);
      }
      setEntities(items);
    } catch (error) {
      console.error('Failed to fetch entities', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEntities();
  }, [type]);

  const selectedEntity = entities.find((e) => String(e.id) === value);

  const handleCreateSuccess = (newEntity: any) => {
    // Refresh the list and select the new one
    fetchEntities();
    onChange(String(newEntity.id), newEntity);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between glass hover:bg-accent/50 transition-all duration-300 h-11"
        >
          <div className="flex items-center gap-2 truncate text-muted-foreground">
            <User size={16} className="shrink-0" />
            {selectedEntity ? (
              <span className="text-foreground font-medium">{selectedEntity.legalname}</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 w-[400px] glass shadow-2xl border-none" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b border-border/50 px-3 h-12">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input 
              placeholder="Search contacts..." 
              className="flex h-9 w-full rounded-md bg-transparent border-none focus-visible:ring-0 px-0 py-3 text-sm"
              autoFocus
              onChange={(e) => fetchEntities(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <ScrollArea className="max-h-[300px] overflow-y-auto">
            <div className="p-1">
              {loading && entities.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
              ) : entities.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-4">
                  <p>No contact found.</p>
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
                    <PlusCircle size={16} /> Create New Contact
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
                    className="flex items-center gap-3 px-3 py-3 cursor-pointer text-primary font-bold hover:bg-primary/5 focus:bg-primary/5 outline-none rounded-md"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <PlusCircle size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span>Add New Contact</span>
                      <span className="text-xs text-muted-foreground font-normal">Quickly create a {type === 'CUSTOMER' ? 'customer' : 'vendor'}</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-border/30 my-1" />
                  
                  {entities.map((entity) => (
                    <DropdownMenuItem
                      key={entity.id}
                      onSelect={() => {
                        onChange(String(entity.id), entity);
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/50 focus:bg-accent/50 outline-none rounded-md transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full vibrancy-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {entity.legalname.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 truncate">
                        <span className="font-medium text-sm">{entity.legalname}</span>
                        <span className="text-xs text-muted-foreground truncate">{entity.email || "No email"}</span>
                      </div>
                      {value === String(entity.id) && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>

      <ContactModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleCreateSuccess}
        type={type === 'VENDOR' ? 'VENDOR' : 'CUSTOMER'}
      />
    </DropdownMenu>
  );
}
