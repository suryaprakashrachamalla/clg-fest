"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  QrCode,
  Download,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Trophy,
  Loader2,
  Eye,
  RefreshCw,
  Clock,
  Check,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { fmtDateTime, fmtDate } from "@/lib/format";
import { CameraScanner } from "@/components/camera-scanner";
import { CATEGORIES } from "@/config/fest";

interface AdminStats {
  totalParticipants: number;
  totalTeams: number;
  totalRegistrations: number;
  confirmedRegistrations: number;
  pendingRegistrations: number;
  revenue: number;
  checkedIn: number;
  hackathon: {
    totalLimit: number;
    registered: number;
    remaining: number;
  };
}

interface EventItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  venue: string;
  fee: number;
  capacity: number | null;
  slotsTaken: number;
  isPublished: boolean;
  registrationOpen: boolean;
  formValues: any;
}

interface RegistrationRecord {
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
  qrToken?: string | null;
  event: { id: string; name: string; slug: string; category: string };
  paymentStatus: string;
  paymentId?: string | null;
  team: {
    code?: string | null;
    name: string;
    paidCapacity: number;
    memberCount: number;
    invitationCode?: string | null;
    members: { name: string; role: string; phone: string; college: string }[];
  } | null;
  checkIn?: { at: string; by: string } | null;
}

interface Props {
  user: { id: string; name: string; role: string };
  stats: AdminStats;
  events: EventItem[];
  registrations: RegistrationRecord[];
}

export function AdminClient({ user, stats, events, registrations }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "scanner" | "events" | "roles">("overview");

  // Registration Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Scanner States
  const [scanPayload, setScanPayload] = useState("");
  const [scanCard, setScanCard] = useState<any | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "lookup" | "checked_in" | "already" | "invalid">("idle");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  // Event Modal States (Create/Edit)
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    name: "",
    slug: "",
    category: "TECHNICAL",
    tagline: "",
    description: "",
    eligibility: "Open to all students",
    startsAt: "2026-10-16T10:00",
    endsAt: "2026-10-16T16:00",
    venue: "MVSR Campus",
    fee: 100,
    pricingMode: "PER_PARTICIPANT",
    participationType: "INDIVIDUAL",
    minTeamSize: 1,
    maxTeamSize: 1,
    capacity: "60",
    teamCodePrefix: "",
    accent: "violet",
    requiresStudentId: false,
    isPublished: true,
    registrationOpen: true,
    sortOrder: 10,
    rulesText: "Individual participation.\nValid ID required.",
    prizesText: "1st Place | 5000 | Cash Prize",
    coordinatorsText: "Faculty Coordinator | 9876543210 | info@mvsr.ac.in",
    faqsText: "Who can participate? :: Open to all registered students.",
  });
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // Role Promotion
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState<"ORGANIZER" | "ADMIN">("ORGANIZER");
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteMsg, setPromoteMsg] = useState<string | null>(null);

  // Filtered registrations
  const filteredRegs = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.team && r.team.name.toLowerCase().includes(q)) ||
        (r.team?.code && r.team.code.toLowerCase().includes(q));

      const matchesEvent = selectedEventId === "ALL" || r.event.id === selectedEventId;
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "PAID" && r.status === "CONFIRMED") ||
        (selectedStatus === "PENDING" && r.status === "PENDING") ||
        (selectedStatus === "CHECKED_IN" && Boolean(r.checkIn));

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [registrations, searchQuery, selectedEventId, selectedStatus]);

  // Execute QR Lookup or Check-in
  const handleVerifyScan = async (rawText: string, action: "lookup" | "checkin" = "lookup") => {
    if (!rawText.trim()) return;
    setScanLoading(true);
    setScanMsg(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: rawText.trim(), action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScanStatus("invalid");
        setScanCard(null);
        setScanMsg(data.error || "Invalid QR Code");
        return;
      }

      setScanCard(data.card);
      if (data.status === "already") {
        setScanStatus("already");
      } else if (data.status === "checked_in") {
        setScanStatus("checked_in");
        router.refresh();
      } else {
        if (data.card.checkIn) {
          setScanStatus("already");
        } else {
          setScanStatus("lookup");
        }
      }
    } catch {
      setScanStatus("invalid");
      setScanMsg("Network error verifying pass");
    } finally {
      setScanLoading(false);
    }
  };

  // Quick check-in from registration table
  const handleDirectCheckin = async (qrToken: string) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: qrToken, action: "checkin" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {}
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventSaving(true);
    setEventError(null);
    const url = editingEventId ? `/api/admin/events/${editingEventId}` : "/api/admin/events";
    const method = editingEventId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      setEventModalOpen(false);
      setEditingEventId(null);
      router.refresh();
    } catch (err: any) {
      setEventError(err.message || "Failed to save event");
    } finally {
      setEventSaving(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Cannot delete event");
      else router.refresh();
    } catch {
      alert("Error deleting event");
    }
  };

  // Promote User
  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteLoading(true);
    setPromoteMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: promoteEmail.trim().toLowerCase(), role: promoteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign role");
      setPromoteMsg(`✓ Assigned ${promoteRole} to ${promoteEmail}`);
      setPromoteEmail("");
    } catch (err: any) {
      setPromoteMsg(`✕ ${err.message}`);
    } finally {
      setPromoteLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container-x max-w-7xl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="eyebrow mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMINISTRATOR & ORGANIZER CONSOLE
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white">
            Sangamam <span className="text-gradient">Command Center</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Signed in as {user.name} ({user.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export"
            download
            className="btn-ghost text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-cyan" />
            Export CSV
          </a>

          <button
            onClick={() => setActiveTab("scanner")}
            className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-violet/25"
          >
            <QrCode className="w-4 h-4" />
            Open QR Scanner
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Participants</span>
            <Users className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {stats.totalParticipants}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across {stats.totalRegistrations} registrations
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Hackathon Teams</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {stats.hackathon.registered} / {stats.hackathon.totalLimit}
          </div>
          <div className="text-[11px] text-amber-300 font-semibold mt-1">
            {stats.hackathon.remaining} team slots remaining
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">
            {formatINR(stats.revenue)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {stats.confirmedRegistrations} successful payments
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Venue Checked In</span>
            <CheckCircle2 className="w-4 h-4 text-brand-fuchsia" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {stats.checkedIn}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Scanned via QR check-in
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-white/10 scrollbar-none">
        {[
          { key: "overview", label: "Overview & Hackathon" },
          { key: "registrations", label: `Registrations (${registrations.length})` },
          { key: "scanner", label: "QR Scanner & Check-in" },
          { key: "events", label: `Manage Events (${events.length})` },
          { key: "roles", label: "Volunteer Organizers" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === t.key
                ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20"
                : "bg-ink-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Hackathon 50 Teams Strict Capacity Focus Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-violet/20 via-ink-900 to-ink-900 border border-brand-violet/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  FLAGSHIP 24-HOUR HACKATHON
                </span>
                <h3 className="text-2xl font-display font-extrabold text-white">
                  Capacity Monitor: {stats.hackathon.registered} / 50 Teams
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Strict database row-level locking ensures that exactly 50 teams can register.
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-display font-black text-amber-300">
                  {stats.hackathon.remaining}
                </span>
                <span className="text-xs text-zinc-400 block">Slots Remaining</span>
              </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-brand-violet via-brand-fuchsia to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${(stats.hackathon.registered / 50) * 100}%` }}
              />
            </div>
          </div>

          {/* Event Capacities Table */}
          <div className="rounded-3xl bg-ink-900 border border-white/10 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-white">
              Event Capacity & Registrations Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="table-x">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Slots Booked</th>
                    <th>Capacity</th>
                    <th>Fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id}>
                      <td className="font-bold text-white">{e.name}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-zinc-300 border border-white/5">
                          {e.category}
                        </span>
                      </td>
                      <td className="font-semibold text-brand-cyan">{e.slotsTaken}</td>
                      <td>{e.capacity ? e.capacity : "Unlimited"}</td>
                      <td>{formatINR(e.fee)}</td>
                      <td>
                        {e.registrationOpen ? (
                          <span className="badge-ok">Open</span>
                        ) : (
                          <span className="badge-bad">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRATIONS */}
      {activeTab === "registrations" && (
        <div className="space-y-6">
          {/* Search and Filters Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-ink-900 border border-white/10">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search participant, team, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 text-xs py-2"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ALL">All Events</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Confirmed (Paid)</option>
                <option value="PENDING">Pending Payment</option>
                <option value="CHECKED_IN">Checked In</option>
              </select>

              <a
                href={`/api/admin/export?eventId=${selectedEventId === "ALL" ? "" : selectedEventId}`}
                className="btn-ghost btn-sm text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-brand-cyan" />
                Export Filtered
              </a>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="rounded-3xl bg-ink-900 border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="table-x">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Participant / Leader</th>
                    <th>Event</th>
                    <th>Team Details</th>
                    <th>Payment</th>
                    <th>Check-in Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.map((reg) => (
                    <tr key={reg.id}>
                      <td>
                        <span className="font-mono font-bold text-white">{reg.code}</span>
                        <div className="text-[10px] text-zinc-500">{fmtDate(reg.createdAt)}</div>
                      </td>
                      <td>
                        <div className="font-bold text-white text-xs">{reg.fullName}</div>
                        <div className="text-[11px] text-zinc-400">{reg.phone}</div>
                        <div className="text-[10px] text-zinc-500">{reg.college}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-white text-xs">{reg.event.name}</div>
                        <span className="text-[10px] text-brand-cyan">{reg.event.category}</span>
                      </td>
                      <td>
                        {reg.team ? (
                          <div>
                            <span className="font-bold text-brand-fuchsia text-xs">
                              {reg.team.name}
                            </span>
                            <div className="text-[10px] font-mono text-zinc-400">
                              {reg.team.code || "Code Pending"}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {reg.team.memberCount} / {reg.team.paidCapacity} Members
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-xs">Individual</span>
                        )}
                      </td>
                      <td>
                        {reg.status === "CONFIRMED" ? (
                          <span className="badge-ok">PAID ({formatINR(reg.amount)})</span>
                        ) : (
                          <span className="badge-warn">{reg.status}</span>
                        )}
                        {reg.paymentId && (
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[120px]">
                            {reg.paymentId}
                          </div>
                        )}
                      </td>
                      <td>
                        {reg.checkIn ? (
                          <div>
                            <span className="badge-ok">✓ Checked In</span>
                            <div className="text-[10px] text-zinc-500">
                              {fmtDateTime(reg.checkIn.at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-xs">Not Checked In</span>
                        )}
                      </td>
                      <td>
                        {!reg.checkIn && reg.status === "CONFIRMED" && reg.qrToken && (
                          <button
                            onClick={() => handleDirectCheckin(reg.qrToken!)}
                            className="btn-primary btn-sm text-[11px] px-2.5 py-1 rounded-lg"
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRegs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-500">
                        No registrations matching the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QR SCANNER & CHECK-IN */}
      {activeTab === "scanner" && (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Scanner Device Camera or manual input */}
          <div className="rounded-3xl bg-ink-900 border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-cyan" />
                Live Camera Scanner
              </h3>
              <span className="text-xs text-zinc-400">Position QR within frame</span>
            </div>

            {/* Embedded Camera Component */}
            <CameraScanner
              onScan={(scanned) => {
                setScanPayload(scanned);
                handleVerifyScan(scanned, "lookup");
              }}
            />

            {/* Manual token input fallback */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="label">Or Enter Verification Token Manually</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste URL or raw token..."
                  value={scanPayload}
                  onChange={(e) => setScanPayload(e.target.value)}
                  className="input text-xs"
                />
                <button
                  onClick={() => handleVerifyScan(scanPayload, "lookup")}
                  disabled={scanLoading || !scanPayload.trim()}
                  className="btn-primary text-xs px-4 rounded-xl font-bold shrink-0"
                >
                  {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Pass"}
                </button>
              </div>
            </div>
          </div>

          {/* Live Verification Card */}
          <div className="rounded-3xl bg-ink-900 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="font-display text-xl font-bold text-white">
              Verification Result
            </h3>

            {scanStatus === "idle" && (
              <div className="text-center py-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-500 text-xs">
                Scan a participant or team pass using the camera to view details and execute check-in.
              </div>
            )}

            {scanStatus === "invalid" && (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
                <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="font-display text-lg font-bold text-rose-300">
                  ✕ INVALID QR CODE
                </h4>
                <p className="text-xs text-zinc-400">{scanMsg || "Pass not recognized."}</p>
              </div>
            )}

            {scanCard && (
              <div className="space-y-5">
                {/* Status banner */}
                {scanStatus === "already" || scanCard.checkIn ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ⚠ ALREADY CHECKED IN
                    </div>
                    <div className="text-xs text-zinc-300">
                      Checked in at {fmtDateTime(scanCard.checkIn.at)} by {scanCard.checkIn.by}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ✓ VALID REGISTRATION
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{scanCard.code}</span>
                  </div>
                )}

                {/* Details */}
                <div className="p-5 rounded-2xl bg-ink-950/70 border border-white/10 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Event</span>
                    <span className="font-bold text-white">{scanCard.event.name}</span>
                  </div>

                  {scanCard.team ? (
                    <>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-400">Team</span>
                        <span className="font-bold text-brand-fuchsia">{scanCard.team.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-400">Team ID</span>
                        <span className="font-mono font-bold text-brand-cyan">{scanCard.team.code}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-400">Members</span>
                        <span className="font-bold text-white">{scanCard.team.memberCount} / {scanCard.team.paidCapacity}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400">Participant</span>
                      <span className="font-bold text-white">{scanCard.participant.name} ({scanCard.participant.college})</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-zinc-400">Payment</span>
                    <span className="font-bold text-emerald-400">
                      {scanCard.paymentStatus} ({formatINR(scanCard.amount)})
                    </span>
                  </div>
                </div>

                {/* Check In Action */}
                {!scanCard.checkIn && (
                  <button
                    onClick={() => handleVerifyScan(scanPayload, "checkin")}
                    disabled={scanLoading}
                    className="btn-primary w-full py-3.5 rounded-xl font-extrabold text-sm shadow-xl shadow-brand-violet/25 flex items-center justify-center gap-2"
                  >
                    {scanLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        CONFIRM CHECK IN
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE EVENTS */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl font-bold text-white">
              Fest Events & Competitions ({events.length})
            </h3>
            <button
              onClick={() => {
                setEditingEventId(null);
                setEventModalOpen(true);
              }}
              className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Event
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-ink-900 border border-white/10 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-brand-cyan border border-white/5">
                      {ev.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">
                      {ev.slotsTaken} / {ev.capacity ?? "∞"} slots
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">{ev.name}</h4>
                  <div className="text-xs text-zinc-400 mt-1">{ev.venue}</div>
                  <div className="text-xs font-bold text-brand-cyan mt-2">{formatINR(ev.fee)}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      setEditingEventId(ev.id);
                      setEventForm({
                        ...ev.formValues,
                        capacity: ev.formValues.capacity ? String(ev.formValues.capacity) : "",
                      });
                      setEventModalOpen(true);
                    }}
                    className="btn-ghost btn-sm text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="btn-danger btn-sm text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: VOLUNTEERS & ROLES */}
      {activeTab === "roles" && (
        <div className="max-w-xl mx-auto rounded-3xl bg-ink-900 border border-white/10 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              Assign Organizer & Admin Roles
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Grant verification & check-in scanning permissions to student volunteer accounts.
            </p>
          </div>

          {promoteMsg && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
              {promoteMsg}
            </div>
          )}

          <form onSubmit={handlePromote} className="space-y-4">
            <div>
              <label className="label">Registered Email Address *</label>
              <input
                type="email"
                placeholder="volunteer@mvsr.ac.in"
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="label">Access Role *</label>
              <select
                value={promoteRole}
                onChange={(e) => setPromoteRole(e.target.value as any)}
                className="input text-xs"
              >
                <option value="ORGANIZER">ORGANIZER (Scan QR passes & check in participants)</option>
                <option value="ADMIN">ADMIN (Full access to events, payments & role assignment)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={promoteLoading}
              className="btn-primary w-full py-3 rounded-xl font-bold text-xs shadow-lg shadow-brand-violet/25"
            >
              {promoteLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Assign Role"}
            </button>
          </form>
        </div>
      )}

      {/* Event Edit / Create Modal */}
      {eventModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-ink-900 border border-white/15 p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="font-display text-xl font-bold text-white">
              {editingEventId ? "Edit Event" : "Create New Event"}
            </h3>

            {eventError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {eventError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Event Name *</label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="label">Slug (URL identifier) *</label>
                  <input
                    type="text"
                    value={eventForm.slug}
                    onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                    className="input text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="input text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Participation Type</label>
                  <select
                    value={eventForm.participationType}
                    onChange={(e) => setEventForm({ ...eventForm, participationType: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                    <option value="TEAM">TEAM</option>
                  </select>
                </div>
                <div>
                  <label className="label">Registration Fee (INR)</label>
                  <input
                    type="number"
                    value={eventForm.fee}
                    onChange={(e) => setEventForm({ ...eventForm, fee: Number(e.target.value) })}
                    className="input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Tagline *</label>
                <input
                  type="text"
                  value={eventForm.tagline}
                  onChange={(e) => setEventForm({ ...eventForm, tagline: e.target.value })}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="input text-xs"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Venue *</label>
                  <input
                    type="text"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="label">Max Slots (blank = unlimited)</label>
                  <input
                    type="text"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="btn-ghost text-xs px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eventSaving}
                  className="btn-primary text-xs px-6 py-2.5 rounded-xl font-bold"
                >
                  {eventSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
