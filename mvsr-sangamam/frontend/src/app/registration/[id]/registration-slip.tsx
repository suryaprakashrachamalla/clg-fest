"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  Printer,
  LayoutDashboard,
  Calendar,
  MapPin,
  Share2,
  Download,
  Loader2,
  CalendarPlus,
  ShieldCheck,
  Award,
  Users,
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
  const [copiedShare, setCopiedShare] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

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

  const sharePass = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Here is my official entry pass for ${event.name} at MVSR Sangamam 2026 (Pass #${registration.code})!`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${FEST.name} Entry Pass - ${event.name}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported, fallback to clipboard
      }
    }

    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Google Calendar Integration
  const getGoogleCalendarUrl = () => {
    const startDate = new Date(event.startsAt);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4-hour default window

    const formatGDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const title = encodeURIComponent(`${event.name} — MVSR Sangamam 2026`);
    const details = encodeURIComponent(
      `Official Event Pass #${registration.code}\nParticipant: ${registration.fullName}\nVenue: ${event.venue}\nCollege: ${FEST.college}`
    );
    const location = encodeURIComponent(`${event.venue}, ${FEST.location}`);
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // High-Resolution Pure HTML5 Canvas Ticket PNG Generator
  const downloadTicketImage = async () => {
    if (!qrImage) return;
    setIsGeneratingPng(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background
      ctx.fillStyle = "#0A0B10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle ambient gradient
      const bgGrad = ctx.createRadialGradient(250, 150, 50, 300, 200, 600);
      bgGrad.addColorStop(0, "rgba(212, 175, 55, 0.08)");
      bgGrad.addColorStop(1, "rgba(10, 11, 16, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border (Gold luxury frame)
      ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner subtle border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // 2. Top Header Bar
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("MVSR SANGAMAM 2026 · OFFICIAL FESTIVAL VIP ENTRY PASS", 65, 80);

      ctx.fillStyle = "#8E92A4";
      ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`${FEST.college.toUpperCase()} · HYDERABAD`, 65, 102);

      // Registration Code Stamp (Top Right)
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(registration.code, canvas.width - 65, 88);

      ctx.fillStyle = "#10B981";
      ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("✓ CONFIRMED & ADMITTED", canvas.width - 65, 108);

      // Horizontal Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(65, 128);
      ctx.lineTo(canvas.width - 65, 128);
      ctx.stroke();

      ctx.textAlign = "left";

      // 3. Event Details (Left Column)
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`CATEGORY: ${event.category.toUpperCase()}`, 65, 165);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(event.name, 65, 208);

      // Date & Venue
      ctx.fillStyle = "#C5C8D4";
      ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`📅 ${fmtDate(event.startsAt)} at ${fmtTime(event.startsAt)}`, 65, 245);
      ctx.fillText(`📍 ${event.venue}`, 65, 275);

      // 4. Attendee Details
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.moveTo(65, 305);
      ctx.lineTo(750, 305);
      ctx.stroke();

      ctx.fillStyle = "#717688";
      ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("ATTENDEE CREDENTIALS", 65, 335);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(registration.fullName, 65, 365);

      ctx.fillStyle = "#A1A5B7";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`College: ${registration.college}`, 65, 395);
      if (registration.studentId) {
        ctx.fillText(`Student ID: ${registration.studentId}  |  Email: ${registration.email}`, 65, 420);
      } else {
        ctx.fillText(`Email: ${registration.email}`, 65, 420);
      }

      // Team Details if present
      if (team) {
        ctx.fillStyle = "#D4AF37";
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(`TEAM: ${team.name} (${team.code || "Registered"})`, 65, 455);
        if (team.invitationCode) {
          ctx.fillStyle = "#A1A5B7";
          ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(`Invite Code: ${team.invitationCode}  (${team.memberCount}/${team.paidCapacity} Members)`, 65, 478);
        }
      }

      // 5. Perforated Notch & Vertical Separator
      ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(820, 140);
      ctx.lineTo(820, canvas.height - 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6. Draw QR Code on the right side
      await new Promise<void>((resolve) => {
        const qrImg = new window.Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          // White background card for QR code so physical scanners read it flawlessly
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(870, 160, 250, 250, 16);
          ctx.fill();

          ctx.drawImage(qrImg, 885, 175, 220, 220);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SCAN AT VENUE GATE", 995, 440);

          ctx.fillStyle = "#8E92A4";
          ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("Valid for single person admission", 995, 460);

          resolve();
        };
        qrImg.src = qrImage;
      });

      // 7. Bottom Security Barcode Simulation
      ctx.textAlign = "left";
      ctx.fillStyle = "#1E2230";
      ctx.fillRect(65, 520, 750, 36);

      // Draw vertical barcode lines
      ctx.fillStyle = "#D4AF37";
      for (let x = 80; x < 500; x += Math.floor(Math.random() * 8) + 4) {
        const barWidth = (x % 3 === 0) ? 3 : 1.5;
        ctx.fillRect(x, 526, barWidth, 24);
      }

      ctx.fillStyle = "#8E92A4";
      ctx.font = "11px monospace";
      ctx.fillText(`SECURITY TOKEN: ${registration.id.slice(0, 18).toUpperCase()}...`, 530, 542);

      // Bottom disclaimer
      ctx.fillStyle = "#6B7280";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("MVSR Engineering College · Valid institutional photo ID required at the entrance · Non-transferable", 65, 580);

      // 8. Convert to Blob & Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MVSR-Sangamam-${registration.code}-Ticket.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsGeneratingPng(false);
      }, "image/png");
    } catch (err) {
      console.error("Ticket generation failed:", err);
      setIsGeneratingPng(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container-x max-w-4xl">
      {/* Top Celebration Notification */}
      <div className="no-print text-center mb-8 space-y-2.5 animate-fade-in">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Registration Confirmed
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
          Your entry pass for <strong className="text-[#D4AF37]">{event.name}</strong> is ready. Present this pass at the gate for fast venue check-in.
        </p>
      </div>

      {/* Main Printable VIP Ticket Card */}
      <div className="print-card rounded-3xl bg-[#0B0D14] border border-[#D4AF37]/30 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Ticket Perforated Cutout Notches (Left & Right) */}
        <div className="no-print hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#08090E] border-r border-[#D4AF37]/30 z-10" />
        <div className="no-print hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#08090E] border-l border-[#D4AF37]/30 z-10" />

        {/* Ticket Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-white tracking-tight">
                {FEST.name} {FEST.edition}
              </div>
              <div className="text-xs text-zinc-400">{FEST.college} · Official Festival Pass</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
              Pass Reference
            </span>
            <span className="font-mono font-bold text-xl text-[#D4AF37] tracking-wider">
              {registration.code}
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Confirmed & Paid
              </span>
            </div>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20 mb-2">
                {event.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                {event.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 mt-2.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {event.venue}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-medium">Admission Fee</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/[0.05] text-white border border-white/10 mt-1">
                {registration.amount === 0 ? "FREE ENTRY" : `${formatINR(registration.amount)} PAID`}
              </span>
            </div>
          </div>

          {/* Hackathon / Team Section */}
          {team && (
            <div className="p-5 rounded-2xl bg-[#0F121C] border border-[#D4AF37]/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Team Name
                  </span>
                  <div className="font-display text-lg font-bold text-white">
                    {team.name}
                  </div>
                </div>

                {team.code && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                      Team ID
                    </span>
                    <div className="font-mono text-sm font-bold text-[#D4AF37]">
                      {team.code}
                    </div>
                  </div>
                )}
              </div>

              {/* Members progress */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Team Formation Capacity</span>
                  <span className="font-semibold text-white">
                    {team.memberCount} of {team.paidCapacity} seats filled
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${(team.memberCount / team.paidCapacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Invitation Code & Link */}
              {team.invitationCode && team.memberCount < team.paidCapacity && (
                <div className="p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                        Teammate Invitation Code
                      </span>
                      <span className="font-mono text-2xl font-bold text-white tracking-widest">
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
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-400 truncate">
                        Invite Link: {team.inviteLink}
                      </span>
                      <button
                        onClick={copyLink}
                        className="text-[#D4AF37] font-semibold hover:underline shrink-0 flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Share this code with your teammates so they can join free on the &ldquo;Join a Team&rdquo; page.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QR Code and Participant Information */}
          <div className="grid sm:grid-cols-2 gap-6 pt-2 items-center">
            {/* Participant Details */}
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">
                Pass Holder Credentials
              </div>
              <div>
                <strong className="text-zinc-400">Full Name:</strong> {registration.fullName}
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
              <div className="pt-2 text-[11px] text-zinc-500">
                Issued on {fmtDate(registration.createdAt)}
              </div>
            </div>

            {/* Dynamic QR Code Pass */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              {qrImage ? (
                <>
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <Image
                      src={qrImage}
                      alt="Venue Check-in QR Code"
                      width={160}
                      height={160}
                      className="rounded"
                    />
                  </div>
                  <div className="mt-3 text-xs font-semibold text-white">
                    Scan for Gate Check-in
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Save ticket to show offline at the entrance
                  </div>
                </>
              ) : (
                <div className="p-8 text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating secure venue token...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info & Security Hash */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            {FEST.name} {FEST.edition} · {FEST.college}, Hyderabad. Photo ID required.
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            TOKEN: {registration.id.slice(0, 12)}
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PNG, Print, Calendar, Share */}
      <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-3">
        {/* Instant High-Resolution Canvas PNG Download */}
        <button
          onClick={downloadTicketImage}
          disabled={!qrImage || isGeneratingPng}
          className="btn-primary px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-xs shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
        >
          {isGeneratingPng ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Ticket PNG...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Ticket (PNG)
            </>
          )}
        </button>

        {/* Standard Print / PDF */}
        <button
          onClick={() => window.print()}
          className="btn-ghost px-4 py-3 rounded-xl font-semibold flex items-center gap-2 text-xs"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>

        {/* Add to Google Calendar */}
        <a
          href={getGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-4 py-3 rounded-xl font-semibold flex items-center gap-2 text-xs"
        >
          <CalendarPlus className="w-4 h-4 text-[#D4AF37]" />
          Add to Calendar
        </a>

        {/* Share Pass */}
        <button
          onClick={sharePass}
          className="btn-ghost px-4 py-3 rounded-xl font-semibold flex items-center gap-2 text-xs"
        >
          <Share2 className="w-4 h-4" />
          {copiedShare ? "Link Copied!" : "Share Pass"}
        </button>

        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className="btn-subtle px-4 py-3 rounded-xl font-medium flex items-center gap-2 text-xs"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
