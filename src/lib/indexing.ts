/**
 * Site URL and search-indexing policy.
 *
 * Kept free of path aliases and framework imports so `next.config.ts` can import it.
 * Search engines may index only the intended production deployment: Vercel's
 * `VERCEL_ENV === "production"`, or `ALLOW_INDEXING=true` on a self-hosted production build.
 * Everything else (previews, staging, local) is noindex.
 */

export type Env = Readonly<Record<string, string | undefined>>;

const LOCAL_FALLBACK = "http://localhost:3000";

function parseHttpOrigin(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return new URL(url.origin);
  } catch {
    return undefined;
  }
}

/** The explicitly configured production origin, if valid. */
export function getConfiguredSiteUrl(env: Env = process.env): URL | undefined {
  return parseHttpOrigin(env.NEXT_PUBLIC_SITE_URL);
}

/** True only for the deployment that is meant to be public and indexable. */
export function isProductionDeployment(env: Env = process.env): boolean {
  if (env.VERCEL_ENV) return env.VERCEL_ENV === "production";
  return env.NODE_ENV === "production" && env.ALLOW_INDEXING === "true";
}

/** Indexing needs both a production deployment and an explicit canonical origin. */
export function isIndexable(env: Env = process.env): boolean {
  return isProductionDeployment(env) && getConfiguredSiteUrl(env) !== undefined;
}

/**
 * Base for canonical/Open Graph URLs.
 * A production deployment without NEXT_PUBLIC_SITE_URL fails the build instead of guessing a domain.
 * Previews fall back to their own deployment URL; local development falls back to localhost.
 */
export function getMetadataBase(env: Env = process.env): URL {
  const configured = getConfiguredSiteUrl(env);
  if (configured) return configured;

  if (isProductionDeployment(env)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required for production builds (e.g. https://example.com). " +
        "Set it in the Vercel project's Production environment variables.",
    );
  }

  return parseHttpOrigin(env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined) ?? new URL(LOCAL_FALLBACK);
}
