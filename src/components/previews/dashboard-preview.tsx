import { Bell, Search } from "lucide-react";

import { cn } from "@/lib/cn";
import { productFullName } from "@/lib/site-config";

import { BarChart, Donut, PreviewCard, PreviewSidebar, SAMPLE } from "./preview-parts";

function Kpi({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <PreviewCard className={className}>
      <p className="text-[0.6875rem] leading-tight text-muted">{label}</p>
      <p className="mt-1 text-base font-bold tracking-tight text-ink @md:text-lg">{value}</p>
    </PreviewCard>
  );
}

/**
 * Laptop-style dashboard illustration. It lays out against its own width (container queries), so on
 * narrow screens it drops secondary panels instead of shrinking everything into illegibility.
 */
export function DashboardPreview({ className, sidebar = true }: { className?: string; sidebar?: boolean }) {
  return (
    <div
      role="img"
      aria-label={`Illustrative ${productFullName} dashboard with sample employee, payroll and expense figures.`}
      className={cn("w-full", className)}
    >
      <div aria-hidden="true">
        {/* Screen with dark bezel */}
        <div className="rounded-t-xl bg-ink p-1.5 sm:p-2.5">
          <div className="@container overflow-hidden rounded-t-[0.375rem] bg-surface">
            <div className="flex min-h-[15rem] @lg:min-h-[20rem]">
              {sidebar ? <PreviewSidebar active="Dashboard" className="hidden w-36 shrink-0 @lg:flex" /> : null}

              {/* Without the sidebar, extra left space leaves room for an overlapping phone illustration. */}
              <div className={cn("min-w-0 flex-1 p-3 @md:p-4", !sidebar && "sm:pl-[27%] sm:@md:pl-[27%]")}>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-sm border border-line bg-paper px-2 text-[0.6875rem] text-muted">
                    <Search className="size-3 shrink-0" />
                    <span className="truncate">Search anything…</span>
                  </div>
                  <Bell className="size-4 shrink-0 text-muted" />
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[0.625rem] font-bold text-white">
                    U
                  </div>
                </div>

                <p className="mt-3 text-sm font-bold text-ink">Good morning!</p>
                <p className="text-[0.6875rem] text-muted">Here&rsquo;s what&rsquo;s happening in your business today.</p>

                <div className="mt-3 grid grid-cols-2 gap-2 @md:grid-cols-3">
                  <Kpi label="Total employees" value={SAMPLE.employees} />
                  <Kpi label="Monthly payroll" value={SAMPLE.payroll} />
                  <Kpi label="Operating expenses" value={SAMPLE.expenses} className="hidden @md:block" />
                </div>

                <div className="mt-2 grid gap-2 @lg:grid-cols-[1.4fr_1fr]">
                  <PreviewCard>
                    <p className="mb-2 text-[0.6875rem] font-semibold text-ink">Payroll trend</p>
                    <BarChart />
                  </PreviewCard>
                  <PreviewCard className="hidden @lg:block">
                    <p className="mb-2 text-[0.6875rem] font-semibold text-ink">Department headcount</p>
                    <Donut />
                  </PreviewCard>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Laptop base */}
        <div className="mx-auto h-2 w-[104%] -translate-x-[2%] rounded-b-md bg-linear-to-b from-[#d4d4d4] to-[#a8a8a8] sm:h-2.5" />
      </div>
    </div>
  );
}
