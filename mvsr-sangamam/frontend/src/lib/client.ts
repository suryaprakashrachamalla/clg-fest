"use client";

export class ApiError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
  }
}

/** POST/GET JSON to the backend through the Next.js /api rewrite. Throws with the backend's message on failure. */
export async function api<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error || "Something went wrong. Please try again.", data?.code, data?.details);
  }
  return data as T;
}

export interface Checkout {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: Record<string, string>;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function isMockCheckout(c: Checkout) {
  return c.keyId.includes("mock");
}

export async function reportPaymentFailure(orderId: string, kind: "failed" | "cancelled", reason: string) {
  await api("/api/payments/failure", { razorpay_order_id: orderId, kind, reason }).catch(() => {});
}

/** Confirms a payment with the backend; resolves to the registration id. */
export async function verifyPayment(orderId: string, paymentId: string, signature: string) {
  const r = await api<{ registrationId: string }>("/api/payments/verify", {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  });
  return r.registrationId;
}

/**
 * Opens Razorpay Checkout. Resolves with the registration id once the backend has verified
 * the signature, or null if the user closed the window. Rejects on payment failure.
 */
export async function openRazorpay(c: Checkout): Promise<string | null> {
  if (!(await loadRazorpay()) || !window.Razorpay) {
    throw new Error("Couldn't load the Razorpay payment window. Check your connection and try again.");
  }
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: c.keyId,
      amount: c.amount,
      currency: c.currency,
      name: c.name,
      description: c.description,
      order_id: c.orderId,
      prefill: c.prefill,
      theme: { color: "#D9B45A" },
      handler: (r: any) =>
        verifyPayment(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature).then(resolve, reject),
      modal: {
        ondismiss: () => {
          reportPaymentFailure(c.orderId, "cancelled", "Payment window closed").finally(() => resolve(null));
        },
      },
    });
    rzp.on("payment.failed", (r: any) => {
      const reason = r?.error?.description || "Payment failed";
      reportPaymentFailure(c.orderId, "failed", reason);
      reject(new Error(reason));
    });
    rzp.open();
  });
}
