import type { Event } from "@prisma/client";

/**
 * Server-authoritative pricing. The client may *display* the same calculation,
 * but the amount charged is always recomputed here from DB values.
 */
export function computeAmount(event: Pick<Event, "fee" | "pricingMode" | "participationType">, teamSize: number) {
  const seats = event.participationType === "TEAM" ? teamSize : 1;
  return event.pricingMode === "PER_PARTICIPANT" ? event.fee * seats : event.fee;
}

export function formatINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);
}
