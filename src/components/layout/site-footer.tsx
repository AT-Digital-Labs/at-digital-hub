import { MapPin } from "lucide-react";

import { Wordmark } from "@/components/ui/wordmark";
import { footerLinks } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

function LinkColumn({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-1">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted-on-dark underline-offset-4 transition-colors hover:text-white hover:underline motion-reduce:transition-none"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const external = [...siteConfig.social, ...siteConfig.policies];

  return (
    <footer className="on-dark bg-ink text-white">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Wordmark onDark />
            <p className="mt-4 max-w-xs text-[0.9375rem] text-muted-on-dark">{siteConfig.tagline}</p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:col-span-6">
            <LinkColumn title="Services" links={footerLinks.services} />
            <LinkColumn title="Our Product" links={footerLinks.product} />
            <LinkColumn title="Company" links={footerLinks.company} />
          </nav>

          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-white">Location</h2>
            <p className="mt-4 flex items-start gap-2 text-[0.9375rem] text-muted-on-dark">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-on-dark" />
              {siteConfig.location.city}, {siteConfig.location.country}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line-on-dark pt-6 text-sm text-muted-on-dark sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          {external.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5">
              {external.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
