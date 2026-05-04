const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tell Next.js NOT to bundle Prisma — load it from node_modules at runtime
  // where the rhel-openssl-3.0.x engine binary is generated during postinstall.
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '.prisma/client'],
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: 'namma-combat-j4',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  // tunnelRoute removed — middleware blocked it on the admin host. Direct sends
  // to sentry.io work fine for our internal admin tool.
  webpack: {
    reactComponentAnnotation: { enabled: true },
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },
  },
});
