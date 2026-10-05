import crypto from "crypto";
import { ENV } from "../config/env.config";
import { SessionPayload } from "../types";

export const SESSION_COOKIE = "sangamam_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(data: Uint8Array | string): string {
  const binary = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return Buffer.from(binary).toString("base64url");
}

function base64UrlDecode(str: string): Uint8Array {
  return Buffer.from(str, "base64url");
}

async function getKey(): Promise<crypto.webcrypto.CryptoKey> {
  const secret = ENV.AUTH_SECRET || "default_super_secret_session_key_sangamam_2026_mvsr_32chars";
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    sub: payload.sub,
    role: payload.role,
    name: payload.name,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(jwtPayload));
  const data = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const sigPart = base64UrlEncode(new Uint8Array(signature));
  return `${headerPart}.${payloadPart}.${sigPart}`;
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await getKey();
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlDecode(parts[2]);
    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!valid) return null;
    const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    if (!payload.sub) return null;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      sub: payload.sub,
      role: payload.role as SessionPayload["role"],
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}
