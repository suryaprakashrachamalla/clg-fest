"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import CSEIntroSequence from "./CSEIntroSequence";
import DigitalBackground from "./DigitalBackground";
import FuturisticHero from "./FuturisticHero";
import EventCategoriesSection from "./EventCategoriesSection";
import TechRailNav from "./TechRailNav";
import RegistrationModal from "./RegistrationModal";
import FestMarquee from "./FestMarquee";
import { ALL_EVENTS_DATA, EventItemData } from "@/config/flagship-events";
import { AboutSection } from "./about-section";
import { ScheduleSection } from "./schedule-section";
import { FaqSection } from "./faq-section";
import { ContactSection } from "./contact-section";
import { soundFx } from "@/utils/audio";
import { scrollToId } from "@/components/motion/smooth-scroll";
import { SectionDivider } from "@/components/motion/primitives";

const SCHEDULE_EVENTS = ALL_EVENTS_DATA.map((e) => ({
  ...e,
  name: e.title,
  startsAt: e.slug.includes("comedy")
    ? "2026-10-17T18:00:00+05:30"
    : e.slug.includes("music")
      ? "2026-10-16T16:30:00+05:30"
      : "2026-10-16T10:00:00+05:30",
  participationType: e.slug.includes("comedy") ? "INDIVIDUAL" : "TEAM",
  minTeamSize: e.slug.includes("comedy") ? 1 : 2,
  maxTeamSize: e.slug.includes("music") ? 6 : e.slug.includes("comedy") ? 1 : 4,
  feePerParticipantPaise: 20000,
  accentColor: e.category === "TECHNICAL" ? "gold" : e.category === "SEMITECHNICAL" ? "sage" : "coral",
})) as any;

export default function SangamamExperience() {
  const [introActive, setIntroActive] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItemData | null>(null);
  const [modalMode, setModalMode] = useState<"register" | "rules">("register");

  const handleIntroComplete = useCallback(() => {
    setIntroActive(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleOpenRegister = (eventSlug?: string) => {
    soundFx.playClickTone();
    const match = eventSlug ? ALL_EVENTS_DATA.find((e) => e.slug.includes(eventSlug)) : undefined;
    setSelectedEvent(match ?? ALL_EVENTS_DATA[0]);
    setModalMode("register");
  };

  const handleViewDetails = (event: EventItemData) => {
    soundFx.playClickTone();
    setSelectedEvent(event);
    setModalMode("rules");
  };

  return (
    <div className="relative min-h-screen bg-[#08090E] text-white selection:bg-[#D4AF37]/30 selection:text-white">
      {introActive && <CSEIntroSequence onComplete={handleIntroComplete} />}

      <DigitalBackground />

      <TechRailNav visible={!introActive} />

      <div
        className={`relative z-10 overflow-x-clip transition-opacity duration-700 ${
          introActive ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <FuturisticHero
          ready={!introActive}
          onExploreEvents={() => scrollToId("events")}
          onOpenRegister={() => handleOpenRegister("hackathon")}
          onReplayIntro={() => setIntroActive(true)}
        />

        <FestMarquee />

        <div id="events">
          <EventCategoriesSection
            onViewDetails={handleViewDetails}
            onRegister={(e) => {
              setSelectedEvent(e);
              setModalMode("register");
            }}
          />
        </div>

        <SectionDivider />

        <div id="schedule">
          <ScheduleSection events={SCHEDULE_EVENTS} />
        </div>

        <SectionDivider />

        <div id="about">
          <AboutSection />
        </div>

        <SectionDivider />

        <div id="faqs">
          <FaqSection />
        </div>

        <SectionDivider />

        <div id="contact">
          <ContactSection />
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <RegistrationModal
            key={selectedEvent.id}
            event={selectedEvent}
            initialMode={modalMode}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
