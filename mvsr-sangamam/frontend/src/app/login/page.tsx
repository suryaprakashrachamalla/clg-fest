import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "./auth-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; tab?: string };
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(searchParams.next || "/dashboard");
  }

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center container-x max-w-md">
      <AuthForm nextUrl={searchParams.next || "/dashboard"} initialTab={searchParams.tab || "login"} />
    </div>
  );
}
