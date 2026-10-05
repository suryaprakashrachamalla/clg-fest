import { redirect } from "next/navigation";
import { fetchCurrentUser, fetchAdminOverview } from "@/services/api";
import { AdminClient } from "./admin-client";
import { eventToFormValues } from "@/utils/event-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await fetchCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
    redirect("/dashboard");
  }

  const overview = await fetchAdminOverview();
  const rawStats = overview?.stats ?? {};
  const rawEvents = overview?.events ?? [];
  const rawRegs = overview?.registrations ?? [];

  const stats = {
    totalParticipants: (rawStats.confirmedRegs ?? 0) + (rawStats.totalTeams ?? 0),
    totalTeams: rawStats.totalTeams ?? 0,
    totalRegistrations: rawStats.totalRegs ?? 0,
    confirmedRegistrations: rawStats.confirmedRegs ?? 0,
    pendingRegistrations: rawStats.pendingRegs ?? 0,
    revenue: rawStats.confirmedRevenue ?? 0,
    checkedIn: rawStats.checkInsCount ?? 0,
    hackathon: {
      totalLimit: rawStats.hackathonMax ?? 50,
      registered: (rawStats.hackathonMax ?? 50) - (rawStats.hackathonRemaining ?? 50),
      remaining: rawStats.hackathonRemaining ?? 50,
    },
  };

  const events = rawEvents.map((e: any) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    category: e.category,
    venue: e.venue || "",
    fee: e.fee ?? 0,
    capacity: e.capacity ?? null,
    slotsTaken: e.slotsTaken ?? 0,
    isPublished: e.isPublished ?? true,
    registrationOpen: e.registrationOpen ?? true,
    formValues: eventToFormValues(e),
  }));

  const registrations = rawRegs.map((r: any) => ({
    id: r.id,
    code: r.code,
    status: r.status,
    amount: r.amount,
    createdAt: r.createdAt,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    college: r.college,
    studentId: r.studentId,
    qrToken: r.qrToken,
    event: r.event,
    paymentStatus: r.amount === 0 ? "FREE" : r.payment?.status ?? "UNPAID",
    paymentId: r.payment?.razorpayPaymentId ?? null,
    team: r.team
      ? {
          code: r.team.code,
          name: r.team.name,
          paidCapacity: r.team.paidCapacity ?? 1,
          memberCount: r.team.memberCount ?? 1,
          invitationCode: r.team.invitationCode ?? null,
          members: (r.team.members ?? []).map((m: any) => ({
            name: m.name,
            role: m.role,
            phone: m.phone || "",
            college: m.college || "",
          })),
        }
      : null,
    checkIn: r.checkIn
      ? {
          at: r.checkIn.checkedInAt,
          by: r.checkIn.by,
        }
      : null,
  }));

  return (
    <AdminClient
      user={{ id: user.id, name: user.name, role: user.role }}
      stats={stats}
      events={events}
      registrations={registrations}
    />
  );
}
