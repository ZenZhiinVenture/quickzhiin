'use client';

import React from 'react';
import {
  Search,
  Bell,
  User as UserIcon,
  Moon,
  Sun,
  Languages
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/button';
import { useTheme } from 'next-themes';
import LanguageSwitcher from '@/components/languageSwitcher';
import { useTranslations } from 'next-intl';

export default function Topbar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const t = useTranslations('Topbar');

  return (
    <header className="glass sticky top-0 z-30 w-full h-16 border-b border-border flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:flex relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder={t('search')}
          className="w-full bg-muted border border-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/50 rounded-full"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/50 rounded-full relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="w-10 h-10 rounded-full vibrant-gradient flex items-center justify-center border-2 border-white/20 shadow-lg">
            <UserIcon size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
