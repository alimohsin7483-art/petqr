import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://petlink.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/api/",
          "/p/", // individual pet pages are functional, not content — kept out of the crawl budget
          "/sign-in",
          "/sign-up",
          "/reset-password",
          "/verify",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
