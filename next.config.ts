import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Linting runs separately in CI (.github/workflows/ci.yml) — don't let
    // a lint config/version mismatch block a production deploy here.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; img-src 'self' data: https://*.supabase.co; script-src 'self' 'unsafe-inline' ${
              process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : ""
            } https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
