import Image from "next/image";
import { Award, Code2, Globe2, Sparkles, Users } from "lucide-react";
import { FEST } from "@/config/fest";

export function AboutSection() {
  return (
    <section id="about" className="section container-x">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Story & Info */}
        <div className="space-y-6">
          <div className="eyebrow text-[#CFB97E]">
            <Sparkles className="w-3.5 h-3.5 text-[#B89D47]" />
            LEGACY OF EXCELLENCE
          </div>

          <h2 className="section-title">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#FE9179]">{FEST.name}</span>
          </h2>

          <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
            MVSR Sangamam is the premier national-level annual techno-cultural symposium organized by{" "}
            <span className="text-white font-semibold">Maturi Venkata Subba Rao (MVSR) Engineering College</span> in Nadergul, Hyderabad. 
          </p>

          <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
            Over the span of two electrifying days on <strong>17th & 18th October</strong>, Sangamam brings together thousands of students, developers, creators, and enthusiasts from across the nation to collaborate, compete, and celebrate technological innovation.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-[#0A0F16]/90 border border-[#355E58]/40">
              <Award className="w-6 h-6 text-[#CFB97E] mb-2" />
              <div className="font-display font-bold text-white text-base">Prestigious Legacy</div>
              <div className="text-xs text-zinc-400 mt-1">40+ years of educational excellence at MVSR</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0F16]/90 border border-[#355E58]/40">
              <Code2 className="w-6 h-6 text-[#B89D47] mb-2" />
              <div className="font-display font-bold text-white text-base">Flagship Hackathon</div>
              <div className="text-xs text-zinc-400 mt-1">50 hand-picked teams battling for ₹50,000</div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Showcase */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#053229]/40 via-[#355E58]/30 to-[#B89D47]/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />
          
          <div className="relative rounded-3xl bg-[#0A0F16]/95 border border-[#355E58]/40 p-8 backdrop-blur-2xl space-y-6 shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-white">MVSR Engineering College</h3>
                <p className="text-xs text-zinc-400">Nadergul, Balapur Mandal, Hyderabad, Telangana</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-zinc-300">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#BCDDDC] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Inter-College Participation:</strong> Open to students from all engineering and arts colleges across India.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe2 className="w-5 h-5 text-[#FE9179] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">World-Class Infrastructure:</strong> High-speed campus Wi-Fi, air-conditioned seminar halls, innovation incubation labs, and spacious open-air theatres.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#B89D47] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Industry Judging:</strong> Panels featuring startup founders, senior software engineers, and alumni leaders.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
