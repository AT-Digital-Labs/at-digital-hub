import "server-only";

import { randomUUID } from "node:crypto";

import { siteConfig } from "@/lib/site-config";

import { getDeliveryConfig, sendInquiry, type DeliveryConfig, type DeliveryResult, type Inquiry } from "./delivery";
import { validateContact } from "./schema";
import { MIN_FILL_MS, type ContactState } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface InquiryDeps {
  getConfig: () => DeliveryConfig | undefined;
  send: (config: DeliveryConfig, inquiry: Inquiry, idempotencyKey: string) => Promise<DeliveryResult>;
}

const defaultDeps: InquiryDeps = {
  getConfig: () => getDeliveryConfig(),
  send: (config, inquiry, key) => sendInquiry(config, inquiry, key),
};

function directContactHint(): string {
  const email = siteConfig.contact.publicEmail;
  return email ? ` You can also email us directly at ${email}.` : "";
}

export function unavailableState(): ContactState {
  return {
    status: "unavailable",
    message: `Our online inquiry form is temporarily unavailable.${directContactHint()}`,
    fieldErrors: {},
    values: {},
  };
}

/**
 * Handles one submission. Nothing here is rate limiting: the honeypot and minimum fill time only
 * filter naive automated posts, and the idempotency key stops accidental double delivery.
 * User input is never logged.
 */
export async function processInquiry(formData: FormData, deps: InquiryDeps = defaultDeps): Promise<ContactState> {
  const config = deps.getConfig();
  if (!config) return unavailableState();

  // Honeypot: real visitors never see or fill this field. Answer neutrally and deliver nothing.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", message: "Thanks — your message has been sent.", fieldErrors: {}, values: {} };
  }

  const validation = validateContact(formData);

  // Minimum completion time, measured in the browser (monotonic, so unaffected by clock skew) and
  // checked here. A missing or too-small value means the form was not filled in by a person using it.
  const elapsed = Number(formData.get("elapsedMs"));
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return {
      status: "error",
      message: "That was quick. Please review your details and send again.",
      fieldErrors: validation.ok ? {} : validation.errors,
      values: validation.ok ? validation.data : validation.values,
    };
  }

  if (!validation.ok) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and send again.",
      fieldErrors: validation.errors,
      values: validation.values,
    };
  }

  const submittedKey = formData.get("submissionId");
  const idempotencyKey = typeof submittedKey === "string" && UUID_PATTERN.test(submittedKey) ? submittedKey : randomUUID();

  const result = await deps.send(config, validation.data, idempotencyKey);

  if (!result.ok) {
    // Metadata only — no names, addresses or message content.
    console.error("[contact] delivery failed", { reason: result.reason, status: result.status });
    return {
      status: "error",
      message: `We couldn't send your message just now. Please try again in a few minutes.${directContactHint()}`,
      fieldErrors: {},
      values: validation.data,
    };
  }

  return {
    status: "success",
    message: "Thanks — your message has been sent. We'll reply to the email address you provided.",
    fieldErrors: {},
    values: {},
  };
}
