import type { ServiceValue } from "@/lib/contact/services";
import { siteConfig } from "@/lib/site-config";

/** Section anchors. Header, footer and CTAs all reference these ids. */
export const sectionIds = {
  services: "services",
  product: "product",
  process: "process",
  about: "about",
  contact: "contact",
} as const;

export const navLinks = [
  { label: "Services", href: `#${sectionIds.services}` },
  { label: "Our Product", href: `#${sectionIds.product}` },
  { label: "Process", href: `#${sectionIds.process}` },
  { label: "About", href: `#${sectionIds.about}` },
] as const;

export const hero = {
  eyebrow: "Software Development & AI Automation",
  headline: { lead: "Your ideas.", highlight: "Built into", tail: "software." },
  copy: "We build websites, mobile apps, business applications, and AI automation around how your business works.",
  primaryCta: "Discuss Your Project",
  secondaryCta: "Explore Our Product",
} as const;

export type ServiceIcon = "web" | "mobile" | "application" | "ai";

export interface Service {
  number: string;
  icon: ServiceIcon;
  title: string;
  description: string;
  /** Value preselected in the contact form when this service is chosen. */
  contactValue: ServiceValue;
}

export const services = {
  heading: "What we can build for you.",
  intro: "Practical software solutions shaped around your goals, users, and workflows.",
  items: [
    {
      number: "01",
      icon: "web",
      title: "Web Development",
      description: "Business websites, customer portals, and web platforms built for your users.",
      contactValue: "web-development",
    },
    {
      number: "02",
      icon: "mobile",
      title: "Mobile Development",
      description: "Mobile applications that help customers and teams get things done wherever they are.",
      contactValue: "mobile-development",
    },
    {
      number: "03",
      icon: "application",
      title: "Application Development",
      description: "Custom business systems and desktop applications tailored to your operations.",
      contactValue: "application-development",
    },
    {
      number: "04",
      icon: "ai",
      title: "AI Automation",
      description: "AI assistants, integrations, and automated workflows that reduce repetitive work.",
      contactValue: "ai-automation",
    },
  ] satisfies Service[],
} as const;

export type ModuleAvailability = "unspecified" | "planned" | "in-development" | "available";

export interface ProductLine {
  /** Suffix after the product family name, e.g. "HRIS" → "Unexoro HRIS". */
  suffix: string;
  scope: string;
  /**
   * Set per product once it has been confirmed. "unspecified" renders no status at all,
   * so nothing implies a product is live or production-ready.
   */
  availability: ModuleAvailability;
}

export const availabilityLabels: Record<Exclude<ModuleAvailability, "unspecified">, string> = {
  planned: "Planned",
  "in-development": "In development",
  available: "Available",
};

export const product = {
  badge: "In-house products",
  headingLead: "Built by us:",
  headingName: `${siteConfig.product.name} products.`,
  description: "Our in-house business products are designed to connect people, finance, and everyday operations.",
  listLabel: "The product family",
  listNote: "Scope and availability of each product are confirmed during a product demo.",
  lines: [
    { suffix: "HRIS", scope: "Employee records and organization", availability: "unspecified" },
    { suffix: "POS", scope: "Point of sale and transactions", availability: "unspecified" },
    { suffix: "Finance", scope: "Financial records", availability: "unspecified" },
    { suffix: "Accounting", scope: "Books and accounting records", availability: "unspecified" },
    { suffix: "Warehouse", scope: "Inventory and stock", availability: "unspecified" },
  ] satisfies ProductLine[],
  workflow: {
    label: "Connected workflows",
    copy: `The ${siteConfig.product.name} products are designed around shared records, so information entered once can be used where it is needed instead of being re-entered across separate tools.`,
    example: ["HRIS", "Finance", "Accounting"],
    exampleNote: "Example of the intended flow",
  },
  cta: "Request a Product Demo",
  exploreCta: `Explore ${siteConfig.product.name}`,
  previewCaption: "Illustrative concept · Sample data.",
  previewAlt: `Illustrative ${siteConfig.product.name} HRIS interface showing an employee list with sample data.`,
} as const;

export type ProcessIcon = "discover" | "design" | "develop" | "launch";

export interface ProcessStep {
  id: string;
  number: string;
  icon: ProcessIcon;
  title: string;
  summary: string;
  explanation: string;
  activities: readonly [string, string, string];
}

export const processSection = {
  heading: "From idea to working solution.",
  intro: "A clear, collaborative process that keeps your project visible from start to finish.",
  activitiesLabel: "Typical activities",
  steps: [
    {
      id: "discover",
      number: "01",
      icon: "discover",
      title: "Discover",
      summary: "Learn how your business works.",
      explanation:
        "We start by learning how your business actually works, so the solution is shaped around real workflows rather than assumptions.",
      activities: [
        "Understand goals and workflows.",
        "Identify users and constraints.",
        "Define priorities and initial scope.",
      ],
    },
    {
      id: "design",
      number: "02",
      icon: "design",
      title: "Design",
      summary: "Agree on what we are building.",
      explanation:
        "We turn what we learned into something you can review: user journeys, interface proposals, and a clear technical approach.",
      activities: [
        "Map user journeys.",
        "Review proposed interfaces.",
        "Agree on the technical approach.",
      ],
    },
    {
      id: "develop",
      number: "03",
      icon: "develop",
      title: "Develop & Test",
      summary: "Build in steps you can see.",
      explanation:
        "We build in manageable increments, show working progress along the way, and check the result against what we agreed.",
      activities: [
        "Implement in manageable increments.",
        "Demonstrate progress.",
        "Validate against agreed requirements.",
      ],
    },
    {
      id: "launch",
      number: "04",
      icon: "launch",
      title: "Launch & Support",
      summary: "Go live and keep it running.",
      explanation:
        "We prepare the release and handover, and agree how the solution will be supported once it is in use.",
      activities: [
        "Prepare deployment and handover.",
        "Provide agreed training.",
        "Define ongoing support.",
      ],
    },
  ] satisfies ProcessStep[],
} as const;

export type PrincipleIcon = "maintainable" | "connected" | "growth";

export const about = {
  heading: "A small team. Hands-on engineering.",
  /** Same heading, split so each sentence stays on its own line and "Hands-on" never breaks mid-word. */
  headingLines: ["A small team.", "Hands-on engineering."],
  copy: `${siteConfig.name} is a founder-led software development company based in ${siteConfig.location.city}, ${siteConfig.location.country}. We build practical digital solutions and our own products, with a focus on clear workflows, maintainable systems, and direct collaboration.`,
  principlesLabel: "Engineering principles",
  principlesNote: "These describe how we aim to work. They are principles, not guarantees.",
  principles: [
    {
      icon: "maintainable",
      title: "Maintainable foundations",
      description: "We favor clear structure and readable code, so a system can be understood and changed over time.",
    },
    {
      icon: "connected",
      title: "Connected systems",
      description: "We design software to work alongside the tools and data you already use, not in isolation.",
    },
    {
      icon: "growth",
      title: "Room to grow",
      description: "We start with what you need now and leave space for the solution to evolve with your business.",
    },
  ] satisfies ReadonlyArray<{ icon: PrincipleIcon; title: string; description: string }>,
} as const;

export const contact = {
  eyebrow: "Let's work together",
  heading: "Have a project in mind?",
  copy: "Tell us what you want to build or which workflow you want to improve.",
} as const;

export const footerLinks = {
  services: services.items.map((service) => ({ label: service.title, href: `#${sectionIds.services}` })),
  product: product.lines.map((line) => ({
    label: `${siteConfig.product.name} ${line.suffix}`,
    href: `#${sectionIds.product}`,
  })),
  company: [
    { label: "Our Process", href: `#${sectionIds.process}` },
    { label: "About Us", href: `#${sectionIds.about}` },
    { label: "Contact", href: `#${sectionIds.contact}` },
  ],
} as const;
