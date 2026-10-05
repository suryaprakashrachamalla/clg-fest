export interface PricingEvent {
  fee: number;
  pricingMode: string;
  participationType: string;
}

/**
 * Client display pricing calculation mirror.
 */
export function computeAmount(event: PricingEvent, teamSize: number) {
  const seats = event.participationType === "TEAM" ? teamSize : 1;
  return event.pricingMode === "PER_PARTICIPANT" ? event.fee * seats : event.fee;
}

export function formatINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);
}
