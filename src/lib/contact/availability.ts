import "server-only";

import { getCaptchaConfig } from "./captcha";
import { getDeliveryConfig } from "./delivery";

/** Whether inquiries can actually be delivered. Evaluated on the server; no values are exposed. */
export function isContactAvailable(): boolean {
  return getDeliveryConfig() !== undefined;
}

/** The public Turnstile site key, only when the server can also verify tokens (both keys set). */
export function captchaSiteKey(): string | undefined {
  return getCaptchaConfig()?.siteKey;
}
