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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
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
        value: "camera=(), microphone=(), geolocation=()",
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
    ];
  },
};

export default nextConfig;
