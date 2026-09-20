// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable Turbopack for production builds to avoid PostCSS worker crash (Next.js 16 + tailwind v4 bug)
  bundlePagesRouterDependencies: false,
};

export default withNextIntl(nextConfig);
