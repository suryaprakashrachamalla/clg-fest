import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { PublicEvent } from "@/lib/events";
import { feeLabel, fmtDate, fmtTime, teamSizeLabel } from "@/utils/format";

export function EventCard({ event }: { event: PublicEvent }) {
  const full = event.remaining === 0;
  return (
    <Link
      href={`/events/${event.slug}`}
      className="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-gold/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug group-hover:text-gold">{event.name}</h3>
        <span className="shrink-0 rounded-lg bg-gold/10 px-2 py-1 text-xs font-semibold text-gold">{feeLabel(event)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{event.tagline}</p>

      <ul className="mt-4 space-y-1.5 text-xs text-zinc-400">
        <li className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden />
          {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden />
          {event.venue}
        </li>
        <li className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-gold" aria-hidden />
          {teamSizeLabel(event)}
        </li>
      </ul>

      <div className="mt-auto pt-5 text-sm font-semibold">
        {!event.registrationOpen ? (
          <span className="text-zinc-500">Registrations closed</span>
        ) : full ? (
          <span className="text-rose-300">Slots full</span>
        ) : (
          <span className="text-gold">View &amp; register →</span>
        )}
      </div>
    </Link>
  );
}
