import { Landmark, LayoutDashboard, Layers, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

/**
 * Building blocks for the illustrative interface previews.
 * All data shown is synthetic. The previews are decorative illustrations of a concept, exposed to
 * assistive tech as a single labelled image, so inner text is hidden from the accessibility tree.
 */

export const SAMPLE = {
  employees: "124",
  payroll: "₱1,250,000",
  expenses: "₱860,500",
  months: [38, 52, 44, 63, 58, 76],
  monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  departments: [
    { name: "Operations", value: 40, color: "#d90416" },
    { name: "Sales", value: 28, color: "#111111" },
    { name: "Engineering", value: 24, color: "#737373" },
    { name: "Finance", value: 16, color: "#c9c9c9" },
  ],
} as const;

export function PreviewBrand({ className }: { className?: string }) {
  return (
    <p className={cn("text-[0.9375rem] font-extrabold tracking-tight text-ink", className)}>
      <span className="text-accent">{siteConfig.product.name.slice(0, 1)}</span>
      {siteConfig.product.name.slice(1)}
    </p>
  );
}

const navItems: ReadonlyArray<{ label: string; icon: LucideIcon }> = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "People", icon: Users },
  { label: "Payroll", icon: Wallet },
  { label: "Finance", icon: Landmark },
  { label: "Operations", icon: Layers },
  { label: "Reports", icon: TrendingUp },
];

export function PreviewSidebar({ active, className }: { active: string; className?: string }) {
  return (
    <div className={cn("flex-col gap-0.5 border-r border-line bg-paper p-3", className)}>
      <PreviewBrand className="mb-3 px-2" />
      {navItems.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium",
            label === active ? "bg-accent-tint text-accent" : "text-muted",
          )}
        >
          <Icon aria-hidden="true" className="size-3.5 shrink-0" />
          {label}
        </div>
      ))}
    </div>
  );
}

export function PreviewCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-sm border border-line bg-paper p-3", className)}>{children}</div>;
}

export function PreviewCaption({ className }: { className?: string }) {
  return <figcaption className={cn("text-xs text-muted", className)}>Illustrative concept · Sample data.</figcaption>;
}

export function BarChart({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-24 gap-2", className)}>
      {SAMPLE.months.map((height, index) => (
        <div key={SAMPLE.monthLabels[index]} className="flex min-w-0 flex-1 flex-col gap-1">
          {/* The bar track has a definite flex height, so the percentage height resolves. */}
          <div className="flex min-h-0 flex-1 items-end">
            <div
              className={cn("w-full rounded-t-[1px]", index === SAMPLE.months.length - 1 ? "bg-accent" : "bg-accent/30")}
              style={{ height: `${height}%` }}
            />
          </div>
          <span className="text-center text-[0.625rem] leading-none text-muted">{SAMPLE.monthLabels[index]}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ className }: { className?: string }) {
  const total = SAMPLE.departments.reduce((sum, department) => sum + department.value, 0);
  const stops = SAMPLE.departments.map((department, index) => {
    const before = SAMPLE.departments.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const start = (before / total) * 100;
    const end = ((before + department.value) / total) * 100;
    return `${department.color} ${start}% ${end}%`;
  });

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="size-16 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
          mask: "radial-gradient(circle, transparent 55%, #000 56%)",
          WebkitMask: "radial-gradient(circle, transparent 55%, #000 56%)",
        }}
      />
      <ul className="space-y-1 text-[0.6875rem] leading-none text-muted">
        {SAMPLE.departments.map((department) => (
          <li key={department.name} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: department.color }} />
            {department.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
