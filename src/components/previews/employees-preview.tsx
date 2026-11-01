import { Bell, Check, Plus, Search, Users, Wallet } from "lucide-react";

import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

import { PreviewCard, PreviewSidebar, SAMPLE } from "./preview-parts";

const employees = [
  { name: "Alex Rivera", department: "Operations", type: "Regular" },
  { name: "Jordan Lee", department: "Finance", type: "Regular" },
  { name: "Sam Okafor", department: "People", type: "Regular" },
  { name: "Casey Moreau", department: "Engineering", type: "Contract" },
  { name: "Riley Tanaka", department: "Sales", type: "Regular" },
] as const;

function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={cn("h-10 w-28", className)} preserveAspectRatio="none">
      <path d="M0 32 L20 28 L40 30 L60 20 L80 22 L100 10 L120 6 L120 40 L0 40 Z" fill="#d90416" fillOpacity="0.12" />
      <path d="M0 32 L20 28 L40 30 L60 20 L80 22 L100 10 L120 6" fill="none" stroke="#d90416" strokeWidth="2" />
    </svg>
  );
}

/** Larger application illustration for the product section: sidebar, employee table and summary cards. */
export function EmployeesPreview({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Illustrative ${siteConfig.product.name} HRIS interface showing a sample employee list and summary figures.`}
      className={cn("w-full", className)}
    >
      <div aria-hidden="true" className="@container overflow-hidden rounded-md border border-line bg-surface shadow-[0_24px_60px_-28px_rgb(17_17_17/0.35)]">
        <div className="flex">
          <PreviewSidebar active="People" className="hidden w-40 shrink-0 @2xl:flex" />

          <div className="min-w-0 flex-1 p-3 @md:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm border border-line bg-paper px-2.5 text-xs text-muted">
                <Search className="size-3.5 shrink-0" />
                <span className="truncate">Search anything…</span>
              </div>
              <Bell className="size-4 shrink-0 text-muted" />
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[0.6875rem] font-bold text-white">
                U
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-ink @md:text-lg">Employees</p>
                <p className="truncate text-xs text-muted">Manage your team and organization.</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-sm bg-accent px-2.5 py-1.5 text-xs font-semibold text-white">
                <Plus className="size-3" />
                <span className="hidden @sm:inline">Add Employee</span>
              </div>
            </div>

            <PreviewCard className="mt-3 p-0">
              <div className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-line px-3 py-2 text-[0.6875rem] font-semibold text-muted @lg:grid-cols-[1.2fr_1fr_0.8fr_auto]">
                <span>Name</span>
                <span className="hidden @lg:block">Department</span>
                <span className="hidden @lg:block">Employment type</span>
                <span>Status</span>
              </div>
              {employees.map((employee) => (
                <div
                  key={employee.name}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 border-b border-line px-3 py-2 text-xs last:border-b-0 @lg:grid-cols-[1.2fr_1fr_0.8fr_auto]"
                >
                  <span className="truncate font-medium text-ink">{employee.name}</span>
                  <span className="hidden text-muted @lg:block">{employee.department}</span>
                  <span className="hidden text-muted @lg:block">{employee.type}</span>
                  <span className="inline-flex items-center gap-1 rounded-sm bg-[#e8f5ee] px-1.5 py-0.5 text-[0.6875rem] font-semibold text-success">
                    <Check className="size-3" />
                    Active
                  </span>
                </div>
              ))}
            </PreviewCard>

            <div className="mt-3 grid gap-3 @md:grid-cols-2">
              <PreviewCard className="flex items-end justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Users className="size-3.5" /> Total employees
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{SAMPLE.employees}</p>
                </div>
                <div className="flex h-10 items-end gap-1" >
                  {[40, 55, 45, 70, 60, 85].map((height, index) => (
                    <span key={index} className="w-2 rounded-t-[1px] bg-ink/70" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </PreviewCard>
              <PreviewCard className="flex items-end justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Wallet className="size-3.5" /> Monthly payroll
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{SAMPLE.payroll}</p>
                </div>
                <Sparkline />
              </PreviewCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
