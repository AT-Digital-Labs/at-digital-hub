import { Mail } from "lucide-react";

import { Eyebrow } from "@/components/ui/section-heading";
import { contact, sectionIds } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

import { ContactForm } from "./contact-form";

export function Contact({ deliveryAvailable, captchaSiteKey }: { deliveryAvailable: boolean; captchaSiteKey?: string }) {
  const email = siteConfig.contact.publicEmail;

  return (
    <section
      id={sectionIds.contact}
      aria-labelledby="contact-heading"
      className="on-dark section-y relative isolate overflow-hidden border-t border-line bg-ink text-white"
    >
      {/* Geometric accent, echoing the hero. Decorative only. */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 -z-10 hidden h-full w-[34%] bg-accent opacity-95 [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)] xl:block"
      />

      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <div className="reveal lg:col-span-5">
          <Eyebrow onDark>{contact.eyebrow}</Eyebrow>
          <h2 id="contact-heading" className="display-heading mt-5 text-h2">
            {contact.heading}
          </h2>
          <p className="mt-6 max-w-md text-lead text-muted-on-dark">{contact.copy}</p>

          {email ? (
            <p className="mt-8 flex items-center gap-3 text-[0.9375rem]">
              <Mail aria-hidden="true" className="size-5 shrink-0 text-accent-on-dark" />
              <span>
                Prefer email?{" "}
                <a href={`mailto:${email}`} className="font-semibold underline underline-offset-4">
                  {email}
                </a>
              </span>
            </p>
          ) : null}
        </div>

        <div className="reveal lg:col-span-7 xl:col-span-6 xl:col-start-6">
          <ContactForm deliveryAvailable={deliveryAvailable} directEmail={email} captchaSiteKey={captchaSiteKey} />
        </div>
      </div>
    </section>
  );
}
