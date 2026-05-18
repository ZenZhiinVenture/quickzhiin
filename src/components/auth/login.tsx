'use client';

import axios from '@/utils/axios';
import React, { useState } from 'react';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Button } from '@/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/card';
import { Input } from '@/components/input';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms';
import { useToast } from '@/components/usetoast';
import { useAuth } from '@/contexts/AuthContext';
import { FingerprintIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog';

import LoadingComponent from '@/components/loading';
import { isAxiosError } from 'axios';
import logger from '@/utils/logger';

export default function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  //State for dialog to be by opened and closed by DialogTrigger
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { login } = useAuth();

  const router = useRouter();

  const formSchema = z.object({
    email: z.string().min(3).max(50),
    password: z.string().min(8).max(50),
  });

  type LoginFormValues = z.infer<typeof formSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/auth/google', {
        email,
      });
      const result = response.data;
    } catch (error) {
      logger.warn('Google login failed', { error });
      toast({
        variant: 'destructive',
        description: 'Something went wrong while logging with your Google account.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDiscord = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/auth/discord', {
        email,
      });
      const result = response.data;
    } catch (error) {
      logger.warn('Discord login failed', { error });
      toast({
        variant: 'destructive',
        description: 'Something went wrong while logging with your Google account.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  //Login with username(email)/password
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        description: 'Login successful.',
      });
      document.cookie = `auth-token=${localStorage.getItem('token')}; path=/; max-age=86400; SameSite=Lax`;
      router.push('/en/dashboard');
    } catch (error) {
      logger.warn('Login submission failed', { error });
      let errorMessage = 'Invalid credentials';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordReset(email: string) {
    try {
      setIsLoading(true);
      await axios.post('/user/passwordReset', {
        email,
      });
      toast({
        title: 'Success',
        description: 'Password reset email has been sent.',
      });
    } catch (error) {
      const message = isAxiosError(error)
        ? error.message
        : 'Something went wrong while resetting the password.';

      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <Card className="shadow-lg my-5 ">
      <CardHeader className="space-y-4 items-center">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* <div className="grid grid-cols-2 gap-6">
          <Button variant="outline" className="gap-x-6" onClick={loginWithDiscord}>
            {isLoading ? (
              <Icons.discord className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.discord className="h-4 w-4 " />
            )}
            Discord
          </Button>
          <Button
            variant="outline"
            className="gap-x-6"
            onClick={loginWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.google className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="h-4 w-4 " />
            )}
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
              <div className="flex items-center w-full gap-x-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          disabled={isLoading}
                          placeholder="password"
                          type={show ? 'text' : 'password'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="flex px-4 pt-7 w-16" onClick={() => setShow(!show)}>
                  <FingerprintIcon size={25} className="text-gray-400" />
                </span>
              </div>
            </div>
            <div className="grid gap-8 py-8">
              <Button
                disabled={isLoading}
                variant="outline"
                type="submit"
                className="flex gap-2 h-12"
              >
                <span
                  className={isLoading ? ' border rounded-full px-3 py-2 animate-spin' : 'hidden'}
                >
                  <Icons.spinner className="h-4 w-4 text-gray-900 dark:text-white" />
                </span>
                <span className={isLoading ? ' ' : 'hidden'}>Loading ...</span>
                <span className={isLoading ? 'hidden' : ''}>Login</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm p-5">
          Need password reset?{' '}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="text-blue-500">
              <span className="px-2">Click here</span>
            </DialogTrigger>
            <DialogContent className="bg-gray-500">
              <DialogHeader>
                <DialogTitle className="p-5">Password Reset</DialogTitle>
                <DialogDescription className="p-5">
                  Enter your email address and we will send new password to your e-mail.
                </DialogDescription>
              </DialogHeader>
              {isLoading ? (
                <LoadingComponent />
              ) : (
                <div className="flex space-x-5 ">
                  <Input
                    type="email"
                    placeholder="name@domain.com"
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                disabled={email === ''}
                onClick={() => {
                  onPasswordReset(email);
                }}
              >
                Reset
              </Button>
              <DialogTrigger className="w-full">
                <Button variant={'destructive'}>Cancel</Button>
              </DialogTrigger>
            </DialogContent>
          </Dialog>
          {/* Dialog end */}
        </div>
      </CardFooter>
    </Card>
  );
}
