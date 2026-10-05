import { getCurrentUser } from "@/lib/auth";
import { JoinClient } from "./join-client";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const user = await getCurrentUser();

  return (
    <JoinClient
      initialCode={searchParams.code || ""}
      currentUser={
        user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              college: user.college,
              studentId: user.studentId ?? "",
            }
          : null
      }
    />
  );
}
