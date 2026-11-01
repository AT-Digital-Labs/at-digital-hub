import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/ui/json-ld";
import { getMetadataBase, isIndexable } from "@/lib/indexing";
import { siteConfig } from "@/lib/site-config";
import { buildOrganizationJsonLd } from "@/lib/structured-data";

import "./globals.css";

const inter = localFont({
  src: "./fonts/Inter-latin-wght.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const metadataBase = getMetadataBase();
const indexable = isIndexable();

export const metadata: Metadata = {
  metadataBase,
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  // Only the intended production deployment may be indexed; previews and staging stay out of search.
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        {/* Without JavaScript the mobile menu can't be toggled, so show its links instead of hiding navigation. */}
        <noscript>
          <style>{`@media (max-width: 47.99rem) { .mobile-menu { display: block; } }`}</style>
        </noscript>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[100] -translate-y-24 bg-ink px-5 py-3 text-sm font-semibold text-white focus:translate-y-0"
        >
          Skip to main content
        </a>
        <div id="top">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
        <JsonLd data={buildOrganizationJsonLd(metadataBase)} />
      </body>
    </html>
  );
}
