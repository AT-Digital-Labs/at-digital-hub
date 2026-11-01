import type { ServiceValue } from "./services";

/** Lets service/product CTAs preselect the contact form's service field without shared global state. */
export const PRESELECT_EVENT = "contact:preselect-service";

export function requestServicePreselect(service: ServiceValue): void {
  window.dispatchEvent(new CustomEvent<ServiceValue>(PRESELECT_EVENT, { detail: service }));
}
