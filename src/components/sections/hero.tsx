import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section-heading";
import { hero, product, sectionIds } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import type { CSSProperties } from "react";

const step = (index: number): CSSProperties => ({ "--i": index }) as CSSProperties;

/**
 * Swiss line pattern behind the product visual: hairline diagonals, an outlined red band and a solid red block.
 * All shapes share one slope (66 units across per 100 up) so they read as a single system. Decorative only.
 */
function HeroPattern() {
  const SLOPE = 0.66;
  const lines = Array.from({ length: 9 }, (_, i) => {
    const x = -240 + i * 120;
    return { x1: x, x2: x + 1000 * SLOPE, key: i };
  });

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-full [mask-image:linear-gradient(to_right,transparent,#000_30%)] max-lg:top-auto max-lg:h-[48%] max-lg:[mask-image:none] lg:w-[62%]"
    >
      <g stroke="#d4d4d4" strokeWidth="1.25" vectorEffect="non-scaling-stroke">
        {lines.map(({ x1, x2, key }) => (
          <line key={key} x1={x1} y1="1000" x2={x2} y2="0" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <polygon
        points="560,200 720,200 192,1000 32,1000"
        fill="none"
        stroke="#d90416"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <polygon points="720,600 1010,600 880,800 590,800" fill="#d90416" />
    </svg>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate -mt-(--header-h) flex min-h-svh items-center overflow-hidden">
      <HeroPattern />

      <div className="container-page grid gap-14 pt-[calc(var(--header-h)+2rem)] pb-32 sm:pt-[calc(var(--header-h)+3rem)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-40 xl:py-48">
        <div className="lg:col-span-6">
          <div className="hero-in" style={step(0)}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>

          <h1
            id="hero-heading"
            className="hero-in display-heading relative z-10 mt-6 lg:w-[132%] lg:max-w-none text-[clamp(3rem,1.9rem+10.6vw,7rem)] leading-[0.95] lg:text-[clamp(4.5rem,-3.8rem+13.6vw,10rem)] font-extrabold tracking-[-0.035em]"
            style={step(1)}
          >
            <span className="block">{hero.headline.lead}</span> <span className="block text-accent">{hero.headline.highlight}</span>{" "}
            <span className="block">{hero.headline.tail}</span>
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

        <figure className="hero-in relative lg:col-span-6" style={step(4)}>
          <Image
            src="/images/product.png"
            alt={`${siteConfig.product.name} business software on a laptop and a phone: a dashboard with employee, payroll and expense figures, and a mobile home screen. Illustrative sample data.`}
            width={1536}
            height={1024}
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="relative -mx-[6%] h-auto w-[112%] max-w-none"
          />

          <figcaption className="mt-4 ml-auto block w-fit bg-paper px-2 py-1 text-xs text-muted">{product.previewCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
