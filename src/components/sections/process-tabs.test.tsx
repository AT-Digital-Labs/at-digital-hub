import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { processSection } from "@/lib/content";

import { ProcessTabs } from "./process-tabs";

function setup() {
  render(<ProcessTabs steps={processSection.steps} activitiesLabel="Typical activities" label="Project stages" />);
  const tabs = screen.getAllByRole("tab");
  return { tabs, user: userEvent.setup() };
}

const selected = (tabs: HTMLElement[]) => tabs.filter((tab) => tab.getAttribute("aria-selected") === "true");

describe("ProcessTabs", () => {
  it("exposes a tablist with the first stage selected and only it in the tab order", () => {
    const { tabs } = setup();
    expect(screen.getByRole("tablist", { name: "Project stages" })).toBeInTheDocument();
    expect(tabs).toHaveLength(4);
    expect(selected(tabs)).toEqual([tabs[0]]);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it("renders every stage's content in the DOM (crawlable) with three activities each", () => {
    setup();
    for (const step of processSection.steps) {
      expect(document.getElementById(`process-panel-${step.id}`)).toHaveTextContent(step.explanation);
      for (const activity of step.activities) expect(screen.getByText(activity)).toBeInTheDocument();
    }
  });

  it("activates a stage on click and marks the matching panel active", async () => {
    const { tabs, user } = setup();
    await user.click(tabs[2]!);
    expect(selected(tabs)).toEqual([tabs[2]]);
    expect(document.getElementById("process-panel-develop")).toHaveAttribute("data-active", "true");
    expect(document.getElementById("process-panel-discover")).toHaveAttribute("data-active", "false");
    expect(tabs[2]).toHaveAttribute("aria-controls", "process-panel-develop");
  });

  it("supports arrow keys with wrap-around, plus Home and End, moving focus with selection", async () => {
    const { tabs, user } = setup();
    tabs[0]!.focus();

    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(selected(tabs)).toEqual([tabs[1]]);

    await user.keyboard("{End}");
    expect(tabs[3]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tabs[0]).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(tabs[3]).toHaveFocus();

    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
    expect(selected(tabs)).toEqual([tabs[0]]);
  });

  it("previews a stage on mouse hover, but not on touch", async () => {
    const { tabs, user } = setup();
    await user.hover(tabs[1]!);
    expect(selected(tabs)).toEqual([tabs[1]]);

    const touch = userEvent.setup({ pointerEventsCheck: 0 });
    // A touch pointer entering must not switch tabs; taps do (via click).
    tabs[3]!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "touch" }));
    tabs[3]!.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
    expect(selected(tabs)).toEqual([tabs[1]]);
    await touch.click(tabs[3]!);
    expect(selected(tabs)).toEqual([tabs[3]]);
  });
});
