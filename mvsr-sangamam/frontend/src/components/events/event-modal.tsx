"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Calendar, MapPin, Trophy, Users, CheckCircle2, Phone, Mail, ArrowRight, HelpCircle } from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { feeLabel, fmtDate, fmtTime, teamSizeLabel } from "@/lib/format";

interface EventModalProps {
  event: PublicEvent | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (event) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [event, onClose]);

  if (!event) return null;

  const isFull = event.capacity !== null && (event.remaining === 0 || event.remaining === null);
  const isHackathon = event.slug === "hackathon" || event.category === "HACKATHON";

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-ink-900 border border-white/15 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden max-h-[90vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-violet/20 border border-brand-violet/40 text-brand-violet">
                {event.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300">
                {teamSizeLabel(event)}
              </span>
              {event.capacity !== null && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                  {isHackathon ? `Max ${event.capacity} Teams` : `${event.remaining ?? 0} slots remaining`}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              {event.name}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 mt-1">
              {event.tagline}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-ink-950/70 border border-white/10 text-xs">
            <div>
              <span className="text-zinc-400 block mb-1">Date</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                {fmtDate(event.startsAt)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1">Time</span>
              <span className="font-semibold text-white">{fmtTime(event.startsAt)}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1">Venue</span>
              <span className="font-semibold text-white flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-fuchsia shrink-0" />
                {event.venue}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1">Fee</span>
              <span className="font-bold text-white text-sm">{feeLabel(event)}</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">
              About Event
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Eligibility */}
          {event.eligibility && (
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">
                Eligibility
              </h4>
              <p className="text-sm text-zinc-300 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                {event.eligibility}
              </p>
            </div>
          )}

          {/* Rules */}
          {event.rules && event.rules.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">
                Rules & Guidelines
              </h4>
              <ul className="space-y-2 text-sm text-zinc-300">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan mt-0.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prizes */}
          {event.prizes && event.prizes.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">
                Prizes & Rewards
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.prizes.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300">{p.place}</div>
                      <div className="text-sm font-extrabold text-white">
                        {p.amount ? `₹${p.amount.toLocaleString()}` : p.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinators */}
          {event.coordinators && event.coordinators.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">
                Event Coordinators
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.coordinators.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-1">
                    <div className="font-semibold text-white">{c.name}</div>
                    {c.phone && (
                      <div className="text-zinc-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-brand-cyan" /> {c.phone}
                      </div>
                    )}
                    {c.email && (
                      <div className="text-zinc-400 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-brand-fuchsia" /> {c.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <Link
            href={`/events/${event.slug}`}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
          >
            Open Dedicated Page
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-white/5 transition"
            >
              Close
            </button>
            {isFull ? (
              <span className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-500 cursor-not-allowed">
                Slots Full
              </span>
            ) : (
              <Link
                href={`/register/${event.slug}`}
                className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-brand-violet/25"
              >
                Register Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
