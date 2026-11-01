import { afterEach, describe, expect, it, vi } from "vitest";

import type { DeliveryConfig } from "./delivery";
import { processInquiry, type InquiryDeps } from "./inquiry";

const config: DeliveryConfig = { apiKey: "k", from: "inquiries@mail.example.com", to: ["inbox@example.com"] };

function form(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  const fields: Record<string, string> = {
    name: "Alex Rivera",
    email: "alex@example.com",
    company: "",
    service: "ai-automation",
    message: "We want to automate invoice intake.",
    website: "",
    elapsedMs: "12000",
    submissionId: "22222222-2222-4222-8222-222222222222",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function deps(overrides: Partial<InquiryDeps> = {}): InquiryDeps & { send: ReturnType<typeof vi.fn> } {
  return {
    getConfig: () => config,
    send: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  } as InquiryDeps & { send: ReturnType<typeof vi.fn> };
}

afterEach(() => vi.restoreAllMocks());

describe("processInquiry", () => {
  it("is unavailable (not successful) when delivery isn't configured", async () => {
    const d = deps({ getConfig: () => undefined });
    const state = await processInquiry(form(), d);
    expect(state.status).toBe("unavailable");
    expect(d.send).not.toHaveBeenCalled();
  });

  it("delivers a valid inquiry once, with the client's idempotency key", async () => {
    const d = deps();
    const state = await processInquiry(form(), d);
    expect(state.status).toBe("success");
    expect(d.send).toHaveBeenCalledTimes(1);
    const [, inquiry, key] = d.send.mock.calls[0]!;
    expect(inquiry).toMatchObject({ email: "alex@example.com", service: "ai-automation" });
    expect(key).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("replaces a malformed idempotency key with a generated one", async () => {
    const d = deps();
    await processInquiry(form({ submissionId: "not-a-uuid\r\nX: y" }), d);
    const [, , key] = d.send.mock.calls[0]!;
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("silently drops honeypot submissions without sending", async () => {
    const d = deps();
    const state = await processInquiry(form({ website: "http://spam.example" }), d);
    expect(d.send).not.toHaveBeenCalled();
    expect(state.status).toBe("success");
  });

  it.each([["0"], ["1500"], ["abc"], [""]])("rejects a submission completed too fast or without timing (%j)", async (elapsedMs) => {
    const d = deps();
    const state = await processInquiry(form({ elapsedMs }), d);
    expect(state.status).toBe("error");
    expect(d.send).not.toHaveBeenCalled();
    // The visitor's input is returned so they can simply resubmit.
    expect(state.values.name).toBe("Alex Rivera");
  });

  it("returns field errors and sends nothing for invalid input", async () => {
    const d = deps();
    const state = await processInquiry(form({ email: "nope", message: "short" }), d);
    expect(state.status).toBe("error");
    expect(state.fieldErrors.email).toBeDefined();
    expect(state.fieldErrors.message).toBeDefined();
    expect(d.send).not.toHaveBeenCalled();
  });

  it("surfaces delivery failure as an error, never as success, and logs no personal data", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const d = deps({ send: vi.fn().mockResolvedValue({ ok: false, reason: "rejected", status: 500 }) });

    const state = await processInquiry(form(), d);

    expect(state.status).toBe("error");
    expect(state.message).toMatch(/couldn't send/i);
    expect(state.values.message).toBe("We want to automate invoice intake.");
    const logged = JSON.stringify(consoleError.mock.calls);
    expect(logged).not.toContain("alex@example.com");
    expect(logged).not.toContain("invoice");
    expect(logged).not.toContain("Alex");
  });
});
