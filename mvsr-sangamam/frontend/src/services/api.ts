import { cookies } from "next/headers";
import { SESSION_COOKIE } from "../utils/session";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Server-side fetch helper communicating directly with the backend REST service.
 * Automatically forwards the auth session cookie when executed in Server Components.
 */
async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    let cookieHeader = "";
    try {
      const cookieStore = cookies();
      const token = cookieStore.get(SESSION_COOKIE)?.value;
      if (token) {
        cookieHeader = `${SESSION_COOKIE}=${token}`;
      }
    } catch {
      // cookies() may throw outside Next request context
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`[Frontend API] Error fetching ${path}:`, err);
    return null;
  }
}

export async function fetchPublicEvents() {
  const events = await serverFetch<any[]>("/api/events");
  return events ?? [];
}

export async function fetchPublicStats() {
  const stats = await serverFetch<any>("/api/events/stats");
  return (
    stats ?? {
      events: 0,
      categories: 0,
      participants: 0,
      hackathonTeamLimit: 50,
      firstPrize: 20000,
    }
  );
}

export async function fetchPublicEvent(slug: string) {
  return serverFetch<any>(`/api/events/${slug}`);
}

export async function fetchEventAvailability(slug: string) {
  return serverFetch<any>(`/api/events/${slug}/availability`);
}

export async function fetchCurrentUser() {
  const data = await serverFetch<{ user: any }>("/api/auth/me");
  return data?.user ?? null;
}

export async function fetchDashboardData() {
  return serverFetch<{
    user: any;
    registrations: any[];
    memberships: any[];
  }>("/api/dashboard/overview");
}

export async function fetchAdminOverview(search?: string, eventFilter?: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (eventFilter) params.set("event", eventFilter);
  const q = params.toString() ? `?${params.toString()}` : "";
  return serverFetch<{
    stats: any;
    events: any[];
    registrations: any[];
  }>(`/api/admin/overview${q}`);
}

export async function fetchRegistrationSlip(id: string) {
  return serverFetch<{
    registration: any;
    event: any;
    team: any;
    qrImage: string | null;
  }>(`/api/registrations/${id}`);
}

export async function fetchVerificationCard(token: string) {
  return serverFetch<any>(`/api/checkin/${token}`);
}
