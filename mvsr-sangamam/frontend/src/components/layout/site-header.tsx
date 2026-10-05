import { getCurrentUser } from "@/lib/auth";
import { HeaderClient } from "./header-client";

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <HeaderClient
      user={user ? { name: user.name, role: user.role } : null}
    />
  );
}
