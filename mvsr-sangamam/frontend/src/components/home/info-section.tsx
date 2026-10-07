import { Building2, Clock, Mail, Navigation } from "lucide-react";
import { FEST } from "@/config/fest";

export function InfoSection() {
  const { info, contact, mapUrl } = FEST;
  return (
    <section id="info" className="container-x py-16" aria-label="Fest information">
      <div className="grid gap-5 md:grid-cols-3">
        <article className="panel flex flex-col p-7">
          <div className="icon-tile">
            <Building2 className="h-6 w-6 text-gold" aria-hidden />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Campus Address</h2>
          <address className="mt-4 not-italic leading-relaxed text-zinc-300">
            {info.addressLines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <div className="mt-auto pt-8">
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full py-3">
              <Navigation className="h-4 w-4" aria-hidden />
              Get Google Maps Directions
            </a>
          </div>
        </article>

        <article className="panel flex flex-col p-7">
          <div className="icon-tile">
            <Mail className="h-6 w-6 text-gold" aria-hidden />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Registration Helpdesk</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">{info.helpdeskText}</p>
          <a href={`mailto:${contact.email}`} className="mt-4 font-semibold text-gold hover:underline">
            {contact.email}
          </a>
          <div className="mt-auto pt-8">
            <a href={`mailto:${contact.email}`} className="btn-ghost w-full py-3">
              <Mail className="h-4 w-4" aria-hidden />
              Send Email
            </a>
          </div>
        </article>

        <article className="panel flex flex-col p-7">
          <div className="icon-tile">
            <Clock className="h-6 w-6 text-fest-coral" aria-hidden />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Fest Hours</h2>
          <dl className="mt-4 space-y-3">
            {info.hours.map((h) => (
              <div key={h.day}>
                <dt className="font-semibold text-white">{h.day}:</dt>
                <dd className="text-zinc-300">{h.time}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto pt-8">
            <p className="rounded-xl border border-white/10 bg-night-800 px-4 py-3 text-center text-sm text-zinc-400">
              {info.helpdeskNote}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
