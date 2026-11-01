import { SectionHeading } from "@/components/ui/section-heading";
import { processSection, sectionIds } from "@/lib/content";

import { ProcessTabs } from "./process-tabs";

export function Process() {
  return (
    <section id={sectionIds.process} aria-labelledby="process-heading" className="section-y border-t border-line">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <SectionHeading id="process-heading" eyebrow="Our process" className="reveal lg:col-span-7">
            {processSection.heading}
          </SectionHeading>
          <p className="reveal max-w-sm text-lead text-muted lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            {processSection.intro}
          </p>
        </div>

        <div className="reveal mt-12 md:mt-16">
          <ProcessTabs
            steps={processSection.steps}
            activitiesLabel={processSection.activitiesLabel}
            label="Project stages"
          />
        </div>
      </div>
    </section>
  );
}
