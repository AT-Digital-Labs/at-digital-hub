import type { ContactFieldErrors, ContactValues } from "./schema";

export type ContactStatus = "idle" | "success" | "error" | "unavailable";

/** Result of a submission, returned to `useActionState`. Never contains secrets. */
export interface ContactState {
  status: ContactStatus;
  message?: string;
  fieldErrors: ContactFieldErrors;
  /** Echoed so the form can repopulate after an error (React resets uncontrolled forms after actions). */
  values: Partial<ContactValues>;
}

export const initialContactState: ContactState = { status: "idle", fieldErrors: {}, values: {} };

/** Minimum time between starting to fill the form and submitting it. Lightweight bot friction only. */
export const MIN_FILL_MS = 3000;

/** Form field the CAPTCHA widget writes its token into (Turnstile's default name). */
export const CAPTCHA_FIELD = "cf-turnstile-response";
