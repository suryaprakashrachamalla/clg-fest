"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { EASE, Reveal, SectionHeading, Stagger, itemVariants } from "@/components/motion/primitives";

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
  const [openQuestion, setOpenQuestion] = useState<string | null>(FAQS[0].question);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQS.filter(
      (faq) =>
        (selectedCategory === "all" || faq.category === selectedCategory) &&
        (!q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)),
    );
  }, [searchQuery, selectedCategory]);

  return (
    <section className="section container-x">
      <SectionHeading
        eyebrow="Everything you need to know"
        icon={<HelpCircle className="h-3.5 w-3.5 text-[#B89D47]" />}
        title="Frequently Asked"
        accent="Questions"
        sub="Got questions regarding registration, payments, hackathon rules, or campus access? We’ve got answers."
      />

      <Reveal className="mx-auto -mt-6 mb-10 max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. UPI, team, QR pass, refund)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#355E58]/35 bg-[#0A0F16]/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition focus:border-[#B89D47]/60 focus:shadow-[0_0_0_4px_rgba(184,157,71,0.12)] focus:outline-none"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? "font-bold text-black" : "border border-[#355E58]/30 bg-[#0A0F16]/80 text-zinc-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="faq-cat"
                    className="absolute inset-0 rounded-lg bg-[#B89D47] shadow-md shadow-[#B89D47]/20"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <Stagger className="mx-auto max-w-3xl" stagger={0.06}>
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-[#355E58]/20 bg-[#0A0F16]/60 p-8 text-center text-sm text-zinc-400"
              >
                No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another search term or select &apos;All
                Questions&apos;.
              </motion.div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openQuestion === faq.question;
                return (
                  <motion.div
                    key={faq.question}
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                    className={`overflow-hidden rounded-2xl border bg-[#0A0F16]/90 transition-colors duration-300 ${
                      isOpen ? "border-[#B89D47]/45 shadow-[0_0_30px_rgba(184,157,71,0.08)]" : "border-[#355E58]/35 hover:border-[#355E58]/70"
                    }`}
                  >
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : faq.question)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.02]"
                    >
                      <span className="font-display text-base font-bold text-white sm:text-lg">{faq.question}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? "#B89D47" : "#a1a1aa" }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="shrink-0"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                        >
                          <div className="border-t border-white/5 px-5 pb-5 pt-3 text-sm leading-relaxed text-zinc-300">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      </Stagger>
    </section>
  );
}
