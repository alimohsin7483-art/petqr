import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://petlink.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/sign-up", "/sign-in", "/shop", "/privacy", "/terms", "/refund-policy"];

  return staticRoutes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
