/**
 * Single source of truth for company facts, external destinations and the product name.
 * Optional destinations stay undefined until a real value is supplied (via env), and the UI
 * only renders them when present — nothing here is a placeholder or an invented fact.
 */

export interface ExternalLink {
  label: string;
  href: string;
}

function httpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function emailAddress(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(trimmed) ? trimmed : undefined;
}

function presentLinks(entries: ReadonlyArray<readonly [label: string, href: string | undefined]>): ExternalLink[] {
  return entries.flatMap(([label, href]) => (href ? [{ label, href }] : []));
}

// NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them at build time.
const social = presentLinks([
  ["LinkedIn", httpsUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL)],
  ["Facebook", httpsUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL)],
  ["GitHub", httpsUrl(process.env.NEXT_PUBLIC_GITHUB_URL)],
]);

const policies = presentLinks([
  ["Privacy Policy", httpsUrl(process.env.NEXT_PUBLIC_PRIVACY_URL)],
  ["Terms", httpsUrl(process.env.NEXT_PUBLIC_TERMS_URL)],
]);

export const siteConfig = {
  name: "AT Digital Hub",
  /** Text wordmark, used only where the logo image can't be (e.g. the generated social image). */
  wordmark: { accent: "AT", rest: " Digital Hub" },
  /** Approved logo: trimmed from public/images/logo.png. `onDark` has white lettering for dark surfaces. */
  logo: {
    src: "/brand/logo.png",
    onDarkSrc: "/brand/logo-on-dark.png",
    width: 1629,
    height: 569,
  },
  tagline: "Practical software. Connected operations.",
  title: "AT Digital Hub | Software Development & AI Automation",
  description:
    "AT Digital Hub builds websites, mobile apps, custom business applications, and AI automation in Cebu, Philippines. Discover our services and the Unexoro business products.",
  location: { city: "Cebu", country: "Philippines", countryCode: "PH" },
  locale: "en_PH",

  product: {
    /** Change here to rename the product everywhere. */
    name: "Unexoro",
    /** Set only when a real product destination exists; no "Explore" link is rendered otherwise. */
    url: httpsUrl(process.env.NEXT_PUBLIC_UNEXORO_URL),
  },

  contact: {
    /** Public direct-contact address. Shown only when supplied. */
    publicEmail: emailAddress(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  },

  social,
  policies,
} as const;
