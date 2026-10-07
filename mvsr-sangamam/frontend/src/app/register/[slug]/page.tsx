import { notFound, redirect } from "next/navigation";
import { getEvent } from "@/lib/events";
import { fetchCurrentUser } from "@/services/api";
import { RegisterFlow } from "./register-flow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Register" };

export default async function RegisterPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const user = await fetchCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/register/${params.slug}`)}`);

  const event = await getEvent(params.slug);
  if (!event) notFound();
  if (!event.registrationOpen || event.remaining === 0) redirect(`/events/${event.slug}`);

  return (
    <RegisterFlow
      event={event}
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        college: user.college ?? "",
        studentId: user.studentId ?? "",
      }}
    />
  );
}
