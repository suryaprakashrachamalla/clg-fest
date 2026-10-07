import Link from "next/link";
import { fetchCurrentUser } from "@/services/api";
import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const user = await fetchCurrentUser();
  const isStaff = user?.role === "ADMIN" || user?.role === "ORGANIZER";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-night-950/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-white">
          Sangam<span className="text-gold">am</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/#events" className="hidden rounded-lg px-3 py-2 text-zinc-300 hover:text-white sm:block">
            Events
          </Link>
          {user ? (
            <>
              {isStaff && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-zinc-300 hover:text-white">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-zinc-300 hover:text-white">
                My registrations
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-zinc-300 hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="btn-primary btn-sm sm:px-4 sm:py-2 sm:text-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
