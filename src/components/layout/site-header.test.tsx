import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

beforeAll(() => {
  // jsdom has no matchMedia.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

describe("SiteHeader mobile menu", () => {
  it("is collapsed by default and reflects state with aria-expanded", () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.getElementById("mobile-menu")).toHaveAttribute("data-open", "false");
  });

  it("opens, moves focus to the first link, and closes with Escape returning focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const toggle = screen.getByRole("button", { name: "Close menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    const firstLink = mobileNav.querySelector("a");
    expect(firstLink).toHaveFocus();
    expect(firstLink).toHaveAttribute("href", "#services");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
    expect(document.getElementById("mobile-menu")).toHaveAttribute("data-open", "false");
  });

  it("closes after choosing a link and when focus leaves the header", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SiteHeader />
        <button type="button">Elsewhere</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(within(screen.getByRole("navigation", { name: "Mobile" })).getByRole("link", { name: /^Process/ }));
    expect(document.getElementById("mobile-menu")).toHaveAttribute("data-open", "false");

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
    expect(document.getElementById("mobile-menu")).toHaveAttribute("data-open", "false");
  });
});
