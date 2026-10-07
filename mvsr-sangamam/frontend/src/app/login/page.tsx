import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/services/api";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log in" };

export default async function LoginPage(props: { searchParams: Promise<{ next?: string }> }) {
  const searchParams = await props.searchParams;
  const next = searchParams.next;
  if (await fetchCurrentUser()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  return <AuthForm mode="login" next={next} />;
}
