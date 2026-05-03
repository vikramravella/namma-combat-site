const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the Prisma query-engine binary for the Vercel Lambda runtime
  // (rhel-openssl-3.0.x) gets copied into every serverless function bundle.
  // Next.js's static analysis can't see that the engine is loaded dynamically,
  // so we tell the file-tracer explicitly. Without this, every Prisma call
  // throws "could not locate the Query Engine for runtime rhel-openssl-3.0.x".
  outputFileTracingIncludes: {
    '/**/*': ['./src/generated/prisma/**/*'],
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
