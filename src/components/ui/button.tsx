import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "inverse";

const base =
  "group inline-flex min-h-12 items-center justify-center gap-3 border px-6 text-[0.9375rem] font-semibold leading-none " +
  "transition-colors duration-200 motion-reduce:transition-none";

const variants: Record<ButtonVariant, string> = {
  primary: "border-accent bg-accent text-white hover:border-accent-strong hover:bg-accent-strong",
  secondary: "border-ink bg-paper text-ink hover:bg-ink hover:text-white",
  inverse: "border-white bg-white text-ink hover:border-accent hover:bg-accent hover:text-white",
};

export function buttonStyles(variant: ButtonVariant = "primary", className?: string): string {
  return cn(base, variants[variant], className);
}

/** Arrow that nudges right on hover/focus of its `group` parent; static under reduced motion. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1",
        className,
      )}
    />
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  arrow?: boolean;
}

export function ButtonLink({ href, variant = "primary", className, children, arrow = true }: ButtonLinkProps) {
  return (
    <a href={href} className={buttonStyles(variant, className)}>
      {children}
      {arrow ? <ArrowIcon /> : null}
    </a>
  );
}
