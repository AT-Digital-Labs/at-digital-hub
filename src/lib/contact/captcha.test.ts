import { describe, expect, it, vi } from "vitest";

import { getCaptchaConfig, verifyCaptcha, type CaptchaConfig } from "./captcha";

const config: CaptchaConfig = { siteKey: "site-key", secretKey: "secret-key" };

function respond(body: unknown, init: ResponseInit = { status: 200 }) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), init));
}

describe("getCaptchaConfig", () => {
  const env = { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key", TURNSTILE_SECRET_KEY: "secret-key" };

  it("returns both keys when present", () => {
    expect(getCaptchaConfig(env)).toEqual(config);
  });

  it.each(["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] as const)("is off without %s", (key) => {
    expect(getCaptchaConfig({ ...env, [key]: "" })).toBeUndefined();
    expect(getCaptchaConfig({ ...env, [key]: undefined })).toBeUndefined();
  });
});

describe("verifyCaptcha", () => {
  it("posts the secret and token to siteverify and passes on success", async () => {
    const fetchImpl = respond({ success: true });
    await expect(verifyCaptcha(config, "token-123", fetchImpl)).resolves.toEqual({ ok: true });

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(JSON.parse(init.body)).toEqual({ secret: "secret-key", response: "token-123" });
  });

  it.each([[null], [""], ["x".repeat(2049)]])("treats a missing or oversized token (%#) as missing, without calling out", async (token) => {
    const fetchImpl = vi.fn();
    await expect(verifyCaptcha(config, token, fetchImpl)).resolves.toEqual({ ok: false, reason: "missing" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects a token the provider doesn't accept", async () => {
    const fetchImpl = respond({ success: false, "error-codes": ["invalid-input-response"] });
    await expect(verifyCaptcha(config, "bad", fetchImpl)).resolves.toEqual({ ok: false, reason: "rejected" });
  });

  it("fails closed on a provider error status", async () => {
    const fetchImpl = respond({}, { status: 503 });
    await expect(verifyCaptcha(config, "t", fetchImpl)).resolves.toEqual({ ok: false, reason: "unreachable", status: 503 });
  });

  it("fails closed when the provider can't be reached", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("network down"));
    await expect(verifyCaptcha(config, "t", fetchImpl)).resolves.toEqual({ ok: false, reason: "unreachable" });
  });
});
