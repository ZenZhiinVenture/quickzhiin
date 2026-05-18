'use client';

import Menu from './menu';
import CompanyProfile from './companyprofile';
import { ThemeToggle } from '@/components/theme/themeToggle';
import { Button } from '@/components/button';
import Link from 'next/link';

export default function Header({ locale }: { locale: string }) {
  return (
    <header className="flex items-center justify-center w-full px-4 mx-auto shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-x-8">
          {/* Left side */}
          <div className="flex items-center justify-between gap-x-4 p-2">
            <CompanyProfile />
          </div>

          {/* Middle Menu */}
          <div className="hidden sm:flex items-center gap-x-6 rounded-md p-2">
            <Menu locale={locale} />
          </div>

          {/* Right side: Theme toggle + Auth buttons */}
          <div className="flex items-center gap-x-4 rounded-md p-2">
            <ThemeToggle />
            <Button variant="default">
              <Link href={`/${locale}/login`}>Login</Link>
            </Button>
            <Button variant="default">
              <Link href={`/${locale}/register`}>Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
