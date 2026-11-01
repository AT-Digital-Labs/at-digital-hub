import { ChevronRight, Landmark, Layers, Users, Wallet, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import { productFullName } from "@/lib/site-config";

import { PreviewBrand } from "./preview-parts";

const rows: ReadonlyArray<{ title: string; hint: string; icon: LucideIcon }> = [
  { title: "People", hint: "View and manage employees", icon: Users },
  { title: "Payroll", hint: "Process and review payroll", icon: Wallet },
  { title: "Finance", hint: "Track income and expenses", icon: Landmark },
  { title: "Operations", hint: "Manage your daily operations", icon: Layers },
];

/** Phone illustration. Text stays at readable sizes; the frame scales with its container's width. */
export function PhonePreview({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Illustrative ${productFullName} mobile home screen with sample navigation.`}
      className={cn("aspect-[9/18] w-full rounded-[1.75rem] bg-ink p-[0.3rem] shadow-[0_18px_40px_-12px_rgb(17_17_17/0.35)] sm:p-1.5", className)}
    >
      <div aria-hidden="true" className="flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-paper px-2.5 pt-3 sm:px-3">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/80" />
        <PreviewBrand />
        <p className="mt-2 text-xs font-bold text-ink">Good morning!</p>
        <ul className="mt-2 space-y-1.5">
          {rows.map(({ title, hint, icon: Icon }) => (
            <li key={title} className="flex items-center gap-2 rounded-sm border border-line px-2 py-1.5">
              <Icon className="size-3.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.6875rem] font-semibold leading-tight text-ink">{title}</p>
                <p className="hidden truncate text-[0.5625rem] leading-tight text-muted sm:block">{hint}</p>
              </div>
              <ChevronRight className="size-3 shrink-0 text-muted" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
