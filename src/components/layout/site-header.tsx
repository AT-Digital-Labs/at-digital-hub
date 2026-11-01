"use client";

import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowIcon, buttonStyles } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import { cn } from "@/lib/cn";
import { navLinks, sectionIds } from "@/lib/content";

const MENU_ID = "mobile-menu";
const DESKTOP_QUERY = "(min-width: 48rem)";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Header gains a border once the page scrolls. Passive listener; never touches scrolling itself.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Highlight the nav item whose section crosses the middle of the viewport. Clears above the first section.
  useEffect(() => {
    const ids = navLinks.map((link) => link.href.slice(1));
    const sections = ids.flatMap((id) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
          else setActiveId((current) => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Open → move focus into the menu. Escape, outside press, and focus leaving the header all close it.
  useEffect(() => {
    if (!menuOpen) return;

    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) closeMenu(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) closeMenu(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [menuOpen, closeMenu]);

  // The mobile menu is hidden at desktop widths; reset so it doesn't reopen stale when resizing back.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 motion-reduce:transition-none",
        // Transparent at the top of the page; once scrolled, a solid white background.
        scrolled ? "border-line bg-paper" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-(--header-h) items-center justify-between gap-6">
        <a href="#top" aria-label="AT Digital Hub — back to top" className="-mx-1 shrink-0 px-1 py-2 whitespace-nowrap">
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1 lg:gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={activeId === link.href.slice(1) ? "location" : undefined}
                  className={cn(
                    "group relative inline-flex min-h-11 items-center px-3 text-[clamp(0.9375rem,0.85rem+0.22vw,1.125rem)] font-medium transition-colors duration-200 motion-reduce:transition-none",
                    activeId === link.href.slice(1) ? "text-accent" : "text-ink",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 bottom-2 h-0.5 origin-left bg-accent motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                      activeId === link.href.slice(1) ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href={`#${sectionIds.contact}`} className={buttonStyles("primary", "px-5 max-md:hidden")}>
            Let&rsquo;s Talk
            <ArrowIcon />
          </a>

          <button
            ref={toggleRef}
            type="button"
            className="-mr-2 inline-flex size-12 items-center justify-center text-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
          </button>
        </div>
      </div>

      {/* Disclosure panel. The noscript rule in the layout keeps it visible if JavaScript is unavailable. */}
      <div
        id={MENU_ID}
        data-open={menuOpen}
        className={cn("mobile-menu border-t border-line bg-paper md:hidden", menuOpen ? "block" : "hidden")}
      >
        <nav aria-label="Mobile" className="container-page py-3">
          <ul>
            {navLinks.map((link, index) => (
              <li key={link.href} className="border-b border-line">
                <a
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  aria-current={activeId === link.href.slice(1) ? "location" : undefined}
                  className={cn(
                    "flex min-h-14 items-center justify-between text-lg font-semibold",
                    activeId === link.href.slice(1) && "text-accent",
                  )}
                  onClick={() => closeMenu(false)}
                >
                  {link.label}
                  <ArrowIcon className="text-accent" />
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`#${sectionIds.contact}`}
            className={buttonStyles("primary", "mt-4 mb-2 w-full")}
            onClick={() => closeMenu(false)}
          >
            Let&rsquo;s Talk
            <ArrowIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
