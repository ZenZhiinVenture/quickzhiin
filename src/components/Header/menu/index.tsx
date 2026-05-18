'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import publicMenu from '@/config/publicMenu';
import { useState } from 'react';

export default function Menu({ locale }: { locale: string }) {
  const t = useTranslations('PublicNavigation');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  let hoverTimeout: NodeJS.Timeout;

  const handleMouseEnter = (name: string) => {
    clearTimeout(hoverTimeout); // Clear any existing timeout
    setActiveDropdown(name); // Show the dropdown
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setActiveDropdown(null); // Hide the dropdown after a delay
    }, 200); // Adjust delay (in milliseconds) as needed
  };

  const resolveHref = (href: string) => {
    if (href.startsWith('/')) {
      return href; // Absolute path, return as is
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    return `${baseUrl}/${href}`; // Relative path, prepend current path
  };

  return (
    <div className="flex items-center gap-x-8 rounded-md p-2">
      <nav className="flex items-center gap-x-8 rounded-md p-2">
        {publicMenu(locale).map(item => {
          if (item.children) {
            return (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`inline-flex items-center px-1 pt-1 text-sm font-medium`}>
                  {t(item.name)}
                </button>
                {activeDropdown === item.name && (
                  <div className="absolute shadow-lg border rounded-md p-2 bg-gray-500">
                    {item.children.map(child => (
                      <Link
                        key={child.name}
                        href={resolveHref(child.href)}
                        className="block rounded-md px-4 py-2 text-sm"
                      >
                        {t(child.name)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium`}
            >
              {t(item.name)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
