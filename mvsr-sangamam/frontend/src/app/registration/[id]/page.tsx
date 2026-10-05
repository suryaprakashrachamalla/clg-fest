import { notFound, redirect } from "next/navigation";
import { fetchCurrentUser, fetchRegistrationSlip } from "@/services/api";
import { RegistrationSlip } from "./registration-slip";

export const dynamic = "force-dynamic";

export default async function RegistrationPage({ params }: { params: { id: string } }) {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login");

  const data = await fetchRegistrationSlip(params.id);
  if (!data || !data.registration) {
    notFound();
  }

  const { registration, event, team, qrImage } = data;

  return (
    <RegistrationSlip
      registration={registration}
      event={event}
      team={team}
      qrImage={qrImage}
    />
  );
}
