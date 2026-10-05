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

export function formatINR(rupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
