import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Fragment } from "react";

import { EmployeesPreview } from "@/components/previews/employees-preview";
import { ArrowIcon, buttonStyles } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section-heading";
import { ServiceLink } from "@/components/ui/service-link";
import { availabilityLabels, product, sectionIds } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export function Product() {
  const { workflow } = product;

  return (
    <section id={sectionIds.product} aria-labelledby="product-heading" className="section-y border-t border-line bg-surface">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <div className="reveal lg:col-span-5">
          <Eyebrow>{product.badge}</Eyebrow>
          <h2 id="product-heading" className="display-heading mt-5 text-h2">
            <span className="block">{product.headingLead}</span>{" "}
            <span className="block text-accent">{product.headingName}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lead text-muted">{product.description}</p>

          <h3 className="mt-10 text-sm font-semibold">{product.listLabel}</h3>
          <ul className="mt-3 border-t border-ink">
            {product.lines.map((line) => (
              <li
                key={line.suffix}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line bg-paper px-4 py-3"
              >
                <span className="text-[0.9375rem] font-bold">
                  {siteConfig.product.name} <span className="text-accent">{line.suffix}</span>
                </span>
                <span className="text-sm text-muted">
                  {line.scope}
                  {line.availability !== "unspecified" ? (
                    <span className="ml-2 border-l border-line pl-2 text-xs font-medium">
                      {availabilityLabels[line.availability]}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-md text-sm text-muted">{product.listNote}</p>

          <div className="mt-10 border-t border-line pt-8">
            <h3 className="text-sm font-semibold">{workflow.label}</h3>
            <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-muted">{workflow.copy}</p>
            <ol
              aria-label={workflow.exampleNote}
              className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold"
            >
              {workflow.example.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 ? <ArrowRight aria-hidden="true" className="size-4 text-accent" /> : null}
                  <li className="border border-line bg-paper px-3 py-1.5">{item}</li>
                </Fragment>
              ))}
            </ol>
            <p className="mt-2 text-xs text-muted">{workflow.exampleNote}</p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ServiceLink service="unexoro-demo" className={buttonStyles("primary", "w-full sm:w-auto")}>
              {product.cta}
              <ArrowIcon />
            </ServiceLink>
            {siteConfig.product.url ? (
              <a
                href={siteConfig.product.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles("secondary", "w-full sm:w-auto")}
              >
                {product.exploreCta}
                <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </div>

        <figure className="reveal self-center lg:col-span-7">
          <EmployeesPreview />
          <figcaption className="mt-4 text-xs text-muted">{product.previewCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
