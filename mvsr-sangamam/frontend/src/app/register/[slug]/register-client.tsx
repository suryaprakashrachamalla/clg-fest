"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { computeAmount, formatINR } from "@/utils/pricing";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { fmtDate, fmtTime } from "@/utils/format";

interface Props {
  event: PublicEvent;
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    studentId: string;
  };
}

export function RegisterClient({ event, currentUser }: Props) {
  const router = useRouter();
  const isTeam = event.participationType === "TEAM";
  const isHackathon = event.slug === "hackathon" || event.category === "HACKATHON";

  // Form states
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState<number>(
    isHackathon ? 3 : event.minTeamSize || 1
  );

  const [fullName, setFullName] = useState(currentUser.name || "");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [college, setCollege] = useState(currentUser.college || "MVSR Engineering College");
  const [studentId, setStudentId] = useState(currentUser.studentId || "");

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sandboxModal, setSandboxModal] = useState<any | null>(null);

  const simulateSuccess = async () => {
    if (!sandboxModal) return;
    setSubmitting(true);
    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: sandboxModal.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature",
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");
      router.push(`/registration/${verifyData.registrationId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to confirm payment");
      setSubmitting(false);
    }
  };

  const simulateFailure = async () => {
    if (!sandboxModal) return;
    await fetch("/api/payments/failure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: sandboxModal.orderId,
        kind: "cancelled",
        reason: "User cancelled simulation",
      }),
    }).catch(() => {});
    setSandboxModal(null);
    setErrorMsg("Payment was cancelled. You can retry payment anytime before slot expiry.");
  };

  // Dynamic fee calculation
  const totalAmount = computeAmount(
    { fee: event.fee, pricingMode: event.pricingMode, participationType: event.participationType },
    teamSize
  );

  // Validation
  const validateStep1 = () => {
    setErrorMsg(null);
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return false;
    }
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return false;
    }
    if (!college.trim() || college.trim().length < 2) {
      setErrorMsg("Please enter your college name.");
      return false;
    }
    if (event.requiresStudentId && !studentId.trim()) {
      setErrorMsg("Student ID / Roll number is mandatory for this event.");
      return false;
    }
    if (isTeam) {
      if (!teamName.trim() || teamName.trim().length < 2) {
        setErrorMsg("Please enter a valid team name.");
        return false;
      }
      if (teamSize < event.minTeamSize || teamSize > event.maxTeamSize) {
        setErrorMsg(`Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}.`);
        return false;
      }
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  // Payment Execution Flow
  const handlePayment = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Initiate registration on backend
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          participant: {
            fullName: fullName.trim(),
            email: currentUser.email,
            phone: phone.trim(),
            college: college.trim(),
            studentId: studentId.trim() || undefined,
          },
          teamName: isTeam ? teamName.trim() : undefined,
          teamSize: isTeam ? Number(teamSize) : 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create registration");
      }

      // Free event
      if (data.free) {
        router.push(`/registration/${data.registrationId}`);
        return;
      }

      const checkout = data.checkout;
      if (!checkout || !checkout.keyId) {
        throw new Error("Payment gateway is not currently configured by the fest organizers. Please contact the helpdesk.");
      }

      // If mock test mode is active, trigger sandbox simulator UI
      if (checkout.keyId.startsWith("rzp_test_mock")) {
        setSandboxModal(checkout);
        setSubmitting(false);
        return;
      }

      // 2. Open Real Razorpay Checkout
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay payment gateway SDK. Please check your internet connection.");
      }

      const options = {
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.orderId,
        prefill: checkout.prefill,
        theme: { color: "#8b5cf6" },
        handler: async function (response: any) {
          try {
            // 3. Cryptographically verify signature on backend
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            // Confirmed! Redirect to registration confirmation
            router.push(`/registration/${verifyData.registrationId}`);
          } catch (err: any) {
            setErrorMsg(err.message || "Payment verification failed. Please contact the organizers.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: async function () {
            // User closed the Razorpay popup
            await fetch("/api/payments/failure", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: checkout.orderId,
                kind: "cancelled",
                reason: "Payment modal closed by user",
              }),
            }).catch(() => {});
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        await fetch("/api/payments/failure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: checkout.orderId,
            kind: "failed",
            reason: response.error?.description || "Payment failed",
          }),
        }).catch(() => {});

        setErrorMsg(response.error?.description || "Payment was declined by your bank.");
        setSubmitting(false);
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during checkout.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 container-x max-w-3xl">
      {/* Event Header info */}
      <div className="mb-8">
        <Link
          href={`/events/${event.slug}`}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Details
        </Link>

        <div className="p-6 rounded-3xl bg-[#0B0D14] border border-white/10 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                {event.category} Registration
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {event.venue}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-zinc-400 font-medium">
                {isHackathon ? "Fee per participant" : "Registration Fee"}
              </div>
              <div className="text-2xl font-display font-extrabold text-white">
                {formatINR(event.fee)}
              </div>
              {isHackathon && (
                <div className="text-[11px] text-zinc-400">₹200 × team size</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === 1
                ? "bg-[#D4AF37] text-black ring-4 ring-[#D4AF37]/20"
                : "bg-emerald-500 text-white"
            }`}
          >
            {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Step 1</div>
            <div className="text-xs text-zinc-400">Participant & Team</div>
          </div>
        </div>

        <div className="h-px flex-1 mx-4 bg-white/10" />

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === 2
                ? "bg-[#D4AF37] text-black ring-4 ring-[#D4AF37]/20"
                : "bg-[#0B0D14] border border-white/20 text-zinc-500"
            }`}
          >
            2
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Step 2</div>
            <div className="text-xs text-zinc-400">Review & Payment</div>
          </div>
        </div>
      </div>

      {/* Error Message banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl bg-[#0B0D14] border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {currentStep === 1 ? (
          <form onSubmit={handleNext} className="space-y-6">
            {/* Team details if Team Event */}
            {isTeam && (
              <div className="space-y-5 p-5 rounded-2xl bg-[#0F121C] border border-[#D4AF37]/20">
                <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4" /> Team Information
                </div>

                <div>
                  <label className="label">Team Name *</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. CodeBreakers, TuringSquad"
                    className="input"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Choose a unique name for your team.
                  </p>
                </div>

                {isHackathon && (
                  <div>
                    <label className="label">
                      Select Team Size (Leader + Members) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[1, 2, 3, 4].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTeamSize(size)}
                          className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            teamSize === size
                              ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/15"
                              : "bg-[#0B0D14] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          <span className="font-display font-bold text-base">
                            {size} {size === 1 ? "Person" : "Members"}
                          </span>
                          <span className="text-xs text-[#D4AF37] font-semibold mt-0.5">
                            ₹{size * 200}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400 leading-relaxed">
                      💡 <strong>Team Pass Note:</strong> The team leader reserves and pays for the slots once. Teammates join 100% free using your invitation code.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Participant Details */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {isTeam ? "Team Leader Details" : "Participant Details"}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="input opacity-60 cursor-not-allowed bg-ink-950"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Tied to your signed-in account.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">College / Institution *</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="MVSR Engineering College"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Student ID / Roll Number {event.requiresStudentId ? "*" : "(Optional)"}
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2451-22-733-001"
                  className="input"
                  required={event.requiresStudentId}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                className="btn-primary px-8 py-3.5 rounded-xl font-bold flex items-center gap-2"
              >
                Continue to Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Review & Razorpay Checkout */
          <div className="space-y-6">
            <h3 className="font-display text-xl font-bold text-white">
              Review Your Registration
            </h3>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-[#0F121C] border border-[#D4AF37]/20 space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-zinc-400">Event</span>
                <span className="font-bold text-white">{event.name}</span>
              </div>

              {isTeam && (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-zinc-400">Team Name</span>
                    <span className="font-bold text-[#D4AF37]">{teamName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-zinc-400">Team Size</span>
                    <span className="font-bold text-white">{teamSize} Members</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-zinc-400">{isTeam ? "Team Leader" : "Participant"}</span>
                <span className="font-bold text-white">{fullName}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-zinc-400">College</span>
                <span className="font-medium text-zinc-300">{college}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-zinc-400">Contact</span>
                <span className="font-medium text-zinc-300">{currentUser.email} · {phone}</span>
              </div>

              {/* Amount Breakdown */}
              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <div className="font-display text-base font-bold text-white">
                    Total Payable Amount
                  </div>
                  {isHackathon && (
                    <div className="text-xs text-zinc-400">
                      {teamSize} participants × ₹200 each
                    </div>
                  )}
                </div>
                <div className="font-display text-2xl font-extrabold text-[#D4AF37]">
                  {formatINR(totalAmount)}
                </div>
              </div>
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                Payments are securely processed via Razorpay. Your pass and QR slip are confirmed immediately upon signature verification.
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={submitting}
                className="btn-ghost px-5 py-3 text-xs rounded-xl"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={submitting}
                className="btn-primary px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-[#D4AF37]/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Payment Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {formatINR(totalAmount)} with Razorpay
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Razorpay Sandbox Test Simulator Modal */}
      {sandboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B0D14] border border-[#D4AF37]/30 p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-1">
                Razorpay Test Environment
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Simulated Payment Gateway
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Order ID: <span className="font-mono text-zinc-300">{sandboxModal.orderId}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F121C] border border-white/5 space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-zinc-400">Payable Amount:</span>
                <span className="font-bold text-white text-sm">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Modes:</span>
                <span className="text-zinc-300">UPI / Cards / NetBanking / Wallets</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={simulateSuccess}
                disabled={submitting}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Simulate Successful Payment (₹{totalAmount})
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={simulateFailure}
                disabled={submitting}
                className="btn-ghost w-full py-3 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white"
              >
                Simulate Payment Dismiss / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
