import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/services/api";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next;
  if (await fetchCurrentUser()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  return <AuthForm mode="signup" next={next} />;
}
