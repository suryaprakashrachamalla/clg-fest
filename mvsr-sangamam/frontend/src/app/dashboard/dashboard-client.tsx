"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  QrCode,
  Copy,
  Printer,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Mail,
  X,
  CreditCard,
  UserCheck,
  Ticket,
  Sparkles,
} from "lucide-react";
import { FEST } from "@/config/fest";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";

interface RegistrationItem {
  id: string;
  code: string;
  status: string;
  amount: number;
  createdAt: string;
  paymentStatus: string;
  event: {
    name: string;
    category: string;
    venue: string;
    startsAt: string;
  };
  team: {
    id: string;
    name: string;
    code?: string | null;
    paidCapacity: number;
    memberCount: number;
    invitationCode?: string | null;
    inviteLink?: string | null;
    members: { name: string; role: string; college: string }[];
  } | null;
  qrImage: string | null;
}

interface MembershipItem {
  id: string;
  code: string;
  teamName: string;
  teamCode?: string | null;
  leaderName: string;
  memberCount: number;
  paidCapacity: number;
  event: {
    name: string;
    category: string;
    venue: string;
    startsAt: string;
  };
  members: { name: string; role: string; college: string }[];
  qrImage: string | null;
}

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  registrations: RegistrationItem[];
  memberships: MembershipItem[];
}

export function DashboardClient({ user, registrations, memberships }: Props) {
  const [selectedQr, setSelectedQr] = useState<{
    qrImage: string;
    title: string;
    code: string;
    regId?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 container-x max-w-5xl">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
            Participant Portal
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white">
            Hello, <span className="text-[#D4AF37]">{user.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Access your confirmed festival passes, download offline tickets, and manage hackathon teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/#events" className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold">
            Explore Events
          </Link>
          <Link href="/join" className="btn-ghost text-xs px-4 py-2.5 rounded-xl font-semibold">
            Join Team with Code
          </Link>
        </div>
      </div>

      {/* Registrations Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#D4AF37]" />
            My Event Passes
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
            {registrations.length} {registrations.length === 1 ? "Registration" : "Registrations"}
          </span>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-[#0B0D14] border border-white/10">
            <Ticket className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-3" />
            <p className="text-base text-zinc-200 font-semibold mb-1">
              You haven&apos;t registered for any events yet.
            </p>
            <p className="text-xs text-zinc-400 mb-6 max-w-md mx-auto">
              Explore national hackathons, technical paper presentations, music mobs, and comedy nights at MVSR Sangamam 2026.
            </p>
            <Link href="/#events" className="btn-primary px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {registrations.map((reg) => {
              const isPaid = reg.status === "CONFIRMED";
              const isPending = reg.status === "PENDING";
              const hasTeam = Boolean(reg.team);

              return (
                <div
                  key={reg.id}
                  className="rounded-3xl bg-[#0B0D14] border border-white/10 hover:border-[#D4AF37]/30 transition p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                          {reg.event.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          PASS: {reg.code}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                        {reg.event.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {fmtDate(reg.event.startsAt)}, {fmtTime(reg.event.startsAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {reg.event.venue}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-zinc-400 font-medium mb-1">
                        Status
                      </div>
                      <div className="flex items-center sm:justify-end gap-2">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ CONFIRMED
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            ⏳ PAYMENT PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            ✕ {reg.status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1.5 font-medium">
                        {reg.amount === 0 ? "Free Entry" : `${formatINR(reg.amount)} Paid`}
                      </div>
                    </div>
                  </div>

                  {/* Team details for Hackathon */}
                  {reg.team && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0F121C] border border-[#D4AF37]/20 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                            Team
                          </span>
                          <span className="font-display text-lg font-bold text-white">
                            {reg.team.name}
                          </span>
                        </div>

                        {reg.team.code && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                              Team ID
                            </span>
                            <span className="font-mono text-sm font-bold text-[#D4AF37]">
                              {reg.team.code}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity progress */}
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Team Formation</span>
                          <span className="font-medium text-white">
                            {reg.team.memberCount} of {reg.team.paidCapacity} members joined
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full transition-all"
                            style={{
                              width: `${(reg.team.memberCount / reg.team.paidCapacity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Members list */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                          Joined Members
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {reg.team.members.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-white flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                {m.name}
                              </span>
                              <span className="text-zinc-400">{m.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Invitation code */}
                      {reg.team.invitationCode && isPaid && (
                        <div className="p-3.5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[#D4AF37] font-bold block uppercase text-[10px]">
                              Teammate Invitation Code
                            </span>
                            <span className="font-mono text-base font-bold text-white tracking-widest">
                              {reg.team.invitationCode}
                            </span>
                          </div>

                          {reg.team.inviteLink && (
                            <button
                              onClick={() =>
                                copyToClipboard(reg.team!.inviteLink!, reg.team!.id)
                              }
                              className="btn-ghost btn-sm text-xs flex items-center gap-1.5"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedLink === reg.team.id ? "Link Copied!" : "Copy Invite Link"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/registration/${reg.id}`}
                        className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/15"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        View & Download Ticket
                      </Link>

                      {reg.qrImage && (
                        <button
                          onClick={() =>
                            setSelectedQr({
                              qrImage: reg.qrImage!,
                              title: reg.event.name,
                              code: reg.code,
                              regId: reg.id,
                            })
                          }
                          className="btn-ghost btn-sm text-xs flex items-center gap-1.5"
                        >
                          <QrCode className="w-4 h-4 text-[#D4AF37]" />
                          Quick QR Pass
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${FEST.contact.email}?subject=Query regarding registration ${reg.code}`}
                        className="btn-subtle btn-sm text-xs flex items-center gap-1 text-zinc-400 hover:text-white"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Support
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Invited Team Memberships */}
        {memberships.length > 0 && (
          <div className="pt-8 space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              Teams Joined as Member
            </h2>

            <div className="grid gap-4">
              {memberships.map((mem) => (
                <div
                  key={mem.id}
                  className="rounded-2xl bg-[#0B0D14] border border-white/10 p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                          {mem.event.category}
                        </span>
                        {mem.teamCode && (
                          <span className="text-xs font-mono font-bold text-zinc-400">
                            {mem.teamCode}
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-lg font-bold text-white">
                        {mem.event.name}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Team: <strong className="text-white">{mem.teamName}</strong> · Leader: {mem.leaderName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ ACTIVE MEMBER
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>{mem.event.venue}</span>
                      <span>·</span>
                      <span>{fmtDate(mem.event.startsAt)}</span>
                    </div>

                    {mem.qrImage && (
                      <button
                        onClick={() =>
                          setSelectedQr({
                            qrImage: mem.qrImage!,
                            title: `${mem.event.name} (${mem.teamName})`,
                            code: mem.teamCode || mem.code,
                          })
                        }
                        className="btn-ghost btn-sm text-xs flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4 text-[#D4AF37]" />
                        Show Gate Pass
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Lightbox Modal */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0B0D14] border border-[#D4AF37]/30 p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setSelectedQr(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
                Official Venue Check-in Pass
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                {selectedQr.title}
              </h3>
              <div className="font-mono text-xs text-zinc-400">
                {selectedQr.code}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-xl">
              <Image
                src={selectedQr.qrImage}
                alt="QR Code Pass"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>

            <p className="text-xs text-zinc-400">
              Present this code at the event gate to check in.
            </p>

            <div className="flex items-center gap-2 pt-2">
              {selectedQr.regId && (
                <Link
                  href={`/registration/${selectedQr.regId}`}
                  className="btn-primary w-full py-2.5 text-xs rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Full Pass Slip
                </Link>
              )}
              <button
                onClick={() => setSelectedQr(null)}
                className="btn-ghost w-full py-2.5 text-xs rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
