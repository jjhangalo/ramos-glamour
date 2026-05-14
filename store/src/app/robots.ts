import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/produtos"],
      disallow: ["/cart", "/checkout", "/conta", "/api"],
    },
    sitemap: "https://ramosglamour.com/sitemap.xml",
  };
}
