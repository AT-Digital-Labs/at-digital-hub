import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

/** Text wordmark. Replace with the approved logo asset when one exists (see `siteConfig.logoPath`). */
export function Wordmark({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <span className={cn("text-[clamp(1.25rem,1.05rem+0.5vw,1.75rem)] font-extrabold tracking-tight", onDark ? "text-white" : "text-ink", className)}>
      <span className={onDark ? "text-accent-on-dark" : "text-accent"}>{siteConfig.wordmark.accent}</span>
      {siteConfig.wordmark.rest}
    </span>
  );
}
