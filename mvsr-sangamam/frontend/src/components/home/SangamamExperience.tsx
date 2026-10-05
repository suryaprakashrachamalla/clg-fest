"use client";

import { useState, useCallback } from "react";
import CSEIntroSequence from "./CSEIntroSequence";
import DigitalBackground from "./DigitalBackground";
import EventCategoriesSection from "./EventCategoriesSection";
import TechRailNav from "./TechRailNav";
import RegistrationModal from "./RegistrationModal";
import { ALL_EVENTS_DATA, EventItemData } from "@/config/flagship-events";
import { AboutSection } from "./about-section";
import { ScheduleSection } from "./schedule-section";
import { FaqSection } from "./faq-section";
import { ContactSection } from "./contact-section";
import { soundFx } from "@/utils/audio";

export default function SangamamExperience() {
  const [introActive, setIntroActive] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItemData | null>(null);
  const [modalMode, setModalMode] = useState<"register" | "rules">("register");

  // Handle intro completion
  const handleIntroComplete = useCallback(() => {
    setIntroActive(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleOpenRegister = (eventSlug?: string) => {
    soundFx.playClickTone();
    if (eventSlug) {
      const match = ALL_EVENTS_DATA.find((e) => e.slug.includes(eventSlug));
      if (match) {
        setSelectedEvent(match);
        setModalMode("register");
        return;
      }
    }
    // Default to flagship hackathon
    setSelectedEvent(ALL_EVENTS_DATA[0]);
    setModalMode("register");
  };

  const handleViewDetails = (event: EventItemData) => {
    soundFx.playClickTone();
    setSelectedEvent(event);
    setModalMode("rules");
  };

  return (
    <div className="relative min-h-screen bg-[#05070D] text-white selection:bg-[#B89D47] selection:text-black">
      {/* 1. Cinematic Photo Intro Sequence */}
      {introActive && <CSEIntroSequence onComplete={handleIntroComplete} />}

      {/* 2. Evolving Digital Environmental Background */}
      <DigitalBackground />

      {/* 3. HUD Side Navigation Rail */}
      <TechRailNav />

      {/* 4. Main Page Content Container */}
      <div
        className={`relative z-10 transition-opacity duration-700 ${
          introActive ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Main Flagship Event Categories (Technical, Semitechnical, Cultural) */}
        <div id="events" className="pt-24 sm:pt-28">
          <EventCategoriesSection
            onViewDetails={handleViewDetails}
            onRegister={(e) => {
              setSelectedEvent(e);
              setModalMode("register");
            }}
          />
        </div>

        {/* Schedule & Timelines */}
        <div id="schedule">
          <ScheduleSection
            events={
              ALL_EVENTS_DATA.map((e) => ({
                ...e,
                startsAt:
                  e.slug.includes("comedy")
                    ? "2026-10-18T18:00:00+05:30"
                    : e.slug.includes("music")
                    ? "2026-10-17T16:30:00+05:30"
                    : "2026-10-17T10:00:00+05:30",
                participationType: e.slug.includes("comedy") ? "INDIVIDUAL" : "TEAM",
                minTeamSize: e.slug.includes("comedy") ? 1 : 2,
                maxTeamSize: e.slug.includes("music") ? 6 : e.slug.includes("comedy") ? 1 : 4,
                feePerParticipantPaise: 20000,
                accentColor: e.category === "TECHNICAL" ? "gold" : e.category === "SEMITECHNICAL" ? "sage" : "coral",
              })) as any
            }
          />
        </div>

        {/* About MVSR & Sangamam */}
        <div id="about">
          <AboutSection />
        </div>

        {/* Frequently Asked Questions */}
        <div id="faq">
          <FaqSection />
        </div>

        {/* Contact & Venue */}
        <div id="contact">
          <ContactSection />
        </div>
      </div>

      {/* 5. Clean, Usable Registration & Rules Modal */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          initialMode={modalMode}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
