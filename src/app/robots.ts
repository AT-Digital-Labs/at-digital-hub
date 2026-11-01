import type { MetadataRoute } from "next";

import { getMetadataBase, isIndexable } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  // Previews, staging and local builds disallow everything. Only production with a configured URL is crawlable.
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", getMetadataBase()).toString(),
  };
}
