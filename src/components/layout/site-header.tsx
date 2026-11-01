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
        "sticky top-0 z-50 border-b bg-paper transition-[border-color,box-shadow] duration-300 motion-reduce:transition-none",
        scrolled ? "border-line shadow-[0_1px_0_0_rgb(17_17_17/0.04)]" : "border-transparent",
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
                  className="group relative inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-medium text-ink"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-2 h-0.5 origin-left scale-x-0 bg-accent motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100"
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
                  className="flex min-h-14 items-center justify-between text-lg font-semibold"
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
