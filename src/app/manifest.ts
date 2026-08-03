import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PetLink — A tag that talks back",
    short_name: "PetLink",
    description: "Secure digital ID tags for pets. Scan to reach the owner instantly.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F6F3EC",
    theme_color: "#132A3E",
    // Icons intentionally omitted until real icon assets are added to /public —
    // referencing nonexistent files here causes a (harmless) 404 in the console.
  };
}
