import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Backend (NestJS) URL. Browser calls go to /backend/* on the frontend's own domain and
// Next.js proxies them here, so there is no CORS and the auth cookie lands on the frontend domain.
const BACKEND_URL =
  process.env.BACKEND_URL ||
  (isProduction
    ? "https://jnscrmbackend.vercel.app"
    : "http://localhost:4000");

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jnscrmbackend.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jnsedu.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.jnsedu.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      // Country/office shortcuts -> existing office pages.
      { source: "/qatar", destination: "/offices/doha-qatar", permanent: false },
      { source: "/kuwait", destination: "/offices/salmiya-kuwait", permanent: false },
      { source: "/bahrain", destination: "/offices/manama-bahrain", permanent: false },
      { source: "/riyadh", destination: "/offices/riyadh-saudia", permanent: false },
      { source: "/uae", destination: "/offices/dubai-uae", permanent: false },
      { source: "/pakistan", destination: "/offices/lahore-pakistan", permanent: false },
      // Legacy/misspelled Faisalabad URL -> existing office page.
      { source: "/faisalabad-pakistan", destination: "/offices/faislabad-pakistan", permanent: true },
      // Support shortcut.
      { source: "/support", destination: "/jns-support", permanent: false },
    ];
  },
  async headers() {
    const headers = [
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "off",
      },
      {
        key: "X-Permitted-Cross-Domain-Policies",
        value: "none",
      },
    ];

    if (isProduction) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/:path*",
        headers,
      },
      {
        // Authenticated dashboards must never be cached or indexed.
        source: "/protection/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
