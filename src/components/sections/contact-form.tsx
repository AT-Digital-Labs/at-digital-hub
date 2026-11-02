"use client";

import { CircleAlert, CircleCheck, ChevronDown, LoaderCircle } from "lucide-react";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { ArrowIcon, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { submitContact } from "@/lib/contact/actions";
import { PRESELECT_EVENT } from "@/lib/contact/preselect";
import {
  CONTACT_LIMITS,
  validateContact,
  type ContactField,
  type ContactFieldErrors,
} from "@/lib/contact/schema";
import { isServiceValue, serviceOptions } from "@/lib/contact/services";
import { initialContactState, type ContactState } from "@/lib/contact/types";

import { TurnstileWidget } from "./turnstile-widget";

const inputStyles =
  "block w-full border bg-paper px-3.5 text-base text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

interface FieldProps {
  name: ContactField;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (props: { id: string; invalid: boolean; describedBy: string | undefined }) => ReactNode;
}

function Field({ name, label, optional, hint, error, children }: FieldProps) {
  const id = useId();
  const inputId = `${id}-${name}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        {optional ? <span className="text-xs font-normal text-muted">Optional</span> : null}
      </label>
      {children({ id: inputId, invalid: Boolean(error), describedBy })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-accent-strong">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function borderFor(invalid: boolean) {
  return invalid ? "border-accent-strong border-2" : "border-field";
}

interface ContactFormProps {
  /** False when delivery credentials aren't configured: the form is shown disabled with a notice. */
  deliveryAvailable: boolean;
  /** Public direct-contact address, only when one has been supplied. */
  directEmail?: string;
  /** Turnstile site key; the form shows a challenge only when one is supplied. */
  captchaSiteKey?: string;
}

export function ContactForm({ deliveryAvailable, directEmail, captchaSiteKey }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(submitContact, initialContactState);

  const formRef = useRef<HTMLFormElement>(null);
  const captchaHintId = `${useId()}-captcha-hint`;
  const selectRef = useRef<HTMLSelectElement>(null);
  const elapsedRef = useRef<HTMLInputElement>(null);
  const submissionIdRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number | null>(null);
  const submissionKey = useRef<string | null>(null);

  const [clientErrors, setClientErrors] = useState<ContactFieldErrors>({});
  // Server errors are dropped per-field once the user edits that field (tied to the state they came from).
  const [edited, setEdited] = useState<{ source: ContactState; fields: ContactField[] }>({
    source: initialContactState,
    fields: [],
  });
  const [acknowledged, setAcknowledged] = useState<ContactState | null>(null);
  // Tokens are single-use: one obtained before the latest server response no longer counts.
  const [captcha, setCaptcha] = useState<{ source: ContactState; token: string | null }>({
    source: initialContactState,
    token: null,
  });

  const editedFields = edited.source === state ? edited.fields : [];
  const errors: ContactFieldErrors = { ...state.fieldErrors, ...clientErrors };
  for (const field of editedFields) if (!(field in clientErrors)) delete errors[field];

  const showSuccess = state.status === "success" && acknowledged !== state;
  const disabled = !deliveryAvailable;
  const captchaRequired = deliveryAvailable && Boolean(captchaSiteKey);
  const awaitingCaptcha = captchaRequired && !(captcha.source === state && captcha.token);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  // Service/product CTAs elsewhere on the page preselect the "Service of interest" field.
  useEffect(() => {
    const onPreselect = (event: Event) => {
      const value = (event as CustomEvent<unknown>).detail;
      if (selectRef.current && isServiceValue(value)) {
        selectRef.current.value = value;
        markEdited("service");
        setClientErrors((current) => omit(current, "service"));
      }
    };
    window.addEventListener(PRESELECT_EVENT, onPreselect);
    return () => window.removeEventListener(PRESELECT_EVENT, onPreselect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // After a failed server validation, move focus to the first invalid field.
  useEffect(() => {
    if (state.status === "error") focusFirstInvalid(formRef.current, state.fieldErrors);
  }, [state]);

  function markEdited(field: ContactField) {
    setEdited((current) => {
      const fields = current.source === state ? current.fields : [];
      return fields.includes(field) ? current : { source: state, fields: [...fields, field] };
    });
  }

  function onFieldChange(event: ChangeEvent<HTMLFormElement>) {
    const { name } = event.target as unknown as HTMLInputElement;
    if (isField(name)) {
      markEdited(name);
      setClientErrors((current) => omit(current, name));
    }
  }

  // Record elapsed fill time and a per-attempt idempotency key just before submission.
  // Updated on any interaction (so a retry after an error has a fresh value), including the Enter key.
  function stampSubmission() {
    if (elapsedRef.current && mountedAt.current !== null) {
      elapsedRef.current.value = String(Math.round(performance.now() - mountedAt.current));
    }
    if (submissionIdRef.current) {
      submissionKey.current ??= crypto.randomUUID();
      submissionIdRef.current.value = submissionKey.current;
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (isPending || disabled || awaitingCaptcha) {
      event.preventDefault();
      return;
    }

    stampSubmission();
    const result = validateContact(new FormData(event.currentTarget));
    if (!result.ok) {
      // Block the server round-trip; the server validates again regardless.
      event.preventDefault();
      setClientErrors(result.errors);
      focusFirstInvalid(event.currentTarget, result.errors);
      return;
    }
    setClientErrors({});
  }

  function sendAnother() {
    submissionKey.current = null; // a new inquiry gets a new idempotency key
    setAcknowledged(state);
  }

  const banner = bannerFor({ state, isPending, deliveryAvailable, directEmail });

  return (
    <div className="bg-paper p-6 text-ink [--focus:var(--color-ink)] sm:p-8 lg:p-10">
      {/* Persistent live region so status changes are announced to assistive tech. */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {banner ? (
          <p
            className={cn(
              "mb-6 flex items-start gap-3 border-l-4 p-4 text-[0.9375rem] font-medium",
              banner.tone === "success" && "border-success bg-[#e8f5ee] text-success",
              banner.tone === "error" && "border-accent-strong bg-accent-tint text-ink",
              banner.tone === "info" && "border-ink bg-surface text-ink",
            )}
          >
            {banner.tone === "success" ? (
              <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            ) : banner.tone === "error" ? (
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent-strong" />
            ) : null}
            <span>{banner.text}</span>
          </p>
        ) : null}
      </div>

      {showSuccess ? (
        <button type="button" onClick={sendAnother} className={buttonStyles("secondary")}>
          Send another message
        </button>
      ) : (
        <form
          ref={formRef}
          action={formAction}
          noValidate
          onSubmit={onSubmit}
          onChange={onFieldChange}
          onPointerDownCapture={stampSubmission}
          onKeyDownCapture={stampSubmission}
          aria-label="Project inquiry"
        >
          <fieldset disabled={disabled} className="min-w-0 space-y-5">
            <p className="text-sm text-muted">All fields are required unless marked optional.</p>

            <Field name="name" label="Name" error={errors.name}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={CONTACT_LIMITS.nameMax}
                  required
                  defaultValue={state.values.name ?? ""}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  className={cn(inputStyles, "h-12", borderFor(invalid))}
                />
              )}
            </Field>

            <Field name="email" label="Email" error={errors.email}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={CONTACT_LIMITS.emailMax}
                  required
                  defaultValue={state.values.email ?? ""}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  className={cn(inputStyles, "h-12", borderFor(invalid))}
                />
              )}
            </Field>

            <Field name="company" label="Company" optional error={errors.company}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  maxLength={CONTACT_LIMITS.companyMax}
                  defaultValue={state.values.company ?? ""}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  className={cn(inputStyles, "h-12", borderFor(invalid))}
                />
              )}
            </Field>

            <Field name="service" label="Service of interest" error={errors.service}>
              {({ id, invalid, describedBy }) => (
                <div className="relative">
                  <select
                    // React's post-action form reset doesn't restore a <select> whose defaultValue changed;
                    // remounting when the echoed value changes re-establishes it (inputs/textarea are fine).
                    key={state.values.service ?? ""}
                    ref={selectRef}
                    id={id}
                    name="service"
                    required
                    defaultValue={state.values.service ?? ""}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={cn(inputStyles, "h-12 appearance-none pr-10", borderFor(invalid))}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {serviceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink"
                  />
                </div>
              )}
            </Field>

            <Field
              name="message"
              label="Project description"
              hint={`Up to ${CONTACT_LIMITS.messageMax.toLocaleString("en-US")} characters.`}
              error={errors.message}
            >
              {({ id, invalid, describedBy }) => (
                <textarea
                  id={id}
                  name="message"
                  rows={6}
                  maxLength={CONTACT_LIMITS.messageMax}
                  required
                  defaultValue={state.values.message ?? ""}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  className={cn(inputStyles, "min-h-40 resize-y py-3 leading-relaxed", borderFor(invalid))}
                />
              )}
            </Field>

            {/* Honeypot: invisible to people, tempting to naive bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Leave this field empty
                <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>
            <input ref={elapsedRef} type="hidden" name="elapsedMs" defaultValue="0" />
            <input ref={submissionIdRef} type="hidden" name="submissionId" defaultValue="" />

            {captchaRequired && captchaSiteKey ? (
              <div>
                <TurnstileWidget
                  siteKey={captchaSiteKey}
                  resetSignal={state}
                  onToken={(token) => setCaptcha({ source: state, token })}
                />
                {awaitingCaptcha && !isPending ? (
                  <p id={captchaHintId} className="mt-1.5 text-xs text-muted">
                    Complete the verification check to send your message.
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending || disabled || awaitingCaptcha}
              aria-disabled={isPending || disabled || awaitingCaptcha}
              aria-describedby={awaitingCaptcha && !isPending ? captchaHintId : undefined}
              className={buttonStyles("primary", "w-full disabled:cursor-not-allowed disabled:border-field disabled:bg-field sm:w-auto")}
            >
              {isPending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <ArrowIcon />
                </>
              )}
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
}

// Visual/tab order of the fields.
const FIELD_ORDER: readonly ContactField[] = ["name", "email", "company", "service", "message"];

function isField(name: string): name is ContactField {
  return (FIELD_ORDER as readonly string[]).includes(name);
}

function omit(errors: ContactFieldErrors, field: ContactField): ContactFieldErrors {
  if (!(field in errors)) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

function focusFirstInvalid(form: HTMLFormElement | null, errors: ContactFieldErrors) {
  if (!form) return;
  const first = FIELD_ORDER.find((field) => errors[field]);
  if (!first) return;
  const element = form.elements.namedItem(first);
  if (element instanceof HTMLElement) element.focus();
}

type Banner = { tone: "success" | "error" | "info"; text: string } | null;

function bannerFor({
  state,
  isPending,
  deliveryAvailable,
  directEmail,
}: {
  state: ContactState;
  isPending: boolean;
  deliveryAvailable: boolean;
  directEmail?: string;
}): Banner {
  if (!deliveryAvailable) {
    const hint = directEmail ? ` You can also email us directly at ${directEmail}.` : "";
    return {
      tone: "info",
      text: `Our online inquiry form is temporarily unavailable. Please check back soon.${hint}`,
    };
  }
  if (isPending) return { tone: "info", text: "Sending your message…" };
  if (state.status === "idle" || !state.message) return null;
  if (state.status === "success") return { tone: "success", text: state.message };
  return { tone: "error", text: state.message };
}
