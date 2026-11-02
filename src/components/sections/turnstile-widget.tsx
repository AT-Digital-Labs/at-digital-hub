"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

import { CAPTCHA_FIELD } from "@/lib/contact/types";

interface TurnstileOptions {
  sitekey: string;
  "response-field-name": string;
  theme: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileWidgetProps {
  siteKey: string;
  /** Receives a fresh token, or null when it expires or the challenge errors. */
  onToken: (token: string | null) => void;
  /** Changing this resets the challenge; tokens are single-use, so each attempt needs a new one. */
  resetSignal: unknown;
}

/**
 * Cloudflare Turnstile, rendered explicitly so it can be removed and re-created with the form.
 * The widget writes its token into a hidden input named `CAPTCHA_FIELD` inside the container.
 */
export function TurnstileWidget({ siteKey, onToken, resetSignal }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const lastReset = useRef(resetSignal);

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  function mount() {
    const api = window.turnstile;
    if (!api || !containerRef.current || widgetId.current !== null) return;
    widgetId.current = api.render(containerRef.current, {
      sitekey: siteKey,
      "response-field-name": CAPTCHA_FIELD,
      theme: "light",
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });
  }

  // Mount when the script is already loaded (e.g. the form re-appears after "Send another message").
  useEffect(() => {
    mount();
    return () => {
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  useEffect(() => {
    if (lastReset.current === resetSignal) return;
    lastReset.current = resetSignal;
    if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
  }, [resetSignal]);

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={mount} />
      <div ref={containerRef} className="min-h-[65px]" />
    </>
  );
}
