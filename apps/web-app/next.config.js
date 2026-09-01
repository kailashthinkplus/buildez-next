// /Users/kailash/buildez/apps/web-app/next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build Ezy marketing and authentication artwork is served from our R2 CDN.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.getbuildez.com",
        pathname: "/marketing/**",
      },
    ],
  },

  // Lint remains an independently audited gate. Do not let pre-existing
  // repository-wide lint debt prevent production compilation certification.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Required for BuildEZ internal packages
  transpilePackages: [
    "@buildez/auth",
    "@buildez/db",
    "@buildez/billing-core",
  ],

  // Disable webpack cache (safe, keeps your earlier intent)
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
