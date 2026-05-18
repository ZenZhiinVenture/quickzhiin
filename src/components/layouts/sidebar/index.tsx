'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  Building2,
  Library,
  BookText,
  FileText,
  ShoppingBag,
  ShoppingCart,
  Warehouse,
  ClipboardList,
  Truck,
  History,
  FileSearch
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/button';
import { useTranslations } from 'next-intl';

const menuItems = [
  { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard' },
  { icon: Users, labelKey: 'contacts', href: '/contacts' },
  { icon: ShoppingBag, labelKey: 'sales', href: '/sales' },
  { icon: ShoppingCart, labelKey: 'purchases', href: '/purchases' },
  { icon: Warehouse, labelKey: 'inventory', href: '/inventory' },
  { icon: Library, labelKey: 'chartOfAccounts', href: '/accounting/accounts' },
  { icon: FileText, labelKey: 'reports', href: '/accounting/reports' },
  { icon: CreditCard, labelKey: 'bankReconciliation', href: '/accounting/bank-recon' },
  { icon: Settings, labelKey: 'settings', href: '/settings', adminOnly: true },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('UserMenu');

  const isAdmin = user?.role?.name === 'Admin';

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const locale = pathname.split('/')[1] || 'en';

  return (
    <aside
      className={cn(
        'glass min-h-screen sticky top-0 z-40 transition-all duration-500 ease-in-out flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-border">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              QuickZhiin
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto hover:bg-accent/50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => {
            const href = `/${locale}${item.href}`;
            const isActive = pathname === href;

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 vibrant-gradient'
                    : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <item.icon size={22} className={cn(
                  'transition-transform duration-300',
                  !isActive && 'group-hover:scale-110'
                )} />
                {!isCollapsed && (
                  <span className="font-medium">{t(item.labelKey)}</span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors duration-300 group',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && <span className="font-medium">{tAuth('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
}
