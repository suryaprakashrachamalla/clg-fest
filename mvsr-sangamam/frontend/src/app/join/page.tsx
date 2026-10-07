import { fetchCurrentUser } from "@/services/api";
import { JoinTeam } from "./join-team";

export const dynamic = "force-dynamic";
export const metadata = { title: "Join a team" };

export default async function JoinPage(props: { searchParams: Promise<{ code?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await fetchCurrentUser();
  return (
    <JoinTeam
      initialCode={searchParams.code ?? ""}
      user={
        user
          ? { name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "", college: user.college ?? "", studentId: user.studentId ?? "" }
          : null
      }
    />
  );
}
