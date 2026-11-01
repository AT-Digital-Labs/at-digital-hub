import { describe, expect, it } from "vitest";

import { getMetadataBase, isIndexable } from "./indexing";

describe("indexing policy", () => {
  it("indexes only the Vercel production deployment that has a configured site URL", () => {
    expect(isIndexable({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://example.com" })).toBe(true);
  });

  it.each(["preview", "development"])("never indexes a %s deployment", (VERCEL_ENV) => {
    expect(isIndexable({ VERCEL_ENV, NEXT_PUBLIC_SITE_URL: "https://example.com" })).toBe(false);
  });

  it("does not index local or unconfigured builds", () => {
    expect(isIndexable({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://example.com" })).toBe(false);
    expect(isIndexable({ NODE_ENV: "development" })).toBe(false);
  });

  it("supports explicit opt-in for self-hosted production", () => {
    expect(
      isIndexable({ NODE_ENV: "production", ALLOW_INDEXING: "true", NEXT_PUBLIC_SITE_URL: "https://example.com" }),
    ).toBe(true);
  });

  it("fails the production build when the site URL is missing or invalid", () => {
    expect(() => getMetadataBase({ VERCEL_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(() => getMetadataBase({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toThrow();
  });

  it("uses the configured origin (path stripped) for canonical URLs", () => {
    expect(getMetadataBase({ NEXT_PUBLIC_SITE_URL: "https://example.com/some/path/" }).toString()).toBe("https://example.com/");
  });

  it("falls back to the preview deployment URL, then localhost, outside production", () => {
    expect(getMetadataBase({ VERCEL_ENV: "preview", VERCEL_URL: "app-git-x.vercel.app" }).origin).toBe("https://app-git-x.vercel.app");
    expect(getMetadataBase({}).origin).toBe("http://localhost:3000");
  });
});
