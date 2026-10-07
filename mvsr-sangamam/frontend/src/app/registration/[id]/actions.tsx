"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Printer } from "lucide-react";
import { api, isMockCheckout, openRazorpay, verifyPayment, type Checkout } from "@/lib/client";

export function PendingActions({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resume() {
    setBusy(true);
    setError(null);
    try {
      const { checkout } = await api<{ checkout: Checkout }>(`/api/registrations/${registrationId}/checkout`);
      if (isMockCheckout(checkout)) {
        await verifyPayment(checkout.orderId, `pay_mock_${Date.now()}`, "mock_signature");
      } else {
        await openRazorpay(checkout);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await api(`/api/registrations/${registrationId}/cancel`, {});
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={resume} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Complete payment
        </button>
        <button className="btn-ghost" onClick={cancel} disabled={busy}>
          Cancel registration
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost btn-sm"
      onClick={async () => {
        await navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      <Printer className="h-4 w-4" aria-hidden /> Print / save as PDF
    </button>
  );
}
