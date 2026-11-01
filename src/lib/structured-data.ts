import { siteConfig } from "@/lib/site-config";

/**
 * Organization JSON-LD limited to verified facts: name, URL, description, and Cebu/Philippines as locality.
 * No street address, legal registration, ratings or reviews. Logo is the approved brand asset; sameAs appears only when configured.
 */
export function buildOrganizationJsonLd(siteUrl: URL): Record<string, unknown> {
  const origin = siteUrl.origin;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: siteConfig.name,
    url: origin,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location.city,
      addressCountry: siteConfig.location.countryCode,
    },
    logo: new URL(siteConfig.logo.src, origin).toString(),
    ...(siteConfig.social.length > 0 ? { sameAs: siteConfig.social.map((link) => link.href) } : {}),
  };
}
