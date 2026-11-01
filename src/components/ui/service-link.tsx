"use client";

import type { ReactNode } from "react";

import { requestServicePreselect } from "@/lib/contact/preselect";
import type { ServiceValue } from "@/lib/contact/services";

interface ServiceLinkProps {
  service: ServiceValue;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

/** A normal anchor to the contact section that also preselects a service. Works as a plain link without JS. */
export function ServiceLink({ service, className, children, ...rest }: ServiceLinkProps) {
  return (
    <a href="#contact" className={className} onClick={() => requestServicePreselect(service)} {...rest}>
      {children}
    </a>
  );
}
