import type { MetadataRoute } from "next";

// Keep this demo out of search engines: disallow all crawlers (paired with the
// noindex/nofollow robots meta tag in layout.tsx).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
