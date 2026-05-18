'use client';
import { useTheme } from 'next-themes';

export function ThemeDebug() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="fixed bottom-2 right-2 text-xs p-2 border rounded shadow">
      <p>Theme: {theme}</p>
      <p>Resolved: {resolvedTheme}</p>
    </div>
  );
}
