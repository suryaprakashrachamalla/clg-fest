import { Metadata } from "next";
import { listPublicEvents } from "@/lib/events";
import EventsCatalogueClient from "./events-catalogue-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events & Competitions · Sangamam 2026",
  description:
    "Explore the complete lineup of flagship hackathons, technical paper presentation tracks, collegiate music flash mobs, and stand-up comedy at MVSR Sangamam 2026.",
};

export default async function EventsPage() {
  const events = await listPublicEvents();

  return <EventsCatalogueClient initialEvents={events} />;
}
