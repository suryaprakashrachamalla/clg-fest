"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, School, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { FEST } from "@/config/fest";

export function AuthForm({ nextUrl, initialTab }: { nextUrl: string; initialTab: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">(initialTab === "signup" ? "signup" : "login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("MVSR Engineering College");
  const [studentId, setStudentId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body =
      tab === "login"
        ? { email: email.trim().toLowerCase(), password }
        : {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            college: college.trim(),
            studentId: studentId.trim() || undefined,
            password,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-ink-900/90 border border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <h1 className="text-2xl font-display font-extrabold text-white">
          {tab === "login" ? "Sign In to Sangamam" : "Create Fest Account"}
        </h1>
        <p className="text-xs text-zinc-400">
          Official registration portal for {FEST.name} {FEST.edition}
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-ink-950 border border-white/5 mb-6">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setErrorMsg(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            tab === "login" ? "bg-white/10 text-white shadow" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("signup");
            setErrorMsg(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            tab === "signup" ? "bg-white/10 text-white shadow" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "signup" && (
          <div>
            <label className="label">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input pl-10"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="label">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="input pl-10"
              required
            />
          </div>
        </div>

        {tab === "signup" && (
          <>
            <div>
              <label className="label">Mobile Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">College / Institution *</label>
              <div className="relative">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="MVSR Engineering College"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Student ID / Roll No (Optional)</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="2451-22-733-001"
                className="input"
              />
            </div>
          </>
        )}

        <div>
          <label className="label">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10"
              required
              minLength={8}
            />
          </div>
          {tab === "signup" && (
            <p className="text-[11px] text-zinc-500 mt-1">Must be at least 8 characters.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 shadow-xl shadow-brand-violet/25"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {tab === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
