import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicEvent } from "@/lib/events";
import { ALL_EVENTS_DATA, EventItemData } from "@/config/flagship-events";
import { feeLabel } from "@/lib/format";
import EventDetailsClient from "./EventDetailsClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getPublicEvent(params.slug);
  if (!event) return { title: "Event Not Found · Sangamam 2026" };
  return {
    title: `${event.name} · Sangamam 2026`,
    description: event.tagline || event.description,
  };
}

export default async function EventDetailsPage({ params }: { params: { slug: string } }) {
  const event = await getPublicEvent(params.slug);
  if (!event) notFound();

  // Find rich card match in ALL_EVENTS_DATA
  const matched = ALL_EVENTS_DATA.find(
    (e) => e.slug === event.slug || e.slug.includes(event.slug) || event.slug.includes(e.slug)
  );

  const cardData: EventItemData = matched || {
    id: event.id,
    slug: event.slug,
    title: event.name,
    category: (event.category as any) || "TECHNICAL",
    sponsor: `OFFICIAL TRACK · ${event.category}`,
    domain:
      event.category === "TECHNICAL"
        ? "AI, CLOUD & SOFTWARE"
        : event.category === "SEMITECHNICAL"
        ? "ROBOTICS & EMBEDDED"
        : "MUSIC & LIVE STAGE",
    tagline: event.tagline,
    description: event.description,
    teamSizeLabel: event.participationType === "TEAM" ? `Team of up to ${event.maxTeamSize}` : "Individual",
    prizePool: event.prizes?.[0]?.amount
      ? `₹${event.prizes.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}`
      : "₹50,000",
    perks: event.prizes?.[0]?.label || "",
    status: "OPEN",
    venue: event.venue,
    date: "16–17 October 2026",
    time: "Event timings announced on portal",
    highlight: event.tagline,
    entryFee: feeLabel(event),
    rules: event.rules || [],
    specs: [event.category, "In-Person Campus", "National Participation"],
  };

  return <EventDetailsClient event={event} cardData={cardData} />;
}
