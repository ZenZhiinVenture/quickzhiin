'use client';

import { useState, useEffect, ReactNode } from 'react';

interface UseHydrationSafeOptions {
  fallback?: ReactNode;
}

interface UseHydrationSafeReturn {
  mounted: boolean;
  renderSafely: (content: ReactNode) => ReactNode;
}

/**
 * A hook to safely handle hydration mismatches in Next.js components
 *
 * @param options Configuration options for the hook
 * @returns An object with mounted state and a function to render content safely
 *
 * @example
 * ```tsx
 * const { mounted, renderSafely } = useHydrationSafe({
 *   fallback: <div>Loading...</div>
 * });
 *
 * return renderSafely(
 *   <div>Your component content</div>
 * );
 * ```
 */
export const useHydrationSafe = (
  options: UseHydrationSafeOptions = {}
): UseHydrationSafeReturn => {
  const [mounted, setMounted] = useState(false);
  const { fallback = null } = options;

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderSafely = (content: ReactNode): ReactNode => {
    if (!mounted) {
      return fallback;
    }
    return content;
  };

  return { mounted, renderSafely };
};
