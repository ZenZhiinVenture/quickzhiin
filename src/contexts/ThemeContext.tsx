'use client';

import { ThemeProvider } from 'next-themes';

type ThemeContextProviderProps = {
  children: React.ReactNode;
};

export default function ThemeContextProvider({ children }: ThemeContextProviderProps) {
  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
