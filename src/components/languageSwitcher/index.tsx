'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, localeNames } from '@/i18n/i18n';
import { GlobeIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/dropdown';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    // Construct the new path with the new locale
    const newPath = `/${newLocale}${pathnameWithoutLocale || '/'}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="ml-auto bg-white dark:bg-transparent rounded-full border-border shadow-sm">
            <GlobeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((locale) => (
            <DropdownMenuCheckboxItem
              key={locale}
              checked={currentLocale === locale}
              onCheckedChange={() => handleLocaleChange(locale)}
            >
              {localeNames[locale]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
