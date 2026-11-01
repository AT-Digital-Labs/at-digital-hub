import { siteConfig } from "@/lib/site-config";

/** Shared by the form (client) and server validation, so options can never drift apart. */
export const SERVICE_VALUES = [
  "web-development",
  "mobile-development",
  "application-development",
  "ai-automation",
  "unexoro-demo",
  "not-sure",
] as const;

export type ServiceValue = (typeof SERVICE_VALUES)[number];

export const serviceOptions: ReadonlyArray<{ value: ServiceValue; label: string }> = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "application-development", label: "Application Development" },
  { value: "ai-automation", label: "AI Automation" },
  { value: "unexoro-demo", label: `${siteConfig.product.name} Product Demo` },
  { value: "not-sure", label: "Not sure yet" },
];

export function isServiceValue(value: unknown): value is ServiceValue {
  return typeof value === "string" && (SERVICE_VALUES as readonly string[]).includes(value);
}

export function serviceLabel(value: ServiceValue): string {
  return serviceOptions.find((option) => option.value === value)?.label ?? value;
}
