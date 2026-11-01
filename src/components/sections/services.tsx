import { AppWindow, BrainCircuit, Box, Smartphone, type LucideIcon } from "lucide-react";

import { ArrowIcon } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceLink } from "@/components/ui/service-link";
import { sectionIds, services, type ServiceIcon } from "@/lib/content";

const icons: Record<ServiceIcon, LucideIcon> = {
  web: AppWindow,
  mobile: Smartphone,
  application: Box,
  ai: BrainCircuit,
};

export function Services() {
  return (
    <section
      id={sectionIds.services}
      aria-labelledby="services-heading"
      className="section-y border-t border-line"
    >
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <SectionHeading id="services-heading" eyebrow="Our services" className="reveal lg:col-span-8">
            {services.heading}
          </SectionHeading>
          <p className="reveal max-w-sm text-lead text-muted lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            {services.intro}
          </p>
        </div>

        {/* gap-px over a line-colored backdrop draws hairline dividers at any column count. */}
        <ol className="mt-12 grid gap-px border-y border-line bg-line md:mt-16 md:grid-cols-2 xl:grid-cols-4">
          {services.items.map((service) => {
            const Icon = icons[service.icon];
            return (
              <li key={service.number} className="reveal bg-paper">
                <article className="group relative flex h-full flex-col p-6 transition-colors duration-200 hover:bg-surface motion-reduce:transition-none sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <p aria-hidden="true" className="text-lg font-semibold tabular-nums text-accent">
                      {service.number}
                    </p>
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-11 text-accent motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-1"
                    />
                  </div>

                  <h3 className="mt-12 text-h3">{service.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{service.description}</p>

                  <ServiceLink
                    service={service.contactValue}
                    className="group/link mt-8 inline-flex min-h-11 items-center gap-2 self-start pt-2 text-[0.9375rem] font-semibold text-accent"
                  >
                    <span className="underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover/link:decoration-current motion-reduce:transition-none">
                      Discuss this service
                      <span className="sr-only"> — {service.title}</span>
                    </span>
                    <ArrowIcon className="motion-safe:group-hover/link:translate-x-1" />
                  </ServiceLink>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
