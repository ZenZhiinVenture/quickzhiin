'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '@/components/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/select';
import {
  Loader2,
  UserPlus,
  Check,
  Building2,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  MapPin,
  Globe,
  Edit
} from 'lucide-react';
import { useToast } from '@/components/usetoast';
import { contactsAPI } from '@/services/api/contact';
import { useTranslations } from 'next-intl';

interface ContactFormValues {
  id: number;
  legalname: string;
  email: string;
  phone: string;
  regNo: string;
  regNoType: string;
  taxNo: string;
  sstNo: string;
  msicCode: string;
  isCustomer: boolean;
  isSupplier: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  isActive: boolean;
}

const contactFormSchema = (t: any) => z.object({
  // Basic Info
  id: z.number(),
  legalname: z.string().min(2, t('fields.legalnameError')),
  email: z.string().email(t('fields.emailError')),
  phone: z.string().min(5, t('fields.phoneError')),
  regNo: z.string().min(1, t('fields.regNoError')),
  regNoType: z.string().min(1, t('fields.regNoTypeError')),

  // Tax / LHDN
  taxNo: z.string().min(1, t('fields.taxNoError')),
  sstNo: z.string(),
  msicCode: z.string(),
  isCustomer: z.boolean(),
  isSupplier: z.boolean(),

  // Address
  addressLine1: z.string().min(1, t('fields.addressError')),
  addressLine2: z.string(),
  city: z.string().min(1, t('fields.cityError')),
  state: z.string().min(1, t('fields.stateError')),
  postalCode: z.string().min(5, t('fields.postalCodeError')),
  countryCode: z.string(),
  isActive: z.boolean(),
});


interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: any) => void;
  type?: 'CUSTOMER' | 'VENDOR';
  initialData?: any;
}

const MALAYSIAN_STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
  "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
  "Sarawak", "Selangor", "Terengganu", "W.P. Kuala Lumpur",
  "W.P. Labuan", "W.P. Putrajaya"
];

export function ContactModal({ isOpen, onClose, onSuccess, type = 'CUSTOMER', initialData }: ContactModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('basic');
  const { toast } = useToast();
  const t = useTranslations('ContactModal');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema(t)),
    defaultValues: {
      id: 0,
      legalname: "",
      email: "",
      phone: "",
      regNo: "",
      regNoType: "BRN",
      taxNo: "",
      sstNo: "",
      msicCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "MY",
      isCustomer: type === 'CUSTOMER',
      isSupplier: type === 'VENDOR',
      isActive: true,
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = form;

  // Reset form when initialData changes
  React.useEffect(() => {
    if (isOpen && initialData) {
      // Handle both nested and flat response structures
      const contact = initialData.contact || initialData;
      const address = initialData.contactAddress?.[0] || initialData.address || initialData;
      const person = initialData.contactPerson?.[0] || initialData.person || initialData;

      reset({
        id: Number(contact.id),
        legalname: contact.legalname || "",
        email: person.email || contact.email || "",
        phone: person.phone || contact.phone || "",
        regNo: contact.regNo || "",
        regNoType: contact.regNoType || "BRN",
        taxNo: contact.taxNo || "",
        sstNo: contact.sstNo || "",
        msicCode: contact.msicCode || "",
        isCustomer: !!contact.isCustomer,
        isSupplier: !!contact.isSupplier,
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        city: address.city || "",
        state: MALAYSIAN_STATES.find(s => s.toLowerCase() === (address.state || "").toLowerCase().trim()) || address.state || "",
        postalCode: address.postalCode || "",
        countryCode: address.countryCode || "MY",
        isActive: contact.isActive !== undefined ? contact.isActive : true,
      });
    } else if (isOpen && !initialData) {
      reset({
        id: 0,
        legalname: "",
        email: "",
        phone: "",
        regNo: "",
        regNoType: "BRN",
        taxNo: "",
        sstNo: "",
        msicCode: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        countryCode: "MY",
        isCustomer: type === 'CUSTOMER',
        isSupplier: type === 'VENDOR',
        isActive: true,
      });
    }
  }, [initialData, reset, type, isOpen]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setLoading(true);

      const payload = {
        contact: {
          id: data.id,
          legalname: data.legalname,
          contactType: data.isSupplier ? 'SUPPLIER' : 'CUSTOMER',
          regNo: data.regNo,
          regNoType: data.regNoType,
          taxNo: data.taxNo,
          sstNo: data.sstNo || "",
          msicCode: data.msicCode || "",
          isCustomer: data.isCustomer,
          isSupplier: data.isSupplier,
          defaultCountryId: 1, // Default to Malaysia
          isActive: initialData ? (initialData.contact?.isActive ?? initialData.isActive ?? true) : true
        },
        contactAddress: [
          {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || "",
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            countryCode: data.countryCode,
            purpose: 'BILLING',
            isPrimary: true
          }
        ],
        contactPerson: [
          {
            name: data.legalname,
            email: data.email,
            phone: data.phone,
            isPrimary: true,
            position: 'Director'
          }
        ]
      };

      let response;
      if (initialData?.id) {
        response = await contactsAPI.update(initialData.id, payload);
        toast({
          title: t('messages.successTitle') || "Success",
          description: t('messages.updateSuccess', { name: data.legalname }) || "Contact updated successfully.",
        });
      } else {
        response = await contactsAPI.create(payload);
        toast({
          title: t('messages.successTitle'),
          description: initialData
            ? t('messages.updateSuccess', { name: data.legalname })
            : t('messages.successDescription', { name: data.legalname }),
        });
      }

      const result = response.data.data.contact || response.data.data;
      onSuccess(result);
      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t('messages.errorTitle'),
        description: error.response?.data?.message || t('messages.errorDefault'),
      });
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = t(`types.${type.toLowerCase()}`);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] glass border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-6 vibrancy-gradient text-white">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {initialData ? <Edit size={28} /> : <UserPlus size={28} />}
            {initialData ? t('editTitle') : t('title', { type: typeLabel })}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-0">
          {Object.keys(errors).length > 0 && (
            <div className="px-8 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <ShieldCheck className="text-red-500 h-4 w-4" />
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                {t('messages.validationErrorSummary') || "Please check all tabs for required fields."}
              </p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-8 h-12">
              <TabsTrigger value="basic" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none h-full">{t('sections.basic')}</TabsTrigger>
              <TabsTrigger value="tax" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none h-full">{t('sections.tax')}</TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none h-full">{t('sections.address')}</TabsTrigger>
            </TabsList>

            <div className="p-8 max-h-[500px] overflow-y-auto">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="legalname" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Building2 size={14} /> {t('fields.legalname')}
                  </Label>
                  <Input id="legalname" className="glass h-12" {...register('legalname')} />
                  {errors.legalname && <p className="text-xs text-red-500">{errors.legalname.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Mail size={14} /> {t('fields.email')}
                    </Label>
                    <Input id="email" type="email" className="glass h-12" {...register('email')} />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Phone size={14} /> {t('fields.phone')}
                    </Label>
                    <Input id="phone" className="glass h-12" {...register('phone')} />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4 space-y-2">
                    <Label htmlFor="regNoType" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ShieldCheck size={14} /> {t('fields.regNoType')}
                    </Label>
                    <Controller
                      name="regNoType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="glass h-12">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="glass">
                            <SelectItem value="NONE">{t('registrationTypes.none')}</SelectItem>
                            <SelectItem value="BRN">{t('registrationTypes.brn')}</SelectItem>
                            <SelectItem value="IC">{t('registrationTypes.ic')}</SelectItem>
                            <SelectItem value="PASSPORT">{t('registrationTypes.passport')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="col-span-8 space-y-2">
                    <Label htmlFor="regNo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText size={14} /> {t('fields.regNo')}
                    </Label>
                    <Input id="regNo" placeholder={t('fields.regNoPlaceholder')} className="glass h-12" {...register('regNo')} />
                    {errors.regNo && <p className="text-xs text-red-500">{errors.regNo.message}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-8 pt-2">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isCustomer"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isCustomer"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-white/20 data-[state=checked]:bg-primary"
                        />
                      )}
                    />
                    <Label htmlFor="isCustomer" className="text-sm font-medium cursor-pointer">
                      {t('fields.isCustomer')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isSupplier"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isSupplier"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-white/20 data-[state=checked]:bg-primary"
                        />
                      )}
                    />
                    <Label htmlFor="isSupplier" className="text-sm font-medium cursor-pointer">
                      {t('fields.isSupplier')}
                    </Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tax" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="taxNo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldCheck size={14} /> {t('fields.taxNo')}
                  </Label>
                  <Input id="taxNo" placeholder={t('fields.taxNoPlaceholder')} className="glass h-12" {...register('taxNo')} />
                  {errors.taxNo && <p className="text-xs text-red-500">{errors.taxNo.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sstNo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText size={14} /> {t('fields.sstNo')}
                    </Label>
                    <Input id="sstNo" placeholder={t('fields.sstNoPlaceholder')} className="glass h-12" {...register('sstNo')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="msicCode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText size={14} /> {t('fields.msicCode')}
                    </Label>
                    <Input id="msicCode" placeholder={t('fields.msicCodePlaceholder')} className="glass h-12" {...register('msicCode')} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MapPin size={14} /> {t('fields.addressLine1')}
                  </Label>
                  <Input id="addressLine1" placeholder={t('fields.addressLine1Placeholder')} className="glass h-12 placeholder:text-muted-foreground/40" {...register('addressLine1')} />
                  {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MapPin size={14} /> {t('fields.addressLine2')}
                  </Label>
                  <Input id="addressLine2" placeholder={t('fields.addressLine2Placeholder')} className="glass h-12" {...register('addressLine2')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('fields.city')}</Label>
                    <Input id="city" placeholder={t('fields.cityPlaceholder')} className="glass h-12" {...register('city')} />
                    {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('fields.state')}</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="glass h-12">
                            <SelectValue placeholder={t('fields.statePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent className="glass">
                            {MALAYSIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('fields.postalCode')}</Label>
                    <Input id="postalCode" placeholder={t('fields.postalCodePlaceholder')} className="glass h-12" {...register('postalCode')} />
                    {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryCode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Globe size={14} /> {t('fields.country')}
                    </Label>
                    <Input id="countryCode" defaultValue="Malaysia" disabled className="glass h-12 opacity-50 cursor-not-allowed" />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-8 pt-4 bg-muted/20">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="px-6">{t('buttons.cancel')}</Button>
            <Button type="submit" disabled={loading} className="vibrant-gradient text-white shadow-xl shadow-primary/20 px-10">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {initialData ? t('buttons.updating') : t('buttons.creating')}</> : <><Check className="mr-2 h-4 w-4" /> {initialData ? t('buttons.update') : t('buttons.create')}</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
