import Image from "next/image";

import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

/** The approved AT Digital Hub logo. `onDark` swaps to the white-lettering variant for dark surfaces. */
export function Wordmark({
  onDark = false,
  size = "default",
  priority = false,
}: {
  onDark?: boolean;
  /** "header" is 1.25x the default footer/inline size. */
  size?: "default" | "header";
  priority?: boolean;
}) {
  const { logo, name } = siteConfig;

  return (
    <Image
      src={onDark ? logo.onDarkSrc : logo.src}
      alt={name}
      width={logo.width}
      height={logo.height}
      priority={priority}
      sizes="(min-width: 1024px) 14rem, 10rem"
      className={cn(
        "h-auto",
        size === "header" ? "w-[clamp(9.375rem,7.75rem+1.75vw,13.75rem)]" : "w-[clamp(7.5rem,6.2rem+1.4vw,11rem)]",
      )}
    />
  );
}
