"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import type { PublicEvent } from "@/lib/events";
import { api, ApiError, isMockCheckout, openRazorpay, reportPaymentFailure, verifyPayment, type Checkout } from "@/lib/client";
import { computeAmount } from "@/utils/pricing";
import { cx, fmtDate, fmtTime, formatINR } from "@/utils/format";

type User = { name: string; email: string; phone: string; college: string; studentId: string };

type CreateResult =
  | { registrationId: string; code: string; amount: number; free: true }
  | { registrationId: string; code: string; amount: number; free: false; checkout: Checkout; expiresAt: string };

const STEPS = ["Details", "Payment", "Your token"];

export function RegisterFlow({ event, user }: { event: PublicEvent; user: User }) {
  const router = useRouter();
  const isTeam = event.participationType === "TEAM";

  const [step, setStep] = useState<0 | 1>(0);
  const [form, setForm] = useState({
    fullName: user.name,
    phone: user.phone,
    college: user.college,
    studentId: user.studentId,
    teamName: "",
    teamSize: Math.max(event.minTeamSize, 1),
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mock, setMock] = useState<{ checkout: Checkout; registrationId: string } | null>(null);

  const amount = computeAmount(event, form.teamSize);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: k === "teamSize" ? Number(e.target.value) : e.target.value }));

  function validate() {
    if (form.fullName.trim().length < 2) return "Please enter your full name.";
    if (!/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ""))) return "Please enter a valid 10-digit mobile number.";
    if (form.college.trim().length < 2) return "Please enter your college name.";
    if (event.requiresStudentId && !form.studentId.trim()) return "Roll number / student ID is required for this event.";
    if (isTeam && form.teamName.trim().length < 2) return "Please enter a team name.";
    return null;
  }

  function goToPayment(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (!msg) setStep(1);
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<CreateResult>("/api/registrations", {
        eventSlug: event.slug,
        participant: {
          fullName: form.fullName.trim(),
          email: user.email,
          phone: form.phone.trim(),
          college: form.college.trim(),
          studentId: form.studentId.trim() || undefined,
        },
        teamName: isTeam ? form.teamName.trim() : undefined,
        teamSize: isTeam ? form.teamSize : 1,
      });

      if (res.free) return router.push(`/registration/${res.registrationId}`);

      if (isMockCheckout(res.checkout)) {
        setMock({ checkout: res.checkout, registrationId: res.registrationId });
        setBusy(false);
        return;
      }

      const regId = await openRazorpay(res.checkout);
      if (regId) return router.push(`/registration/${regId}`);
      // Window closed: the slot stays held for a few minutes and can be paid from the token page.
      router.push(`/registration/${res.registrationId}`);
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "PENDING_EXISTS" && err.details?.registrationId) {
        return router.push(`/registration/${err.details.registrationId}`);
      }
      setError(err.message);
      setBusy(false);
    }
  }

  async function mockPay(success: boolean) {
    if (!mock) return;
    setBusy(true);
    try {
      if (success) {
        const regId = await verifyPayment(mock.checkout.orderId, `pay_mock_${Date.now()}`, "mock_signature");
        router.push(`/registration/${regId}`);
      } else {
        await reportPaymentFailure(mock.checkout.orderId, "cancelled", "Test payment cancelled");
        router.push(`/registration/${mock.registrationId}`);
      }
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="container-x max-w-3xl py-10">
      <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to event
      </Link>

      <div className="mt-6">
        <p className="eyebrow">Registration</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{event.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)} · {event.venue}
        </p>
      </div>

      <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Registration steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={cx(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold sm:text-sm",
              i < step && "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
              i === step && "border-gold/50 bg-gold/10 text-gold",
              i > step && "border-white/10 text-zinc-500"
            )}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
              {i < step ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {step === 0 ? (
        <form onSubmit={goToPayment} className="panel mt-6 space-y-5 p-6 sm:p-8" noValidate>
          {isTeam && (
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div>
                <label className="label" htmlFor="teamName">Team name</label>
                <input id="teamName" className="input" value={form.teamName} onChange={set("teamName")} maxLength={40} required />
              </div>
              <div>
                <label className="label" htmlFor="teamSize">Team size</label>
                <select id="teamSize" className="input" value={form.teamSize} onChange={set("teamSize")}>
                  {Array.from({ length: event.maxTeamSize - event.minTeamSize + 1 }, (_, i) => event.minTeamSize + i).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "member" : "members"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="fullName">{isTeam ? "Team leader name" : "Full name"}</label>
              <input id="fullName" className="input" value={form.fullName} onChange={set("fullName")} autoComplete="name" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input opacity-70" value={user.email} readOnly />
            </div>
            <div>
              <label className="label" htmlFor="phone">Mobile number</label>
              <input id="phone" className="input" value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" required />
            </div>
            <div>
              <label className="label" htmlFor="studentId">
                Roll number / student ID{event.requiresStudentId ? "" : " (optional)"}
              </label>
              <input id="studentId" className="input" value={form.studentId} onChange={set("studentId")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="college">College</label>
              <input id="college" className="input" value={form.college} onChange={set("college")} autoComplete="organization" required />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary px-6 py-3">
              Continue to payment
            </button>
          </div>
        </form>
      ) : (
        <div className="panel mt-6 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Review &amp; pay</h2>
          <dl className="mt-5 divide-y divide-white/5 text-sm">
            {isTeam && <Row label="Team" value={`${form.teamName} · ${form.teamSize} ${form.teamSize === 1 ? "member" : "members"}`} />}
            <Row label={isTeam ? "Team leader" : "Participant"} value={form.fullName} />
            <Row label="Contact" value={`${user.email} · ${form.phone}`} />
            <Row label="College" value={form.college} />
            <div className="flex items-center justify-between pt-4">
              <dt className="text-base font-semibold text-white">Total</dt>
              <dd className="text-2xl font-bold text-gold">{amount === 0 ? "Free" : formatINR(amount)}</dd>
            </div>
          </dl>

          <p className="mt-5 flex items-start gap-2 text-xs text-zinc-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            Payments are processed securely by Razorpay (UPI, cards, net banking). Your team token is generated as soon as
            the payment is confirmed.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" className="btn-ghost" onClick={() => setStep(0)} disabled={busy}>
              Edit details
            </button>
            <button type="button" className="btn-primary px-6 py-3" onClick={pay} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {amount === 0 ? "Confirm registration" : `Pay ${formatINR(amount)} with Razorpay`}
            </button>
          </div>
        </div>
      )}

      {mock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="mock-title">
          <div className="panel w-full max-w-sm p-6 text-center">
            <h2 id="mock-title" className="text-lg font-semibold">Test payment</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Razorpay is in test mode on this server, so no real money moves. Choose an outcome for{" "}
              {formatINR(mock.checkout.amount / 100)}.
            </p>
            <div className="mt-6 grid gap-2">
              <button className="btn-primary" onClick={() => mockPay(true)} disabled={busy}>
                Simulate successful payment
              </button>
              <button className="btn-ghost" onClick={() => mockPay(false)} disabled={busy}>
                Cancel payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-200">{value}</dd>
    </div>
  );
}
