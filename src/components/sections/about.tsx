import { Database, Settings, TrendingUp, type LucideIcon } from "lucide-react";
import Image from "next/image";

import { SectionHeading } from "@/components/ui/section-heading";
import { about, sectionIds, type PrincipleIcon } from "@/lib/content";

const icons: Record<PrincipleIcon, LucideIcon> = {
  maintainable: Settings,
  connected: Database,
  growth: TrendingUp,
};

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
          <div className="reveal relative mt-10 aspect-[4/3] max-w-2xl overflow-hidden border border-line sm:aspect-[16/10]">
            <Image
              src="/images/collab.png"
              alt="A desk with a monitor showing an interface design, a laptop with code open, and a notebook with a hand-drawn workflow diagram."
              fill
              sizes="(min-width: 1024px) 42rem, 100vw"
              className="object-cover"
            />
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
