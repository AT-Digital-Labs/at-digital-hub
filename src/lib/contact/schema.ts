import { isServiceValue, type ServiceValue } from "./services";

/** Shared by the form (maxLength attributes, client hints) and the server (authoritative checks). */
export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  companyMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const;

export interface ContactValues {
  name: string;
  email: string;
  company: string;
  service: ServiceValue | "";
  message: string;
}

export type ContactField = keyof ContactValues;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ValidationResult =
  | { ok: true; data: Omit<ContactValues, "service"> & { service: ServiceValue } }
  | { ok: false; errors: ContactFieldErrors; values: ContactValues };

// Control characters (including CR/LF) never belong in single-line fields; blocking them keeps
// user input out of mail header injection territory even though headers are never built from it directly.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const MESSAGE_CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

// Practical (not RFC-exhaustive) address check: one @, no whitespace/quotes/brackets, dotted domain.
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"']+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= CONTACT_LIMITS.emailMax && EMAIL_PATTERN.test(value);
}

function readString(raw: FormData | Record<string, unknown>, key: string): string {
  const value = raw instanceof FormData ? raw.get(key) : raw[key];
  return typeof value === "string" ? value : "";
}

/** Normalizes and validates untrusted input. The same function is the only gate on the server. */
export function validateContact(raw: FormData | Record<string, unknown>): ValidationResult {
  // Control characters are checked on the raw value, before whitespace is collapsed,
  // so CR/LF are rejected rather than silently rewritten.
  const rawName = readString(raw, "name").trim();
  const rawCompany = readString(raw, "company").trim();
  const name = rawName.replace(/\s+/g, " ");
  const email = readString(raw, "email").trim();
  const company = rawCompany.replace(/\s+/g, " ");
  const serviceRaw = readString(raw, "service");
  const message = readString(raw, "message").replace(/\r\n?/g, "\n").trim();

  const errors: ContactFieldErrors = {};

  if (!name) errors.name = "Enter your name.";
  else if (name.length > CONTACT_LIMITS.nameMax) errors.name = `Keep your name under ${CONTACT_LIMITS.nameMax} characters.`;
  else if (CONTROL_CHARS.test(rawName)) errors.name = "Your name contains characters we can't accept.";

  if (!email) errors.email = "Enter your email address.";
  else if (CONTROL_CHARS.test(email) || !isValidEmail(email)) errors.email = "Enter a valid email address, like name@example.com.";

  if (company.length > CONTACT_LIMITS.companyMax) errors.company = `Keep the company name under ${CONTACT_LIMITS.companyMax} characters.`;
  else if (CONTROL_CHARS.test(rawCompany)) errors.company = "The company name contains characters we can't accept.";

  if (!serviceRaw) errors.service = "Choose a service, or pick “Not sure yet”.";
  else if (!isServiceValue(serviceRaw)) errors.service = "Choose one of the listed options.";

  if (!message) errors.message = "Tell us a little about your project.";
  else if (message.length < CONTACT_LIMITS.messageMin)
    errors.message = `Add a little more detail (at least ${CONTACT_LIMITS.messageMin} characters).`;
  else if (message.length > CONTACT_LIMITS.messageMax)
    errors.message = `Keep your message under ${CONTACT_LIMITS.messageMax} characters.`;
  else if (MESSAGE_CONTROL_CHARS.test(message)) errors.message = "Your message contains characters we can't accept.";

  if (Object.keys(errors).length > 0 || !isServiceValue(serviceRaw)) {
    return {
      ok: false,
      errors,
      values: { name, email, company, service: isServiceValue(serviceRaw) ? serviceRaw : "", message },
    };
  }

  return { ok: true, data: { name, email, company, service: serviceRaw, message } };
}
