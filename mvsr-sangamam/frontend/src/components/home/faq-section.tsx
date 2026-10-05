"use client";

import { useState, useMemo } from "react";
import { ChevronDown, HelpCircle, Search, Filter } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: "all" | "registration" | "payments" | "hackathon" | "checkin";
}

const FAQS: FaqItem[] = [
  {
    category: "registration",
    question: "Who can participate?",
    answer:
      "MVSR Sangamam is open to all bona fide undergraduate and postgraduate students from any recognized college or university across India. A valid college student ID card or bonafide certificate is required at venue check-in.",
  },
  {
    category: "registration",
    question: "How do I register?",
    answer:
      "Select an event from the Events catalog, click 'Register Now', fill in your participant details (and team details if applicable), and proceed to the secure Razorpay payment gateway. Once verified, you instantly receive your unique Registration ID and QR Code pass.",
  },
  {
    category: "payments",
    question: "How does payment work?",
    answer:
      "All payments are handled securely through Razorpay supporting UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, and Wallets. Registrations are confirmed only after cryptographic server-side signature verification.",
  },
  {
    category: "registration",
    question: "Can I register for multiple events?",
    answer:
      "Yes! You can register for multiple events provided their schedule and timings do not overlap. Each event registration generates its own individual confirmation pass and QR code.",
  },
  {
    category: "hackathon",
    question: "How does hackathon team registration work?",
    answer:
      "The hackathon has a strict limit of 50 teams. Only ONE person—the Team Leader—needs to register and pay upfront for the team slots (₹200 per member). For example, a team of 3 pays ₹600. After successful payment, a unique Team ID and 6-character Invitation Code (e.g., X7K9P2) is generated.",
  },
  {
    category: "hackathon",
    question: "How does the invitation code work?",
    answer:
      "The Team Leader simply copies and shares the invitation code or link with their teammates. Teammates open the 'Join a Team' page, enter the code, and submit their personal details. They do NOT pay again because the leader has already paid for their slot.",
  },
  {
    category: "hackathon",
    question: "Can team members join later?",
    answer:
      "Yes. Teammates can join any time before the event starts using the invitation code, until the paid capacity is reached. Once all member slots (e.g. 4/4) are filled, the invitation code automatically deactivates.",
  },
  {
    category: "checkin",
    question: "What happens after payment?",
    answer:
      "Immediately upon payment verification, you are shown a celebration confirmation screen with your Registration ID, Team Details (if hackathon), and a secure QR Code. You can print the receipt or view it anytime in your Participant Dashboard.",
  },
  {
    category: "checkin",
    question: "How do I access my QR code?",
    answer:
      "Your dynamic QR code is displayed on your confirmation page and stored permanently in your Participant Dashboard. You can view, screenshot, or download the registration pass PDF/printout on your mobile device.",
  },
  {
    category: "checkin",
    question: "How will check-in work at the venue?",
    answer:
      "At the entrance of MVSR campus and individual event halls, organizers scan your QR code with their verification devices. Your registration and payment status are validated live in real-time, and you are checked in. Duplicate check-ins are strictly blocked.",
  },
  {
    category: "payments",
    question: "What happens if payment fails?",
    answer:
      "If a payment fails or is cancelled, your slot is preserved for a grace period so you can retry from your dashboard. If money is debited from your bank account during a network drop, Razorpay webhooks reconcile the payment automatically, or the refund is initiated.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "registration", label: "Registration" },
  { id: "payments", label: "Payments & Fees" },
  { id: "hackathon", label: "Hackathon & Teams" },
  { id: "checkin", label: "Check-in & QR Passes" },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <section id="faqs" className="section container-x">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="eyebrow mb-2 text-[#CFB97E]">
          <HelpCircle className="w-3.5 h-3.5 text-[#B89D47]" />
          EVERYTHING YOU NEED TO KNOW
        </div>
        <h2 className="section-title">
          Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47]">Questions</span>
        </h2>
        <p className="section-sub mx-auto">
          Got questions regarding registration, payments, hackathon rules, or campus access? We’ve got answers.
        </p>

        {/* Live Search and Filters */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions (e.g. UPI, team, QR pass, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0F16]/90 border border-[#355E58]/35 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#B89D47]/60 transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-[#B89D47] text-black font-bold shadow-md shadow-[#B89D47]/20"
                    : "bg-[#0A0F16]/80 text-zinc-400 hover:text-white border border-[#355E58]/30"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0A0F16]/60 border border-[#355E58]/20 text-zinc-400 text-sm">
            No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another search term or select &apos;All Questions&apos;.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0A0F16]/90 border border-[#355E58]/35 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                >
                  <span className="font-display text-base sm:text-lg font-bold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#B89D47]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

