import crypto from "node:crypto";
import Razorpay from "razorpay";
import { ENV } from "../config/env.config";
import { HttpError } from "../utils/response.util";

let client: Razorpay | null = null;

export function isMockMode(): boolean {
  return ENV.RAZORPAY_KEY_ID?.startsWith("rzp_test_mock") ?? false;
}

export function razorpayConfigured(): boolean {
  return Boolean(ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET);
}

function getRazorpayInstance(): Razorpay | null {
  if (isMockMode()) return null;
  if (!razorpayConfigured()) {
    throw new HttpError(
      503,
      "Online payments are not configured yet. Please contact the organizers.",
      "PAYMENTS_DISABLED"
    );
  }
  if (!client) {
    client = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

export const getPublicKeyId = (): string => ENV.RAZORPAY_KEY_ID ?? "";

export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}) {
  if (isMockMode()) {
    return {
      id: `order_mock_${crypto.randomBytes(8).toString("hex")}`,
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    };
  }

  try {
    const rzp = getRazorpayInstance();
    if (!rzp) throw new Error("Razorpay client unavailable");
    const order = await rzp.orders.create({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    });
    return order;
  } catch (e: any) {
    if (e instanceof HttpError) throw e;
    console.error("[RazorpayClient] order create failed", e?.error ?? e);
    throw new HttpError(
      502,
      "Could not reach the payment gateway. Please try again.",
      "GATEWAY_ERROR"
    );
  }
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** Checkout signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret) */
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (isMockMode()) {
    return signature === "mock_signature" || signature === "simulated_valid_signature";
  }
  const secret = ENV.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC_SHA256(raw_body, webhook_secret) */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = ENV.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Best-effort fetch of payment details (method, status) for record keeping. */
export async function fetchPaymentDetails(paymentId: string): Promise<{
  method?: string;
  status?: string;
  amount?: number;
  order_id?: string;
} | null> {
  if (isMockMode() || !razorpayConfigured()) return null;
  try {
    const rzp = getRazorpayInstance();
    if (!rzp) return null;
    return (await rzp.payments.fetch(paymentId)) as any;
  } catch {
    return null;
  }
}
