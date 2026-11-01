import { Database, Settings, TrendingUp, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { about, sectionIds, type PrincipleIcon } from "@/lib/content";

const icons: Record<PrincipleIcon, LucideIcon> = {
  maintainable: Settings,
  connected: Database,
  growth: TrendingUp,
};

/** Abstract Swiss composition (no photography). Purely decorative. */
function GeometricArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      focusable="false"
    >
      <rect width="400" height="300" fill="#f5f5f5" />
      <g stroke="#e5e5e5" strokeWidth="1">
        {Array.from({ length: 19 }, (_, i) => (
          <line key={i} x1={20 * (i + 1)} y1="0" x2={20 * (i + 1)} y2="300" />
        ))}
      </g>
      <rect x="200" y="36" width="140" height="190" fill="#d90416" />
      <rect x="60" y="110" width="190" height="190" fill="#111111" />
      <g stroke="#333333" strokeWidth="2">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="60" y1={130 + i * 22} x2="250" y2={130 + i * 22} />
        ))}
      </g>
      <rect x="250" y="170" width="110" height="130" fill="#c9c9c9" />
      <rect x="250" y="170" width="110" height="6" fill="#111111" />
    </svg>
  );
}

export function About() {
  return (
    <section id={sectionIds.about} aria-labelledby="about-heading" className="section-y border-t border-line">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading id="about-heading" eyebrow="About AT Digital Hub" className="reveal">
            {about.headingLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? " " : null}
                <span className="inline-block">{line}</span>
              </span>
            ))}
          </SectionHeading>
          <p className="reveal mt-6 max-w-2xl text-lead text-muted">{about.copy}</p>
          <div className="reveal mt-10 aspect-[4/3] max-w-2xl overflow-hidden border border-line sm:aspect-[16/10]">
            <GeometricArt />
          </div>
        </div>

        <div className="reveal lg:col-span-5 lg:self-center">
          <h3 className="eyebrow text-muted">{about.principlesLabel}</h3>
          <ul className="mt-5 border-t border-line">
            {about.principles.map((principle) => {
              const Icon = icons[principle.icon];
              return (
                <li key={principle.title} className="flex gap-5 border-b border-line py-7">
                  <Icon aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-9 shrink-0 text-ink" />
                  <div>
                    <h4 className="text-h3">{principle.title}</h4>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{principle.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted">{about.principlesNote}</p>
        </div>
      </div>
    </section>
  );
}
