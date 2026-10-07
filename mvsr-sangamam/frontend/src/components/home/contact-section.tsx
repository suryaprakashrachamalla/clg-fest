"use client";

import { motion } from "motion/react";
import { Mail, Navigation, Clock, Building2 } from "lucide-react";
import { FEST } from "@/config/fest";
import { SectionHeading, Stagger, StaggerItem } from "@/components/motion/primitives";

function ContactCard({
  icon,
  iconColor,
  title,
  children,
  footer,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#355E58]/35 bg-[#0A0F16]/90 p-6 backdrop-blur-xl transition-colors duration-300 hover:border-[#D4AF37]/40 hover:shadow-[0_20px_60px_-20px_rgba(212,175,55,0.25)] sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-transform duration-700 group-hover:scale-x-100" />
      <div className="space-y-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#355E58] bg-[#053229] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
          style={{ color: iconColor }}
        >
          {icon}
        </div>
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        {children}
      </div>
      {footer}
    </motion.div>
  );
}

export function ContactSection() {
  return (
    <section className="section container-x">
      <SectionHeading
        eyebrow="Get in touch & venue"
        title="Contact &"
        accent="Location"
        sub="Need help with registrations, group bookings, or directions to the campus? Our student and faculty conveners are here to help."
      />

      <Stagger className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3" stagger={0.14}>
        <StaggerItem className="h-full">
          <ContactCard
            icon={<Building2 className="h-6 w-6" />}
            iconColor="#B89D47"
            title="Campus Address"
            footer={
              <a
                href={FEST.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost mt-6 flex items-center justify-center gap-2 text-xs hover:border-[#CFB97E]"
              >
                <Navigation className="h-4 w-4 text-[#CFB97E]" />
                Get Google Maps Directions
              </a>
            }
          >
            <p className="text-sm leading-relaxed text-zinc-300">
              Maturi Venkata Subba Rao (MVSR) Engineering College
              <br />
              Nadergul, Balapur Mandal,
              <br />
              Hyderabad, Telangana 501510
            </p>
          </ContactCard>
        </StaggerItem>

        <StaggerItem className="h-full">
          <ContactCard
            icon={<Mail className="h-6 w-6" />}
            iconColor="#CFB97E"
            title="Registration Helpdesk"
            footer={
              <a
                href={`mailto:${FEST.contact.email}`}
                className="btn-ghost mt-6 flex items-center justify-center gap-2 text-xs hover:border-[#CFB97E]"
              >
                <Mail className="h-4 w-4 text-[#CFB97E]" />
                Send Email
              </a>
            }
          >
            <p className="text-sm leading-relaxed text-zinc-300">
              Have questions regarding payment verification, QR code tickets, or team invitations? Drop an email to our
              tech team.
            </p>
            <div className="truncate text-sm font-semibold text-[#CFB97E]">{FEST.contact.email}</div>
          </ContactCard>
        </StaggerItem>

        <StaggerItem className="h-full">
          <ContactCard
            icon={<Clock className="h-6 w-6" />}
            iconColor="#FE9179"
            title="Fest Hours"
            footer={
              <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center text-xs text-zinc-400">
                Helpdesk open at Main Gate throughout fest days
              </div>
            }
          >
            <div className="space-y-2 text-sm text-zinc-300">
              <div>
                <strong className="block text-white">Day 1 ({FEST.days[0].label}):</strong>
                09:00 AM – Overnight (Hackathon)
              </div>
              <div>
                <strong className="block text-white">Day 2 ({FEST.days[1].label}):</strong>
                09:00 AM – 07:00 PM (Closing Ceremony)
              </div>
            </div>
          </ContactCard>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
