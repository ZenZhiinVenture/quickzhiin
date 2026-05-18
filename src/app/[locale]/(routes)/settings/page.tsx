'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/card';
import { Users, Shield, Settings as SettingsIcon, Bell, Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/utils/cn';

const settingsCategories = [
  {
    title: 'User Management',
    description: 'Manage users, roles and permissions',
    icon: Users,
    href: '/settings/users',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    adminOnly: true
  },
  {
    title: 'Security',
    description: 'Configure password policies and session settings',
    icon: Lock,
    href: '/settings/security',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    adminOnly: true
  },
  {
    title: 'Notifications',
    description: 'Configure system notification preferences',
    icon: Bell,
    href: '/settings/notifications',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    adminOnly: false
  },
  {
    title: 'System Settings',
    description: 'General system configuration and defaults',
    icon: SettingsIcon,
    href: '/settings/system',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    adminOnly: true
  }
];

export default function SettingsPage() {
  const { locale } = useParams();

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your workspace and manage team members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Link 
            key={category.href} 
            href={`/${locale}${category.href}`}
            className="group block"
          >
            <Card className="h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group-hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110", category.bgColor)}>
                  <category.icon className={cn("w-6 h-6", category.color)} />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
