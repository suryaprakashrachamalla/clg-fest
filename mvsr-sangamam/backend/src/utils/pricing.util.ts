import { Event } from "@prisma/client";

/**
 * Server-authoritative fee computation.
 */
export function computeAmount(
  event: Pick<Event, "fee" | "pricingMode" | "participationType">,
  teamSize: number
): number {
  const seats = event.participationType === "TEAM" ? teamSize : 1;
  return event.pricingMode === "PER_PARTICIPANT" ? event.fee * seats : event.fee;
}

