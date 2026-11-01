"use server";

import { processInquiry } from "./inquiry";
import type { ContactState } from "./types";

/** Server Action bound to the contact form via `useActionState`. */
export async function submitContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  return processInquiry(formData);
}
