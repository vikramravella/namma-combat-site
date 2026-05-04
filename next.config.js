const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tell Next.js NOT to bundle Prisma — load it from node_modules at runtime
  // where the rhel-openssl-3.0.x engine binary is generated during postinstall.
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '.prisma/client'],
    // Disable Next.js's default 30s client-side router cache so every
    // soft navigation refetches dynamic data. Vinod expects instant
    // updates after creating/editing — extra network is acceptable for
    // a small admin tool.
    staleTimes: { dynamic: 0, static: 180 },
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
