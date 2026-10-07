export const SESSION_COOKIE = "sangamam_session";

export type SessionPayload = { sub: string; role: "PARTICIPANT" | "ORGANIZER" | "ADMIN"; name: string };

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET || "default_super_secret_session_key_sangamam_2026_mvsr_32chars";
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
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
    const payloadJson = new TextDecoder().decode(base64UrlDecode(parts[1]));
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

