import QRCode from "qrcode";
import { ENV } from "../config/env.config";

export const getAppUrl = (): string => ENV.APP_URL.replace(/\/$/, "");

export const verificationUrl = (token: string): string => `${getAppUrl()}/v/${token}`;
export const invitationUrl = (code: string): string => `${getAppUrl()}/join?code=${code}`;

export function qrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl(token), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 480,
    color: { dark: "#0a0814", light: "#ffffff" },
  });
}

export function parseQrPayload(raw: string): string | null {
  const s = raw.trim();
  const m = s.match(/\/v\/([A-Za-z0-9_-]{20,})\/?$/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return s;
  return null;
}
