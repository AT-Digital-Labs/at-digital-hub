"use client";

import { Code, FileText, Rocket, Search, type LucideIcon } from "lucide-react";
import { LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";
import type { ProcessIcon, ProcessStep } from "@/lib/content";

const icons: Record<ProcessIcon, LucideIcon> = {
  discover: Search,
  design: FileText,
  develop: Code,
  launch: Rocket,
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface ProcessTabsProps {
  steps: readonly ProcessStep[];
  activitiesLabel: string;
  label: string;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation) for the four stages.
 * - Click, tap, or keyboard (←/→/↑/↓, Home, End) selects a stage; mouse hover also previews it.
 * - Every panel is rendered in the DOM so the content is crawlable; inactive panels are `invisible`
 *   (removed from the accessibility tree) but keep their space, so the layout never jumps.
 * - Motion drives the progress line and panel reveal only; reduced-motion users get instant changes.
 */
export function ProcessTabs({ steps, activitiesLabel, label }: ProcessTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();

  const timing = (delay = 0) => (reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE, delay });

  const select = (index: number, focus = false) => {
    setActiveIndex(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = steps.length - 1;
    let next: number | undefined;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = activeIndex === last ? 0 : activeIndex + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = activeIndex === 0 ? last : activeIndex - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
    }

    if (next !== undefined) {
      event.preventDefault();
      select(next, true);
    }
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div>
        <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="grid md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = icons[step.icon];
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;

            return (
              <button
                key={step.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`process-tab-${step.id}`}
                aria-selected={isActive}
                aria-controls={`process-panel-${step.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(index)}
                onPointerEnter={(event) => {
                  // Hover previews on mouse only; touch and keyboard rely on tap/focus + keys.
                  if (event.pointerType === "mouse") select(index);
                }}
                className={cn(
                  "group relative flex min-h-16 w-full items-start gap-4 border-l-2 px-5 py-4 text-left transition-colors duration-200 motion-reduce:transition-none",
                  "md:flex-col md:gap-0 md:border-l-0 md:px-5 md:pt-5 md:pb-7",
                  isActive ? "border-accent bg-accent-tint" : isPassed ? "border-accent" : "border-line hover:bg-surface",
                )}
              >
                {/* Active stage marker along the top edge (md+). */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 hidden h-0.5 transition-colors duration-200 md:block motion-reduce:transition-none",
                    isActive ? "bg-accent" : "bg-transparent",
                  )}
                />

                <span className="flex items-center md:w-full">
                  <span
                    className={cn(
                      "text-lg font-semibold tabular-nums transition-colors duration-200 motion-reduce:transition-none",
                      isActive || isPassed ? "text-accent" : "text-muted",
                    )}
                  >
                    {step.number}
                  </span>
                  {/* Connector to the next step; fills red as progress moves past it. */}
                  {index < steps.length - 1 ? (
                    <span aria-hidden="true" className="relative ml-4 hidden h-px flex-1 bg-line md:block">
                      <m.span
                        className="absolute inset-0 origin-left bg-accent"
                        initial={false}
                        animate={{ scaleX: isPassed ? 1 : 0 }}
                        transition={timing(isPassed ? index * 0.06 : 0)}
                      />
                    </span>
                  ) : null}
                </span>

                <span className="min-w-0 md:mt-5">
                  <span className="flex items-center gap-3">
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className={cn(
                        "hidden size-7 shrink-0 transition-colors duration-200 md:block motion-reduce:transition-none",
                        isActive ? "text-accent" : "text-muted",
                      )}
                    />
                    <span className="text-h3">{step.title}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted md:mt-3">{step.summary}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* All panels share one grid cell, so the tallest sets the height and switching never shifts layout. */}
        <div className="mt-4 grid">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            return (
              <m.div
                key={step.id}
                role="tabpanel"
                id={`process-panel-${step.id}`}
                aria-labelledby={`process-tab-${step.id}`}
                tabIndex={isActive ? 0 : -1}
                data-active={isActive}
                className={cn(
                  "col-start-1 row-start-1 border-l-4 border-accent bg-surface p-6 sm:p-8 lg:p-10",
                  isActive ? "visible" : "invisible",
                )}
                initial={false}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={timing()}
              >
                <div className="grid gap-8 lg:grid-cols-[auto_1fr_1fr] lg:gap-12">
                  <p aria-hidden="true" className="text-6xl leading-none font-light tabular-nums text-accent lg:text-7xl">
                    {step.number}
                  </p>

                  <div>
                    <h3 className="text-h3 lg:text-2xl">{step.title}</h3>
                    <p className="mt-3 max-w-prose leading-relaxed text-muted">{step.explanation}</p>
                  </div>

                  <div className="lg:border-l lg:border-line lg:pl-12">
                    <h4 className="text-sm font-semibold">{activitiesLabel}</h4>
                    <ul className="mt-4 space-y-3">
                      {step.activities.map((activity, activityIndex) => (
                        <m.li
                          key={activity}
                          className="flex gap-3 text-[0.9375rem]"
                          initial={false}
                          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                          transition={timing(isActive ? 0.08 + activityIndex * 0.06 : 0)}
                        >
                          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-accent" />
                          {activity}
                        </m.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
}
