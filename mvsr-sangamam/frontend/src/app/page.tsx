import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { FEST } from "@/config/fest";
import { EVENT_GROUPS, groupOf, listEvents } from "@/lib/events";
import { EventCard } from "@/components/events/event-card";
import { InfoSection } from "@/components/home/info-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listEvents();

  return (
    <>
      <section className="bg-grid border-b border-white/5">
        <div className="container-x py-16 text-center sm:py-24">
          <p className="eyebrow">MVSR Engineering College presents</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl">
            Sangam<span className="text-gold">am</span> {FEST.edition}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">{FEST.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-300">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gold" aria-hidden />
              {FEST.dateLabel}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" aria-hidden />
              {FEST.locationShort}
            </span>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="#events" className="btn-primary px-6 py-3">
              Explore events
            </Link>
            <Link href="#info" className="btn-ghost px-6 py-3">
              Fest info
            </Link>
          </div>
        </div>
      </section>

      <section id="events" className="container-x scroll-mt-20 py-16">
        <div className="mb-10 text-center">
          <p className="eyebrow">Events</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Pick your stage</h2>
        </div>

        {events.length === 0 ? (
          <p className="panel p-8 text-center text-zinc-400">
            Events are being loaded. Please check back in a little while.
          </p>
        ) : (
          <div className="panel grid gap-8 p-5 sm:p-8 lg:grid-cols-3">
            {EVENT_GROUPS.map((g) => {
              const list = events.filter((e) => groupOf(e) === g.key);
              return (
                <div key={g.key} id={g.key} className="flex flex-col">
                  <div className="mb-4 text-center">
                    <h3 className="text-2xl font-bold">{g.label}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{g.blurb}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    {list.length === 0 ? (
                      <p className="card p-5 text-center text-sm text-zinc-500">Events coming soon.</p>
                    ) : (
                      list.map((e) => <EventCard key={e.id} event={e} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <InfoSection />
    </>
  );
}
