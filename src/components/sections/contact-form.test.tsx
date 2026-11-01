import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRESELECT_EVENT } from "@/lib/contact/preselect";
import type { ContactState } from "@/lib/contact/types";

const submitContact = vi.hoisted(() => vi.fn());
vi.mock("@/lib/contact/actions", () => ({ submitContact }));

import { ContactForm } from "./contact-form";

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Alex Rivera");
  await user.type(screen.getByLabelText("Email"), "alex@example.com");
  await user.selectOptions(screen.getByLabelText("Service of interest"), "web-development");
  await user.type(screen.getByLabelText("Project description"), "We need a customer portal.");
}

beforeEach(() => {
  submitContact.mockReset();
});

describe("ContactForm", () => {
  it("is disabled with a clear notice, and never submits, when delivery isn't configured", async () => {
    const user = userEvent.setup();
    render(<ContactForm deliveryAvailable={false} />);

    expect(screen.getByRole("status")).toHaveTextContent(/temporarily unavailable/i);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.queryByRole("link", { name: /@/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(submitContact).not.toHaveBeenCalled();
  });

  it("shows a direct email only when one was supplied", () => {
    render(<ContactForm deliveryAvailable={false} directEmail="hello@example.com" />);
    expect(screen.getByRole("status")).toHaveTextContent("hello@example.com");
  });

  it("blocks an invalid submission client-side with associated, non-color-only errors and moves focus", async () => {
    const user = userEvent.setup();
    render(<ContactForm deliveryAvailable />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    const name = screen.getByLabelText("Name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveFocus();
    const describedBy = name.getAttribute("aria-describedby");
    expect(describedBy && document.getElementById(describedBy)).toHaveTextContent("Enter your name.");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(submitContact).not.toHaveBeenCalled();
  });

  it("clears a field's error once it is edited", async () => {
    const user = userEvent.setup();
    render(<ContactForm deliveryAvailable />);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");

    await user.type(screen.getByLabelText("Name"), "A");
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-invalid");
  });

  it("preselects the service when a service or demo CTA requests it", () => {
    render(<ContactForm deliveryAvailable />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PRESELECT_EVENT, { detail: "unexoro-demo" }));
    });
    expect(screen.getByLabelText("Service of interest")).toHaveValue("unexoro-demo");

    act(() => {
      window.dispatchEvent(new CustomEvent(PRESELECT_EVENT, { detail: "not-a-service" }));
    });
    expect(screen.getByLabelText("Service of interest")).toHaveValue("unexoro-demo");
  });

  it("sends valid input with timing and idempotency fields, announces success and offers a new message", async () => {
    submitContact.mockResolvedValue({
      status: "success",
      message: "Thanks — your message has been sent.",
      fieldErrors: {},
      values: {},
    } satisfies ContactState);
    const user = userEvent.setup();
    render(<ContactForm deliveryAvailable />);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(submitContact).toHaveBeenCalledTimes(1));
    const formData = submitContact.mock.calls[0]![1] as FormData;
    expect(formData.get("email")).toBe("alex@example.com");
    expect(formData.get("website")).toBe("");
    expect(Number(formData.get("elapsedMs"))).toBeGreaterThanOrEqual(0);
    expect(String(formData.get("submissionId"))).toMatch(/^[0-9a-f-]{36}$/);

    expect(await screen.findByRole("status")).toHaveTextContent("Thanks — your message has been sent.");
    expect(screen.getByRole("button", { name: "Send another message" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("reports a delivery failure as an error and keeps what the visitor typed", async () => {
    submitContact.mockResolvedValue({
      status: "error",
      message: "We couldn't send your message just now. Please try again in a few minutes.",
      fieldErrors: {},
      values: {
        name: "Alex Rivera",
        email: "alex@example.com",
        company: "",
        service: "web-development",
        message: "We need a customer portal.",
      },
    } satisfies ContactState);
    const user = userEvent.setup();
    render(<ContactForm deliveryAvailable />);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/couldn't send your message/i)).toBeInTheDocument();
    expect(screen.queryByText(/has been sent/i)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Alex Rivera"));
    expect(screen.getByLabelText("Project description")).toHaveValue("We need a customer portal.");
    // Regression: React's post-action form reset used to blank the select, which then blocked the retry.
    expect(screen.getByLabelText("Service of interest")).toHaveValue("web-development");
    expect(screen.getByRole("button", { name: /send message/i })).toBeEnabled();
  });

  it("prevents duplicate submissions while a request is pending", async () => {
    let finish!: (state: ContactState) => void;
    submitContact.mockImplementation(() => new Promise<ContactState>((resolve) => (finish = resolve)));
    const user = userEvent.setup();
    render(<ContactForm deliveryAvailable />);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    const pending = await screen.findByRole("button", { name: /sending/i });
    expect(pending).toBeDisabled();
    await user.click(pending);
    await user.keyboard("{Enter}");
    expect(submitContact).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish({ status: "success", message: "Thanks.", fieldErrors: {}, values: {} });
    });
  });
});
