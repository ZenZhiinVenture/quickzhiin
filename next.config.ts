// next.config.js
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
});
