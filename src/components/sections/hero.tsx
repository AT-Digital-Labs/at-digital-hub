import { DashboardPreview } from "@/components/previews/dashboard-preview";
import { PhonePreview } from "@/components/previews/phone-preview";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section-heading";
import { hero, product, sectionIds } from "@/lib/content";
import type { CSSProperties } from "react";

const step = (index: number): CSSProperties => ({ "--i": index }) as CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      {/* Geometric red field, inspired by the Swiss reference. Decorative only. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 hidden w-[46%] bg-accent [clip-path:polygon(24%_0,100%_0,100%_100%,0_100%)] lg:block"
      />

      <div className="container-page grid gap-14 pt-10 pb-16 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-20 xl:py-24">
        <div className="lg:col-span-5">
          <div className="hero-in" style={step(0)}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>

          <h1
            id="hero-heading"
            className="hero-in display-heading mt-6 text-[clamp(2.75rem,1.75rem+3.2vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.035em]"
            style={step(1)}
          >
            <span className="block">{hero.headline.lead}</span> <span className="block text-accent">{hero.headline.highlight} {hero.headline.tail}</span>
          </h1>

          <p className="hero-in mt-6 max-w-md text-lead text-muted" style={step(2)}>
            {hero.copy}
          </p>

          <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start xl:flex-row xl:items-stretch" style={step(3)}>
            <ButtonLink href={`#${sectionIds.contact}`} className="w-full whitespace-nowrap sm:w-auto">
              {hero.primaryCta}
            </ButtonLink>
            <ButtonLink href={`#${sectionIds.product}`} variant="secondary" className="w-full whitespace-nowrap sm:w-auto">
              {hero.secondaryCta}
            </ButtonLink>
          </div>
        </div>

        <figure className="hero-in relative lg:col-span-7" style={step(4)}>
          {/* Mobile/tablet: a red block anchors the devices; at lg the full-height field above takes over. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-[18%] right-[-1.25rem] left-[22%] -z-10 bg-accent sm:right-[-2rem] lg:hidden"
          />

          <div className="relative pb-48 sm:pb-12">
            {/* Narrow screens: the phone overlaps only the laptop's lower edge so no content is covered. */}
            <DashboardPreview sidebar={false} className="sm:ml-auto sm:w-[84%]" />
            <PhonePreview className="absolute bottom-0 left-0 w-[32%] min-w-[7.25rem] max-w-[11.5rem] sm:w-[30%]" />
          </div>

          <figcaption className="mt-4 inline-block bg-paper px-2 py-1 text-xs text-muted">{product.previewCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
