import { describe, expect, it, vi } from "vitest";

import { buildInquiryEmail, getDeliveryConfig, sendInquiry, type DeliveryConfig, type Inquiry } from "./delivery";

const config: DeliveryConfig = {
  apiKey: "re_test_key",
  from: "AT Digital Hub <inquiries@mail.example.com>",
  to: ["inbox@example.com"],
};

const inquiry: Inquiry = {
  name: "Alex Rivera",
  email: "alex@example.com",
  company: "Acme",
  service: "unexoro-demo",
  message: "Interested in a demo.\nSecond line.",
};

describe("getDeliveryConfig", () => {
  const env = {
    RESEND_API_KEY: "re_key",
    CONTACT_FROM_EMAIL: "AT Digital Hub <inquiries@mail.example.com>",
    CONTACT_TO_EMAIL: "a@example.com, b@example.com",
  };

  it("returns a config when everything is present and well-formed", () => {
    expect(getDeliveryConfig(env)).toEqual({
      apiKey: "re_key",
      from: "AT Digital Hub <inquiries@mail.example.com>",
      to: ["a@example.com", "b@example.com"],
    });
  });

  it.each(["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const)("is unavailable without %s", (key) => {
    expect(getDeliveryConfig({ ...env, [key]: "" })).toBeUndefined();
    expect(getDeliveryConfig({ ...env, [key]: undefined })).toBeUndefined();
  });

  it("rejects malformed addresses instead of sending with them", () => {
    expect(getDeliveryConfig({ ...env, CONTACT_TO_EMAIL: "not-an-address" })).toBeUndefined();
    expect(getDeliveryConfig({ ...env, CONTACT_FROM_EMAIL: "Name <broken>" })).toBeUndefined();
  });
});

describe("buildInquiryEmail", () => {
  it("keeps the subject on a single line", () => {
    const { subject } = buildInquiryEmail({ ...inquiry, name: "Alex\r\nBcc: x@example.com" });
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("includes the message and the service label in the body", () => {
    const { text, subject } = buildInquiryEmail(inquiry);
    expect(text).toContain("Interested in a demo.");
    expect(text).toContain("Unexoro Product Demo");
    expect(subject).toContain("Unexoro Product Demo");
  });
});

describe("sendInquiry", () => {
  it("posts to the provider with auth, idempotency key and the visitor as Reply-To", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));

    const result = await sendInquiry(config, inquiry, "11111111-1111-4111-8111-111111111111", fetchMock);

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_test_key");
    expect(headers["Idempotency-Key"]).toBe("11111111-1111-4111-8111-111111111111");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.from).toBe(config.from);
    expect(body.to).toEqual(config.to);
    expect(body.reply_to).toBe("alex@example.com");
  });

  it("reports provider rejections as failures, never as success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 422 }));
    expect(await sendInquiry(config, inquiry, "k", fetchMock)).toEqual({ ok: false, reason: "rejected", status: 422 });
  });

  it("reports network errors and timeouts as failures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    expect(await sendInquiry(config, inquiry, "k", fetchMock)).toEqual({ ok: false, reason: "unreachable" });
  });
});
