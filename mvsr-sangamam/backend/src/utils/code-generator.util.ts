import { randomBytes, randomInt } from "node:crypto";

const HUMAN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateHumanCode(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += HUMAN_ALPHABET[randomInt(HUMAN_ALPHABET.length)];
  }
  return out;
}

/** 6-character invitation code, e.g. X7K9P2 */
export const newInvitationCode = (): string => generateHumanCode(6);

/** Registration reference code, e.g. REG-8K2M9Q */
export const newRegistrationCode = (): string => `REG-${generateHumanCode(6)}`;

/** Opaque 256-bit token encoded in QR passes */
export const newQrToken = (): string => randomBytes(32).toString("base64url");

/** Team sequential code, e.g. HACK-2026-0001 */
export function generateTeamCode(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

/** Retry helper for unique constraint collisions on random tokens */
export async function withUniqueRetry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (e?.code === "P2002" && isRandomCodeTarget(e)) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

function isRandomCodeTarget(e: any): boolean {
  const target = JSON.stringify(e?.meta?.target ?? "");
  return /code|qrToken/.test(target);
}
