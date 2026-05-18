'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';

interface FooterProps {
  className?: string;
}

function Footer({ className }: FooterProps) {
  const t = useTranslations('footer');
  const [currentYear, setCurrentYear] = useState('');
  const [mounted, setMounted] = useState(false);
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn("bg-card border-t border-border py-8", className)}
    >
      <div className="container mx-auto px-4">
        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 - {currentYear} QuickZhiin. {t('allRightsReserved')}
          </p>
          <p className="text-xs text-muted-foreground mt-2 md:mt-0 opacity-70">
            {t('version')} {appVersion}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
