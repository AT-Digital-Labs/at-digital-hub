import "server-only";

/**
 * The only module that knows about the CAPTCHA provider (Cloudflare Turnstile's siteverify API).
 * Optional: when either key is missing the form runs without a challenge (honeypot and fill time only).
 */

const SITEVERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const REQUEST_TIMEOUT_MS = 10_000;
/** Turnstile tokens are at most 2048 characters. */
const MAX_TOKEN_LENGTH = 2048;

export interface CaptchaConfig {
  /** Public; rendered into the page. */
  siteKey: string;
  /** Server-only. */
  secretKey: string;
}

export type CaptchaResult = { ok: true } | { ok: false; reason: "missing" | "rejected" | "unreachable"; status?: number };

type Env = Readonly<Record<string, string | undefined>>;

/** Returns a config only when both keys are present. */
export function getCaptchaConfig(env: Env = process.env): CaptchaConfig | undefined {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secretKey = env.TURNSTILE_SECRET_KEY?.trim();
  if (!siteKey || !secretKey) return undefined;
  return { siteKey, secretKey };
}

/** Verifies a widget token. Fails closed: an unreachable provider is a failure, never a pass. */
export async function verifyCaptcha(
  config: CaptchaConfig,
  token: FormDataEntryValue | null,
  fetchImpl: typeof fetch = fetch,
): Promise<CaptchaResult> {
  if (typeof token !== "string" || token === "" || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, reason: "missing" };
  }

  try {
    const response = await fetchImpl(SITEVERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: config.secretKey, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, reason: "unreachable", status: response.status };

    const outcome = (await response.json()) as { success?: unknown };
    return outcome.success === true ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
