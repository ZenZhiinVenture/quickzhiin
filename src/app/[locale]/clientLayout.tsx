'use client';

import { useHydrationSafe } from '@/utils/hooks/useHydrationSafe';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import ThemeContextProvider from '@/contexts/ThemeContext';

export default function ClientLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { mounted } = useHydrationSafe();

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeContextProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">{children}</div>
        </AuthProvider>
      </ThemeContextProvider>
    </ThemeProvider>
  );
}
