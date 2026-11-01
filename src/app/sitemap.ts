import type { MetadataRoute } from "next";

import { getMetadataBase, isIndexable } from "@/lib/indexing";

export default function sitemap(): MetadataRoute.Sitemap {
  // Non-production deployments publish an empty sitemap so previews are never advertised.
  if (!isIndexable()) return [];

  return [{ url: getMetadataBase().toString(), changeFrequency: "monthly", priority: 1 }];
}
