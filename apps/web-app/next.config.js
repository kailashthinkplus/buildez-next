// /Users/kailash/buildez/apps/web-app/next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for BuildEZ internal packages
  transpilePackages: [
    "@buildez/auth",
    "@buildez/db",
    "@buildez/billing-core",
  ],

  // 🚨 CRITICAL: Disable Next 15 experimental compiler (fixes './...' CSS bug)
  experimental: {
    turbo: false,
  },

  // Disable webpack cache (safe, keeps your earlier intent)
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
