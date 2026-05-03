const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
