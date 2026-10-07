"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/client";

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const isSignup = mode === "signup";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (isSignup && f.password !== f.confirm) return setError("Passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      if (isSignup) {
        await api("/api/auth/signup", {
          name: f.name,
          email: f.email,
          phone: f.phone,
          college: f.college,
          studentId: f.studentId,
          password: f.password,
        });
      } else {
        await api("/api/auth/login", { email: f.email, password: f.password });
      }
      // Full navigation so the header picks up the new session cookie.
      window.location.href = safeNext(next);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  const otherHref = `${isSignup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="container-x flex justify-center py-12 sm:py-16">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isSignup ? "Sign up once to register for any Sangamam event." : "Log in to register for events and view your tokens."}
        </p>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" className="input" autoComplete="name" required minLength={2} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" required />
          </div>
          {isSignup && (
            <>
              <div>
                <label className="label" htmlFor="phone">Mobile number</label>
                <input id="phone" name="phone" className="input" inputMode="tel" autoComplete="tel" placeholder="10-digit number" required />
              </div>
              <div>
                <label className="label" htmlFor="college">College</label>
                <input id="college" name="college" className="input" autoComplete="organization" required minLength={2} />
              </div>
              <div>
                <label className="label" htmlFor="studentId">Roll number / student ID</label>
                <input id="studentId" name="studentId" className="input" />
              </div>
            </>
          )}
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              required
            />
          </div>
          {isSignup && (
            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <input id="confirm" name="confirm" type="password" className="input" autoComplete="new-password" required />
            </div>
          )}
          <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={otherHref} className="font-semibold text-gold hover:underline">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
