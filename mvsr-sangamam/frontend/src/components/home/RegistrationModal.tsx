"use client";

import { useState } from "react";
import { soundFx } from "@/utils/audio";
import { EventItemData } from "@/config/flagship-events";
import { X, Check, Calendar, MapPin, Users, Trophy, DollarSign, ShieldAlert, Sparkles, QrCode, ArrowRight } from "lucide-react";

interface RegistrationModalProps {
  event: EventItemData | null;
  initialMode?: "register" | "rules";
  onClose: () => void;
}

export default function RegistrationModal({
  event,
  initialMode = "register",
  onClose,
}: RegistrationModalProps) {
  const [mode, setMode] = useState<"register" | "rules">(initialMode);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "Maturi Venkata Subba Rao (MVSR) Engineering College",
    rollNumber: "",
    teamName: "",
    member2: "",
    member3: "",
    member4: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccessTone();
    const id = `MVSR-${event.slug.toUpperCase().slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(id);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-[#CFB97E]/30 bg-[#0A0F16] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden my-8">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#CFB97E] font-mono text-xs uppercase tracking-widest mb-1.5">
            <span>{event.category} DOMAIN</span>
            <span>•</span>
            <span className="text-[#BCDDDC] font-bold">STATUS: {event.status}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-cyber text-white">
            {event.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#FFEDD1]/75 mt-1 font-sans">
            {event.tagline} — {event.description}
          </p>
        </div>

        {/* Essential Event Metadata Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#053229]/40 border border-[#355E58]/60 text-xs font-mono mb-6">
          <div className="flex items-center gap-2 text-zinc-300">
            <Trophy className="w-4 h-4 text-[#B89D47] shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">PRIZE POOL</div>
              <div className="font-bold text-[#B89D47]">{event.prizePool}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Users className="w-4 h-4 text-[#BCDDDC] shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">TEAM SIZE</div>
              <div className="font-bold text-white">{event.teamSizeLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <DollarSign className="w-4 h-4 text-[#CFB97E] shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">ENTRY FEE</div>
              <div className="font-bold text-[#CFB97E]">{event.entryFee}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Calendar className="w-4 h-4 text-[#FE9179] shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">SCHEDULE</div>
              <div className="font-bold text-zinc-200">{event.date}</div>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs: [ REGISTER NOW ] vs [ VIEW RULES ] */}
        {!isSubmitted && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-6 font-mono text-xs">
            <button
              onClick={() => {
                soundFx.playClickTone();
                setMode("register");
              }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition ${
                mode === "register"
                  ? "bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black shadow-[0_0_15px_rgba(184,157,71,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              REGISTER NOW
            </button>
            <button
              onClick={() => {
                soundFx.playClickTone();
                setMode("rules");
              }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition ${
                mode === "rules"
                  ? "bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black shadow-[0_0_15px_rgba(184,157,71,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              VIEW RULES & CRITERIA
            </button>
          </div>
        )}

        {/* View Mode: RULES */}
        {mode === "rules" && !isSubmitted && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#355E58]/40 bg-[#053229]/25">
              <h4 className="font-cyber font-bold text-sm text-[#CFB97E] mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#B89D47]" />
                <span>COMPETITION RULES & CODE OF CONDUCT</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed font-sans">
                {event.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
                <li>All participants must carry college ID card for physical on-campus verification.</li>
                <li>Decision of jury and faculty coordinators is final and binding.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <h4 className="font-cyber font-bold text-sm text-[#FFEDD1] mb-2">
                TECHNICAL PREREQUISITES & SPECIFICATIONS
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[#053229]/60 border border-[#355E58] text-xs font-mono text-[#BCDDDC]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClickTone();
                setMode("register");
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black font-cyber font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-[0_0_20px_rgba(184,157,71,0.4)]"
            >
              PROCEED TO REGISTRATION FORM →
            </button>
          </div>
        )}

        {/* View Mode: REGISTRATION FORM */}
        {mode === "register" && !isSubmitted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#FFEDD1]/80 mb-1.5">
                  FULL NAME (TEAM LEAD) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Alex Turing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CFB97E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#FFEDD1]/80 mb-1.5">
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CFB97E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#FFEDD1]/80 mb-1.5">
                  PHONE NUMBER *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CFB97E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#FFEDD1]/80 mb-1.5">
                  ROLL / STUDENT ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="2451-22-733-001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CFB97E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#FFEDD1]/80 mb-1.5">
                COLLEGE / INSTITUTION *
              </label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CFB97E]"
              />
            </div>

            {event.teamSizeLabel.includes("PARTICIPANTS") && (
              <div>
                <label className="block text-xs font-mono text-[#FFEDD1]/80 mb-1.5">
                  TEAM NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="e.g. KernelPanic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CFB97E]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-4 py-3.5 rounded-xl font-cyber font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 shadow-[0_0_30px_rgba(184,157,71,0.5)] transition"
            >
              CONFIRM & GENERATE DIGITAL PASS
            </button>
          </form>
        )}

        {/* Submission Confirmation & Digital E-Ticket Pass */}
        {isSubmitted && (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#053229] border border-[#355E58] text-[#BCDDDC] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#CFB97E]" />
            </div>

            <h3 className="text-2xl font-black font-cyber text-white">
              REGISTRATION CONFIRMED!
            </h3>
            <p className="text-xs text-[#FFEDD1]/75 mt-1 max-w-sm mx-auto">
              Your pass has been secured for {event.title}. Keep this fast-pass QR code ready during fest check-in.
            </p>

            {/* Futuristic E-Ticket Badge */}
            <div className="my-6 p-5 rounded-2xl border border-[#CFB97E]/40 bg-[#053229]/60 max-w-md mx-auto text-left font-mono text-xs shadow-[0_0_25px_rgba(184,157,71,0.2)]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-[#B89D47] font-bold">SANGAMAM 2026 PASS</span>
                <span className="text-[10px] text-[#BCDDDC]">OFFICIAL E-PASS</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-bold text-sm">{formData.fullName}</div>
                  <div className="text-[#FFEDD1] text-[11px]">{event.title}</div>
                  <div className="text-zinc-400 text-[10px] mt-1">{formData.college}</div>
                  <div className="text-[#B89D47] font-bold text-xs mt-2">ID: {ticketId}</div>
                </div>

                <div className="w-20 h-20 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                  <QrCode className="w-16 h-16 text-black" />
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-[#CFB97E]/30 text-xs font-mono text-[#FFEDD1] hover:text-white hover:border-[#CFB97E] transition"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
