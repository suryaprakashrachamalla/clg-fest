import { MapPin, Mail, Phone, Navigation, Clock, Building2 } from "lucide-react";
import { FEST } from "@/config/fest";

export function ContactSection() {
  return (
    <section id="contact" className="section container-x">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="eyebrow mb-2 text-[#CFB97E]">GET IN TOUCH & VENUE</div>
        <h2 className="section-title">
          Contact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47]">Location</span>
        </h2>
        <p className="section-sub mx-auto">
          Need help with registrations, group bookings, or directions to the campus? Our student and faculty conveners are here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Campus Venue Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0F16]/90 border border-[#355E58]/35 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#053229] border border-[#355E58] flex items-center justify-center text-[#B89D47]">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Campus Address
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Maturi Venkata Subba Rao (MVSR) Engineering College<br />
              Nadergul, Balapur Mandal,<br />
              Hyderabad, Telangana 501510
            </p>
          </div>

          <a
            href={FEST.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs mt-6 flex items-center justify-center gap-2 hover:border-[#CFB97E]"
          >
            <Navigation className="w-4 h-4 text-[#CFB97E]" />
            Get Google Maps Directions
          </a>
        </div>

        {/* Support Helpdesk */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0F16]/90 border border-[#355E58]/35 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#053229] border border-[#355E58] flex items-center justify-center text-[#CFB97E]">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Registration Helpdesk
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Have questions regarding payment verification, QR code tickets, or team invitations? Drop an email to our tech team.
            </p>
            <div className="text-sm font-semibold text-[#CFB97E] truncate">
              {FEST.contact.email}
            </div>
          </div>

          <a
            href={`mailto:${FEST.contact.email}`}
            className="btn-ghost text-xs mt-6 flex items-center justify-center gap-2 hover:border-[#CFB97E]"
          >
            <Mail className="w-4 h-4 text-[#CFB97E]" />
            Send Email
          </a>
        </div>

        {/* Fest Timings & Desk */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0F16]/90 border border-[#355E58]/35 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#053229] border border-[#355E58] flex items-center justify-center text-[#FE9179]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Fest Hours
            </h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <div>
                <strong className="text-white block">Day 1 (17 Oct):</strong>
                09:00 AM – Overnight (Hackathon)
              </div>
              <div>
                <strong className="text-white block">Day 2 (18 Oct):</strong>
                09:00 AM – 07:00 PM (Closing Ceremony)
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400 text-center">
            Helpdesk open at Main Gate throughout fest days
          </div>
        </div>
      </div>
    </section>
  );
}
