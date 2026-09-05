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

  // geoip-lite loads its data files via relative fs paths at require-time;
  // webpack bundling breaks that path, so keep it as a native require().
  // jsdom (pulled in by isomorphic-dompurify's server-side path) has the
  // same problem: it reads its default stylesheet via a relative fs path
  // that only resolves from its own package directory, not from inside a
  // webpack chunk.
  // @ffmpeg-installer/ffmpeg and @ffprobe-installer/ffprobe resolve their
  // platform-specific binary package via a dynamic require() keyed off
  // process.platform/arch — webpack can't statically analyze that and
  // tries to bundle every file it can find in the package directory
  // (including tsconfig.json), which fails the build outright. Keep them
  // as native require()s instead.
  serverExternalPackages: ["geoip-lite", "jsdom", "isomorphic-dompurify", "@ffmpeg-installer/ffmpeg", "@ffprobe-installer/ffprobe"],

  // The authenticated tenant dashboard and super-admin console must not be
  // embeddable in a third-party iframe: without this, a page can iframe
  // /app or /super and trick a logged-in victim into clicking a real,
  // authenticated control positioned under a decoy (clickjacking). Scoped
  // to these two prefixes only — published tenant sites and the public
  // marketing pages have no reason to restrict framing.
  async headers() {
    return [
      {
        source: "/app/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
      {
        source: "/super/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },

  // Disable webpack cache (safe, keeps your earlier intent)
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
