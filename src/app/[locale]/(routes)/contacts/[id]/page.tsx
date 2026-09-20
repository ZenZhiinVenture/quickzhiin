'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contactsAPI } from '@/services/api/contact';
import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Badge } from '@/components/badge';
import {
  ArrowLeft,
  Edit,
  Trash,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  FileText,
  Clock,
  User,
  Tag,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/components/usetoast';
import { useTranslations } from 'next-intl';
import { ContactModal } from '@/components/modals/contact-modal';
import { AlertModal } from '@/components/modals/alert-modal';
import { Skeleton } from '@/components/skeleton';

export default function ContactProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Contacts');
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getById(params.id as string);
      // Backend nested structure: { data: { contact: {...}, contactPerson: [...], contactAddress: [...] } }
      setContact(response.data.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to fetch contact details.",
      });
      router.push('/contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchContactDetails();
    }
  }, [params.id]);

  const onDeleteConfirmed = async () => {
    try {
      setIsDeleting(true);
      await contactsAPI.delete(contact.contact.id);
      toast({
        title: t('messages.deleteSuccess') || "Success",
        description: t('messages.deleteSuccessDescription', { name: contact.contact.legalname }) || "Contact deleted successfully.",
      });
      setIsDeleteModalOpen(false);
      router.push('/contacts');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to delete contact.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleToggleActive = async () => {
    try {
      const contactData = contact.contact;
      await contactsAPI.patchStatus(contactData.id, !contactData.isActive);
      
      toast({
        title: t('messages.successTitle') || "Success",
        description: t('messages.updateSuccess', { name: contactData.legalname }) || "Status updated successfully.",
      });
      fetchContactDetails();
    } catch (error: any) {
      console.error('[ContactProfile] Error toggling status:', error);
      toast({
        variant: 'destructive',
        title: t('messages.errorTitle') || "Error",
        description: error.response?.data?.message || "Failed to update status.",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] md:col-span-1" />
          <Skeleton className="h-[400px] md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!contact || !contact.contact) return null;

  // Destructure for easier access
  const {
    contact: contactData,
    contactAddress = [],
    contactPerson = []
  } = contact;

  const primaryAddress = contactAddress.find((a: any) => a.isPrimary) || contactAddress[0];
  const primaryPerson = contactPerson.find((p: any) => p.isPrimary) || contactPerson[0];

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contactData.legalname}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="uppercase text-[10px]">{contactData.contactType}</Badge>
              {contactData.isCustomer && <Badge className="bg-blue-500 text-white border-none text-[10px]">Customer</Badge>}
              {contactData.isSupplier && <Badge className="bg-purple-500 text-white border-none text-[10px]">Supplier</Badge>}
              <Badge className={contactData.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                {contactData.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={handleToggleActive}
          >
            {contactData.isActive ? <X size={18} /> : <Check size={18} />} 
            {contactData.isActive ? 'Set Inactive' : 'Set Active'}
          </Button>
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit size={18} /> Edit
          </Button>
          <Button
            variant="destructive"
            className="flex gap-2"
            onClick={handleDelete}
          >
            <Trash size={18} /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info & Contact Details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-card overflow-hidden border-none shadow-xl">
            <div className="h-2 vibrancy-gradient" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User size={18} className="text-primary" /> Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{primaryPerson?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{primaryPerson?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
                  <Globe size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website</p>
                  <p className="text-sm font-medium">{contactData.website || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Address</p>
                  {primaryAddress ? (
                    <div className="text-sm font-medium">
                      <p>{primaryAddress.addressLine1}</p>
                      {primaryAddress.addressLine2 && <p>{primaryAddress.addressLine2}</p>}
                      <p>{primaryAddress.postalCode} {primaryAddress.city}</p>
                      <p>{primaryAddress.state}, {primaryAddress.countryCode}</p>
                    </div>
                  ) : <p className="text-sm font-medium text-muted-foreground">No address recorded</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock size={18} className="text-primary" /> Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">ID</span>
                <span className="text-sm font-mono">{contactData.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{new Date(contactData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Last Modified</span>
                <span className="text-sm">{new Date(contactData.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax & Business Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card border-none shadow-xl">
            <CardHeader className="bg-accent/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" /> Tax & Business Information
              </CardTitle>
              <CardDescription>Legal and regulatory identifiers for tax compliance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 border-b md:border-b-0 md:border-r border-border/50 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Registration Type</p>
                      <Badge variant="secondary">{contactData.regNoType || 'NONE'}</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Registration Number</p>
                      <p className="text-lg font-bold">{contactData.regNo || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Tax ID (TIN)</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-primary">{contactData.taxNo || 'N/A'}</p>
                        {contactData.taxNo && <Badge className="bg-blue-500/10 text-blue-600 border-none">Verified</Badge>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">SST Number</p>
                      <p className="text-lg font-bold">{contactData.sstNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">MSIC Code</p>
                      <p className="text-sm font-medium">{contactData.msicCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Documents Section Placeholder */}
          <Card className="glass-card border-none shadow-xl">
            <CardHeader className="bg-accent/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Recent Transactions
              </CardTitle>
              <CardDescription>Invoices, quotes, and orders related to this contact</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-accent/30 text-accent-foreground mb-4">
                <Tag size={32} />
              </div>
              <h3 className="text-lg font-bold">No transactions found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">This contact hasn't been linked to any invoices or orders yet.</p>
              <Button variant="outline" className="mt-6" onClick={() => router.push('/sales')}>
                Create First Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          fetchContactDetails();
          setIsEditModalOpen(false);
        }}
        initialData={contact}
      />

      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDeleteConfirmed}
        loading={isDeleting}
        title={t('delete.title') || "Delete Contact"}
        description={t('delete.description', { name: contactData.legalname }) || `Are you sure you want to delete ${contactData.legalname}? This action cannot be undone.`}
        confirmText={t('delete.confirm') || "Delete"}
        cancelText={t('delete.cancel') || "Cancel"}
      />
    </div>
  );
}
