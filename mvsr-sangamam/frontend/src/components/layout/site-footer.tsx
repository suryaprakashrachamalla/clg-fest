import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { FEST } from "@/config/fest";
import { FooterWordmark } from "./footer-wordmark";

export function SiteFooter() {
  return (
    <footer className="no-print relative border-t border-white/[0.06] bg-ink-950">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <p className="font-display text-lg font-bold text-white">{FEST.name} {FEST.edition}</p>
              <p className="text-xs text-zinc-500">{FEST.college}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-zinc-500">{FEST.tagline} {FEST.dateLabel} · {FEST.locationShort}.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="text-zinc-400 hover:text-white" href="/#events">Events</Link></li>
            <li><Link className="text-zinc-400 hover:text-white" href="/events/hackathon">Hackathon</Link></li>
            <li><Link className="text-zinc-400 hover:text-white" href="/join">Join a Team</Link></li>
            <li><Link className="text-zinc-400 hover:text-white" href="/dashboard">My Registrations</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Reach us</p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#CFB97E]" /><a href={FEST.mapUrl} target="_blank" rel="noreferrer" className="hover:text-white">{FEST.contact.address}</a></li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#CFB97E]" /><a href={`mailto:${FEST.contact.email}`} className="hover:text-white">{FEST.contact.email}</a></li>
          </ul>
        </div>
      </div>
      <FooterWordmark />
      <div className="border-t border-white/[0.05] py-5 text-center text-xs text-zinc-600">
        © {FEST.edition} {FEST.name} · MVSR Engineering College. Payments secured by Razorpay.
      </div>
    </footer>
  );
}
