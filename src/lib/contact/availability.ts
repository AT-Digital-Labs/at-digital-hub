import "server-only";

import { getDeliveryConfig } from "./delivery";

/** Whether inquiries can actually be delivered. Evaluated on the server; no values are exposed. */
export function isContactAvailable(): boolean {
  return getDeliveryConfig() !== undefined;
}
