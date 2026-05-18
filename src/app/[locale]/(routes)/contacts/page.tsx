'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/datatable';
import { ColumnDef } from '@tanstack/react-table';
import { contactsAPI } from '@/services/api/contact';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Button } from '@/components/button';
import { Plus, UserPlus, Mail, Phone, MoreHorizontal, Edit, Trash, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
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
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ContactModal } from '@/components/modals/contact-modal';
import { AlertModal } from '@/components/modals/alert-modal';

interface Contact {
  id: string;
  legalname: string;
  contactType: string;
  regNo: string;
  taxNo: string;
  isCustomer: boolean;
  isSupplier: boolean;
  isActive: boolean;
  email?: string;
  phone?: string;
}

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<{ id: string; name: string } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const params = useParams();
  const locale = params.locale;
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('Contacts');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll();
      setData(response.data.data.items || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('messages.fetchErrorTitle'),
        description: t('messages.fetchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHasMounted(true);
    fetchContacts();
  }, []);

  const handleEdit = async (contact: Contact) => {
    try {
      const response = await contactsAPI.getById(contact.id);
      // Correct extraction: backend might nest the contact details under a 'contact' property
      const contactData = response.data.data.contact || response.data.data;
      setSelectedContact(contactData);
      setIsModalOpen(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('messages.errorTitle') || "Error",
        description: t('messages.fetchError') || "Failed to fetch contact details.",
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    setContactToDelete({ id, name });
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      setIsDeleting(true);
      await contactsAPI.delete(contactToDelete.id);
      toast({
        title: t('messages.successTitle') || "Success",
        description: t('messages.deleteSuccess'),
      });
      fetchContacts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('messages.errorTitle') || "Error",
        description: error.response?.data?.message || t('messages.deleteError'),
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const handleToggleActive = async (contact: Contact) => {
    try {
      // Use the new targeted PATCH endpoint for status toggling
      // Fallback to false if isActive is undefined (assuming currently active)
      const newStatus = contact.isActive === undefined ? false : !contact.isActive;
      await contactsAPI.patchStatus(contact.id, newStatus);
      
      toast({
        title: t('messages.successTitle') || "Success",
        description: t('messages.updateSuccess', { name: contact.legalname }) || "Status updated successfully.",
      });
      fetchContacts();
    } catch (error: any) {
      console.error('[ContactsPage] Error toggling status:', error);
      toast({
        variant: 'destructive',
        title: t('messages.errorTitle') || "Error",
        description: error.response?.data?.message || t('messages.errorDefault') || "Failed to update status.",
      });
    }
  };

  const handleViewProfile = (id: string) => {
    router.push(`/${locale}/contacts/${id}`);
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'legalname',
      header: t('table.name'),
      cell: ({ row }) => <span className="font-bold">{row.getValue('legalname')}</span>,
    },
    {
      accessorKey: 'contactType',
      header: t('table.type'),
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase text-[10px]">
          {row.getValue('contactType')}
        </Badge>
      ),
    },
    {
      id: 'roles',
      header: t('table.roles'),
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.isCustomer && (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20">{t('roles.customer')}</Badge>
          )}
          {row.original.isSupplier && (
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20">{t('roles.supplier')}</Badge>
          )}
          {!row.original.isCustomer && !row.original.isSupplier && (
            <span className="text-xs text-muted-foreground italic">None</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'regNo',
      header: t('table.regNo'),
      cell: ({ row }) => <span>{row.getValue('regNo') || 'N/A'}</span>,
    },
    {
      accessorKey: 'taxNo',
      header: t('table.taxId'),
      cell: ({ row }) => <span>{row.getValue('taxNo') || 'N/A'}</span>,
    },
    {
      accessorKey: 'isActive',
      header: t('table.status'),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        // Fallback: If isActive is undefined (backend list misses it) or null, treat as true
        const status = isActive === false ? false : true;
        return (
          <Badge className={status ? 'bg-green-500' : 'bg-gray-400'}>
            {status ? t('status.active') : t('status.inactive')}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleViewProfile(contact.id)}
              >
                <ExternalLink size={14} /> {t('actions.viewProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleEdit(contact)}
              >
                <Edit size={14} /> {t('actions.editContact')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleToggleActive(contact)}
              >
                <ShieldCheck size={14} /> {t('actions.toggleStatus')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 flex items-center gap-2 cursor-pointer"
                onClick={() => handleDelete(contact.id, contact.legalname)}
              >
                <Trash size={14} /> {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (!hasMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl vibrant-gradient text-white shadow-lg shadow-primary/20">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedContact(null);
            setIsModalOpen(true);
          }}
          className="vibrant-gradient text-white flex gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300"
        >
          <Plus size={18} /> {t('addContact')}
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-border/50 bg-accent/5">
          <CardTitle className="text-xl">{t('directoryTitle')}</CardTitle>
          <CardDescription>{t('directoryDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data} search="legalname" />
        </CardContent>
      </Card>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContact(null);
        }}
        onSuccess={() => {
          fetchContacts();
          setIsModalOpen(false);
          setSelectedContact(null);
        }}
        initialData={selectedContact}
        type="CUSTOMER"
      />

      <AlertModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title={t('messages.deleteConfirmTitle')}
        description={t('messages.deleteConfirmDescription', { name: contactToDelete?.name || '' })}
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
      />
    </div>
  );
}
