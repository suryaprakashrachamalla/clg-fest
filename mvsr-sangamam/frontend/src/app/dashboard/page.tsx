import { redirect } from "next/navigation";
import { fetchDashboardData, fetchCurrentUser } from "@/services/api";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const dashboardData = await fetchDashboardData();
  const registrations = dashboardData?.registrations ?? [];
  const memberships = dashboardData?.memberships ?? [];

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        studentId: user.studentId,
        role: user.role,
      }}
      registrations={registrations}
      memberships={memberships}
    />
  );
}
