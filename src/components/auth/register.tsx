'use client';
import { z } from 'zod';
import axios from '@/utils/axios';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FingerprintIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslations } from 'next-intl';
import logger from '@/utils/logger';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/dropdown';
// import { Icons } from '@/components/icons';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToast } from '@/components/usetoast';
import { countries } from '@/config/countries';



export default function RegisterComponent() {
  const router = useRouter();
  const { toast } = useToast();

  //Local states
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [searchPhone, setSearchPhone] = React.useState('');
  const [searchCountry, setSearchCountry] = React.useState('');

  const filteredCountriesForPhone = React.useMemo(() =>
    countries.filter(c =>
      c.name.toLowerCase().includes(searchPhone.toLowerCase()) ||
      c.phoneCode.includes(searchPhone)
    ).slice(0, 100) // Performance optimization for large list
    , [searchPhone]);

  const filteredCountriesForCountry = React.useMemo(() =>
    countries.filter(c =>
      c.name.toLowerCase().includes(searchCountry.toLowerCase())
    ).slice(0, 100)
    , [searchCountry]);

  const formSchema = z
    .object({
      firstName: z.string().min(3).max(50),
      lastName: z.string().min(3).max(50),
      username: z.string().min(3).max(50),
      email: z.string().email(),
      phone: z.string().min(10).max(15),
      country: z.string().min(2).max(50),
      password: z.string().min(8).max(50),
      confirmPassword: z.string().min(8).max(50),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });

  type BillboardFormValues = z.infer<typeof formSchema>;

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      country: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: BillboardFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/auth/register', data);
      toast({
        title: 'Success',
        description: 'User created successfully, please login.',
      });
      if (response.status === 200) {
        router.push('/');
      }
    } catch (error: unknown) {
      logger.error('Registration failed', { error });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Server is busy. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // loginWithGoogle was removed since it's unused and commented out

  //Localizations
  const t = useTranslations('RegisterComponent');

  return (
    <Card className="shadow-lg ">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t('cardTitle')}</CardTitle>
        <CardDescription>{t('cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 overflow-auto">
        {/* <div className="grid grid-cols-2 gap-6">
          <Button variant="outline">
            <Icons.discord className="mr-2 h-4 w-4" />
            Discord
          </Button>
          <Button variant="outline" onClick={loginWithGoogle} disabled={isLoading}>
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div> */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Phone</FormLabel>
                    <div className="flex items-center gap-x-4">
                      {/* Country Code Searchable Combobox */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-[180px] justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={isLoading}
                            >
                              {field.value
                                ? countries.find(
                                  country => field.value.startsWith(country.phoneCode)
                                ) ? (
                                  (() => {
                                    const c = countries.find(c => field.value.startsWith(c.phoneCode));
                                    return `${c?.name} (+${c?.phoneCode})`;
                                  })()
                                ) : 'Select Code'
                                : 'Select Code'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[300px] p-0 shadow-lg bg-white dark:bg-black !opacity-100">
                          <div className="flex items-center border-b px-3 py-2 sticky top-0 bg-inherit z-10">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                              className="flex h-9 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                              placeholder="Search country code..."
                              value={searchPhone}
                              onChange={(e) => setSearchPhone(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {filteredCountriesForPhone.map(country => (
                              <DropdownMenuItem
                                key={country.code}
                                onSelect={() => {
                                  form.setValue('phone', country.phoneCode, { shouldValidate: true });
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    country.phoneCode === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {country.flag} | {country.name} (+{country.phoneCode})
                              </DropdownMenuItem>
                            ))}
                            {filteredCountriesForPhone.length === 0 && (
                              <div className="px-3 py-6 text-center text-sm">No country found.</div>
                            )}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Phone Number Input */}
                      <FormControl className="flex-1">
                        <Input
                          disabled={isLoading}
                          placeholder="812345678"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Choose your country</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            {field.value
                              ? countries.find(country => country.code === field.value)?.name
                              : 'Select your Country'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full min-w-[300px] p-0 shadow-lg bg-white dark:bg-black !opacity-100" align="start">
                        <div className="flex items-center border-b px-3 py-2 sticky top-0 bg-inherit z-10">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-9 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Search country..."
                            value={searchCountry}
                            onChange={(e) => setSearchCountry(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {filteredCountriesForCountry.map(country => (
                            <DropdownMenuItem
                              key={country.code}
                              onSelect={() => {
                                form.setValue('country', country.code, { shouldValidate: true });
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  country.code === field.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {country.flag} : {country.name}
                            </DropdownMenuItem>
                          ))}
                          {filteredCountriesForCountry.length === 0 && (
                            <div className="px-3 py-6 text-center text-sm">No country found.</div>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center w-full ">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full relative">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input
                            className="w-full pr-12"
                            disabled={isLoading}
                            placeholder="Password"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <span className="absolute right-3 cursor-pointer mt-1" onClick={() => setShowPassword(!showPassword)}>
                            <FingerprintIcon size={20} className="text-gray-400" />
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center w-full ">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="w-full relative">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input
                            className="w-full pr-12"
                            disabled={isLoading}
                            placeholder="Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <span className="absolute right-3 cursor-pointer mt-1" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <FingerprintIcon size={20} className="text-gray-400" />
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-2 py-5">
              <Button
                type="submit"
                variant={'outline'}
                disabled={isLoading}
              >
                Start your journey
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-5">
        <div className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href={'/login'} className="text-blue-500">
            sign-in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
