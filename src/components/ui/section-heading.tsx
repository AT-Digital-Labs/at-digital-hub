import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Eyebrow({ children, onDark = false, className }: { children: ReactNode; onDark?: boolean; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", onDark ? "text-muted-on-dark" : "text-muted", className)}>
      <span aria-hidden="true" className={cn("h-0.5 w-8 shrink-0", onDark ? "bg-accent-on-dark" : "bg-accent")} />
      {children}
    </p>
  );
}

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  children: ReactNode;
  onDark?: boolean;
  className?: string;
  as?: "h1" | "h2";
}

/** Eyebrow + oversized heading. The id is referenced by the section's aria-labelledby. */
export function SectionHeading({ id, eyebrow, children, onDark, className, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={className}>
      <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
      <Tag id={id} className="display-heading mt-5 text-h2">
        {children}
      </Tag>
    </div>
  );
}
