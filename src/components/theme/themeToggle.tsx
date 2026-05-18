'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/button';
import { useHydrationSafe } from '@/utils/hooks/useHydrationSafe';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const { mounted } = useHydrationSafe();

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      onClick={() => {
        if (isDark) {
          setTheme('light');
        } else {
          setTheme('dark');
        }
      }}
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
}
