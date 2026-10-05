import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicEvent } from "@/lib/events";
import { RegisterClient } from "./register-client";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ params }: { params: { slug: string } }) {
  const event = await getPublicEvent(params.slug);
  if (!event) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/register/${params.slug}`);
  }

  return (
    <RegisterClient
      event={event}
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        studentId: user.studentId ?? "",
      }}
    />
  );
}
