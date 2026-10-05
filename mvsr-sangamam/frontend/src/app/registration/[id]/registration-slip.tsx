"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  Printer,
  LayoutDashboard,
  Users,
  QrCode,
  Calendar,
  MapPin,
  Sparkles,
  Share2,
} from "lucide-react";
import { FEST } from "@/config/fest";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";

interface Props {
  registration: {
    id: string;
    code: string;
    status: string;
    amount: number;
    createdAt: string;
    fullName: string;
    email: string;
    phone: string;
    college: string;
    studentId?: string | null;
    teamName?: string | null;
  };
  event: {
    name: string;
    category: string;
    venue: string;
    startsAt: string;
  };
  team: {
    code?: string | null;
    name: string;
    paidCapacity: number;
    memberCount: number;
    invitationCode?: string | null;
    inviteLink?: string | null;
    members: { name: string; role: string; college: string }[];
  } | null;
  qrImage: string | null;
}

export function RegistrationSlip({ registration, event, team, qrImage }: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyCode = () => {
    if (team?.invitationCode) {
      navigator.clipboard.writeText(team.invitationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyLink = () => {
    if (team?.inviteLink) {
      navigator.clipboard.writeText(team.inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container-x max-w-3xl">
      {/* Top Celebration Notification */}
      <div className="no-print text-center mb-8 space-y-2 animate-fade-in">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          🎉 REGISTRATION SUCCESSFUL
        </h1>
        <p className="text-base text-zinc-300">
          Welcome to <strong className="text-white">{FEST.name} {FEST.edition}</strong>! Your spot is confirmed.
        </p>
      </div>

      {/* Main Printable Ticket Card */}
      <div className="print-card rounded-3xl bg-ink-900 border border-white/15 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <div className="font-display text-lg font-bold text-white">
                {FEST.name} {FEST.edition}
              </div>
              <div className="text-xs text-zinc-400">{FEST.college}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Registration ID
            </div>
            <div className="font-display font-black text-xl text-brand-cyan tracking-wider">
              {registration.code}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-fuchsia font-bold block mb-1">
                {event.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                {event.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {event.venue}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-medium">Payment Status</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ✓ {formatINR(registration.amount)} — PAID
              </span>
            </div>
          </div>

          {/* Hackathon Team Section */}
          {team && (
            <div className="p-5 rounded-2xl bg-ink-950/80 border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Team Name
                  </span>
                  <div className="font-display text-xl font-bold text-white">
                    {team.name}
                  </div>
                </div>

                {team.code && (
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                      Team ID
                    </span>
                    <div className="font-display text-base font-extrabold text-brand-cyan tracking-wider">
                      {team.code}
                    </div>
                  </div>
                )}
              </div>

              {/* Members progress */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Team Formation Capacity</span>
                  <span className="font-bold text-white">
                    {team.memberCount} / {team.paidCapacity} Members Joined
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-violet to-brand-cyan rounded-full transition-all"
                    style={{ width: `${(team.memberCount / team.paidCapacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Invitation Code & Link */}
              {team.invitationCode && team.memberCount < team.paidCapacity && (
                <div className="p-4 rounded-xl bg-brand-violet/10 border border-brand-violet/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-violet uppercase tracking-wider block">
                        Teammate Invitation Code
                      </span>
                      <span className="font-display text-2xl font-black text-white tracking-widest">
                        {team.invitationCode}
                      </span>
                    </div>

                    <button
                      onClick={copyCode}
                      className="btn-ghost btn-sm text-xs flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedCode ? "Copied!" : "Copy Code"}
                    </button>
                  </div>

                  {team.inviteLink && (
                    <div className="pt-2 border-t border-brand-violet/10 flex items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-400 truncate">
                        Direct Link: {team.inviteLink}
                      </span>
                      <button
                        onClick={copyLink}
                        className="text-brand-cyan font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Share this code with your teammates. They can join free on the &ldquo;Join a Team&rdquo; page!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QR Code and Participant Information */}
          <div className="grid sm:grid-cols-2 gap-6 pt-2 items-center">
            {/* Participant Details */}
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold mb-2">
                Participant Information
              </div>
              <div>
                <strong className="text-zinc-400">Name:</strong> {registration.fullName}
              </div>
              <div>
                <strong className="text-zinc-400">Email:</strong> {registration.email}
              </div>
              <div>
                <strong className="text-zinc-400">Phone:</strong> {registration.phone}
              </div>
              <div>
                <strong className="text-zinc-400">College:</strong> {registration.college}
              </div>
              {registration.studentId && (
                <div>
                  <strong className="text-zinc-400">Student ID:</strong> {registration.studentId}
                </div>
              )}
            </div>

            {/* Dynamic QR Code Pass */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              {qrImage ? (
                <>
                  <Image
                    src={qrImage}
                    alt="Registration QR Code"
                    width={180}
                    height={180}
                    className="rounded-xl bg-white p-2 shadow-lg"
                  />
                  <div className="mt-3 text-[11px] text-zinc-400">
                    Scan at venue entrance for instant check-in.
                  </div>
                </>
              ) : (
                <div className="p-8 text-zinc-500 text-xs">
                  Generating venue pass...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-zinc-500">
          MVSR Sangamam 2026 · MVSR Engineering College, Nadergul, Hyderabad. Valid photo ID required.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => window.print()}
          className="btn-ghost px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm"
        >
          <Printer className="w-4 h-4" />
          Download / Print Ticket
        </button>

        <Link
          href="/dashboard"
          className="btn-primary px-7 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-xl shadow-brand-violet/25"
        >
          <LayoutDashboard className="w-4 h-4" />
          Go to Participant Dashboard
        </Link>
      </div>
    </div>
  );
}
