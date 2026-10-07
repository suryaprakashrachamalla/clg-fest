import { fetchCurrentUser, fetchVerificationCard } from "@/services/api";
import { VerifyClient } from "./verify-client";

export const dynamic = "force-dynamic";

export default async function VerifyPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const [user, card] = await Promise.all([
    fetchCurrentUser(),
    fetchVerificationCard(params.token),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-20 container-x max-w-lg">
      <VerifyClient
        token={params.token}
        initialCard={card}
        isOrganizer={Boolean(user && (user.role === "ADMIN" || user.role === "ORGANIZER"))}
      />
    </div>
  );
}
