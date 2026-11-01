import "server-only";

import { isValidEmail } from "./schema";
import { serviceLabel, type ServiceValue } from "./services";

/**
 * The only module that knows about the email provider (Resend's HTTP API).
 * Swapping providers means replacing this file; callers see `getDeliveryConfig` and `sendInquiry` only.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RECIPIENTS = 5;

export interface DeliveryConfig {
  apiKey: string;
  /** Verified sender, e.g. `AT Digital Hub <inquiries@your-verified-domain>`. */
  from: string;
  to: string[];
}

export interface Inquiry {
  name: string;
  email: string;
  company: string;
  service: ServiceValue;
  message: string;
}

export type DeliveryResult = { ok: true } | { ok: false; reason: "rejected" | "unreachable"; status?: number };

type Env = Readonly<Record<string, string | undefined>>;

function parseSender(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const named = /^([^<>\r\n]{1,100})<([^<>\s]+)>$/.exec(trimmed);
  const address = named?.[2] ?? trimmed;
  return isValidEmail(address) ? trimmed : undefined;
}

function parseRecipients(value: string | undefined): string[] {
  const list = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length > 0 && list.length <= MAX_RECIPIENTS && list.every(isValidEmail) ? list : [];
}

/** Returns a config only when every required value is present and well-formed. */
export function getDeliveryConfig(env: Env = process.env): DeliveryConfig | undefined {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = parseSender(env.CONTACT_FROM_EMAIL);
  const to = parseRecipients(env.CONTACT_TO_EMAIL);
  if (!apiKey || !from || to.length === 0) return undefined;
  return { apiKey, from, to };
}

function singleLine(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function buildInquiryEmail(inquiry: Inquiry): { subject: string; text: string } {
  const subject = `New website inquiry: ${serviceLabel(inquiry.service)} — ${singleLine(inquiry.name, 60)}`;
  const text = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company: ${inquiry.company || "—"}`,
    `Service of interest: ${serviceLabel(inquiry.service)}`,
    "",
    "Message:",
    inquiry.message,
    "",
    "—",
    "Sent from the website inquiry form. Reply to this email to respond to the sender.",
  ].join("\n");
  return { subject, text };
}

export async function sendInquiry(
  config: DeliveryConfig,
  inquiry: Inquiry,
  idempotencyKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  const { subject, text } = buildInquiryEmail(inquiry);

  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        reply_to: inquiry.email,
        subject,
        text,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    return response.ok ? { ok: true } : { ok: false, reason: "rejected", status: response.status };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
