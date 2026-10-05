// Client-safe formatting + UI helpers

export function formatINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);
}

const TZ = "Asia/Kolkata";

export function fmtDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));
}
export function fmtTime(iso: string | Date) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
}
export function fmtDateTime(iso: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}
/** "2026-10-17" in IST */
export function istDayKey(iso: string | Date | undefined) {
  if (!iso) return "2026-10-17";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "2026-10-17";
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  } catch {
    return "2026-10-17";
  }
}
export function istHour(iso: string | Date | undefined) {
  if (!iso) return 10;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 10;
    return Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(d));
  } catch {
    return 10;
  }
}


export const ACCENTS: Record<string, { from: string; to: string; text: string; ring: string; glow: string }> = {
  gold: { from: "from-[#B89D47]", to: "to-[#CFB97E]", text: "text-[#B89D47]", ring: "group-hover:border-[#B89D47]/40", glow: "bg-[#B89D47]/25" },
  sage: { from: "from-[#CFB97E]", to: "to-[#355E58]", text: "text-[#CFB97E]", ring: "group-hover:border-[#CFB97E]/40", glow: "bg-[#CFB97E]/25" },
  coral: { from: "from-[#FE9179]", to: "to-[#FFEDD1]", text: "text-[#FE9179]", ring: "group-hover:border-[#FE9179]/40", glow: "bg-[#FE9179]/25" },
  spruce: { from: "from-[#355E58]", to: "to-[#053229]", text: "text-[#BCDDDC]", ring: "group-hover:border-[#355E58]/40", glow: "bg-[#355E58]/25" },
  peacock: { from: "from-[#053229]", to: "to-[#355E58]", text: "text-[#BCDDDC]", ring: "group-hover:border-[#053229]/40", glow: "bg-[#053229]/25" },
  arctic: { from: "from-[#BCDDDC]", to: "to-[#CFB97E]", text: "text-[#BCDDDC]", ring: "group-hover:border-[#BCDDDC]/40", glow: "bg-[#BCDDDC]/25" },
  violet: { from: "from-[#B89D47]", to: "to-[#CFB97E]", text: "text-[#CFB97E]", ring: "group-hover:border-[#B89D47]/40", glow: "bg-[#B89D47]/25" },
  fuchsia: { from: "from-[#FE9179]", to: "to-[#FFEDD1]", text: "text-[#FE9179]", ring: "group-hover:border-[#FE9179]/40", glow: "bg-[#FE9179]/25" },
  cyan: { from: "from-[#BCDDDC]", to: "to-[#CFB97E]", text: "text-[#BCDDDC]", ring: "group-hover:border-[#BCDDDC]/40", glow: "bg-[#BCDDDC]/25" },
  amber: { from: "from-[#B89D47]", to: "to-[#CFB97E]", text: "text-[#B89D47]", ring: "group-hover:border-[#B89D47]/40", glow: "bg-[#B89D47]/25" },
  lime: { from: "from-[#CFB97E]", to: "to-[#355E58]", text: "text-[#CFB97E]", ring: "group-hover:border-[#CFB97E]/40", glow: "bg-[#CFB97E]/25" },
  rose: { from: "from-[#FE9179]", to: "to-[#FFEDD1]", text: "text-[#FE9179]", ring: "group-hover:border-[#FE9179]/40", glow: "bg-[#FE9179]/25" },
};
export const accentOf = (a: string) => ACCENTS[a] ?? ACCENTS.gold;

export function teamSizeLabel(e: { participationType: string; minTeamSize: number; maxTeamSize: number }) {
  if (e.participationType === "INDIVIDUAL") return "Individual";
  if (e.minTeamSize === e.maxTeamSize) return `Team of ${e.maxTeamSize}`;
  return `Team of ${e.minTeamSize}–${e.maxTeamSize}`;
}

export function feeLabel(e: { fee: number; pricingMode: string; participationType: string }) {
  if (e.fee === 0) return "Free";
  if (e.participationType === "TEAM") return e.pricingMode === "PER_PARTICIPANT" ? `${formatINR(e.fee)} / participant` : `${formatINR(e.fee)} / team`;
  return formatINR(e.fee);
}

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Typed JSON fetch that surfaces server error messages. */
export async function api<T = any>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    method: init?.method ?? (init?.json !== undefined ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`) as Error & { code?: string; status?: number; data?: any };
    err.code = data?.code;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}
