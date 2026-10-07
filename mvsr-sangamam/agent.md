# AGENTS.md — MVSR Sangamam 2026 Developer & Agent Architecture Context

> **Official Fest & Hackathon Platform for MVSR Sangamam 2026**  
> *Event Dates:* 16th–17th October 2026  
> *Flagship Tracks:* 1. National Hackathon (CSE Turing Labs), 2. Music Mob (Central Amphitheatre & Plaza), 3. Comedy Night (Main Stage).

---

## 1. Executive Summary & Repository Purpose

**MVSR Sangamam 2026** is an enterprise-grade full-stack event registration, ticketing, team formation, payment gateway, and physical QR check-in platform. It is engineered with strict production standards:
- **Clean Decoupled Monorepo:** Completely decoupled `frontend/` (Next.js 14 App Router) and `backend/` (Node.js + Express REST API).
- **Streamlined Backend Architecture:** Clean separation of concerns (Routes → Controllers → Services → Prisma ORM directly).
- **High Concurrency & Slot Consistency:** Atomic database-level conditional updates (`UPDATE ... WHERE capacity IS NULL OR slotsTaken < capacity`) eliminating race conditions during high-volume fest registration rushes.
- **Resilient Payment Integration:** Razorpay order generation with server-authoritative fee computation, cryptographic signature verification (HMAC-SHA256), webhook processing, and automatic mock-mode sandbox support for offline/local development.
- **Physical QR Passes & On-Site Verification:** 256-bit cryptographically random tokens encoded into dynamic QR slips, scanned at the venue via browser camera or hand scanners, with duplicate check-in prevention.
- **Cyberpunk / Neo-Tech Aesthetics:** Custom styling, dark mode (`#030208`), neon accents (`gold`, `sage`, `coral`, `violet`, `cyan`), procedural canvas background, and Web Audio API synthesized sounds (zero external audio dependencies).

---

## 2. Directory Layout & Monorepo Structure

```
SANGAGMAM/
├── AGENTS.md                          # Workspace-level context & agent guide
├── agent.md                           # Symlink / alias for AGENTS.md
└── mvsr-sangamam/                     # Main project workspace
    ├── AGENTS.md                      # Inner project context documentation
    ├── agent.md                       # Symlink / alias
    ├── .env                           # Environment configuration
    ├── .env.example                   # Annotated sample environment config
    ├── .gitignore                     # Git ignore rules (node_modules, .pg-data, .next, dist)
    ├── package.json                   # Root workspace orchestration scripts
    ├── README.md                      # Human-facing project overview
    │
    ├── backend/                       # 🟢 Standalone Node.js + Express REST API
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   ├── schema.prisma          # PostgreSQL relational schema
    │   │   └── seed.mjs               # Fest seed data & initial admin bootstrapper
    │   └── src/
    │       ├── app.ts                 # Express configuration (CORS, cookies, rawBody webhook capture, 404 & error handlers)
    │       ├── server.ts              # Server bootstrapper (port binding, DB connection check, graceful shutdown)
    │       ├── index.ts               # Core module facade exports
    │       ├── config/
    │       │   ├── env.config.ts      # Validated environment variables (PORT: 5001, AUTH_SECRET, RAZORPAY)
    │       │   └── fest.config.ts     # Fest schedule, categories, ceremonies, hackathon settings
    │       ├── controllers/           # HTTP Request/Response layer (DTO validation, cookie setters, response formatting)
    │       │   ├── admin.controller.ts
    │       │   ├── auth.controller.ts
    │       │   ├── checkin.controller.ts
    │       │   ├── dashboard.controller.ts
    │       │   ├── event.controller.ts
    │       │   ├── payment.controller.ts
    │       │   ├── registration.controller.ts
    │       │   └── team.controller.ts
    │       ├── services/              # Pure Domain & Business Logic layer (Direct Prisma ORM queries)
    │       │   ├── admin.service.ts
    │       │   ├── auth.service.ts
    │       │   ├── checkin.service.ts
    │       │   ├── dashboard.service.ts
    │       │   ├── event.service.ts
    │       │   ├── payment.service.ts
    │       │   ├── registration.service.ts
    │       │   └── team.service.ts
    │       ├── middlewares/           # Express Guards & Interceptors
    │       │   ├── auth.middleware.ts        # JWT session verification & role guards (requireAuth, requireOrganizer, requireAdmin)
    │       │   ├── error.middleware.ts       # Global exception & Zod error transformer
    │       │   └── rate-limit.middleware.ts  # Sliding-window token-bucket rate limiter with automatic stale cleanup
    │       ├── routes/                # Express Route Endpoints
    │       │   ├── admin.routes.ts
    │       │   ├── auth.routes.ts
    │       │   ├── checkin.routes.ts
    │       │   ├── dashboard.routes.ts
    │       │   ├── event.routes.ts
    │       │   ├── payment.routes.ts
    │       │   ├── registration.routes.ts
    │       │   ├── team.routes.ts
    │       │   └── index.ts                  # Master API router (/api/*)
    │       ├── validators/            # Zod DTO input validation schemas
    │       │   ├── admin.validator.ts
    │       │   ├── auth.validator.ts
    │       │   ├── event.validator.ts
    │       │   ├── registration.validator.ts
    │       │   └── team.validator.ts
    │       ├── integrations/          # External 3rd-party services
    │       │   └── razorpay.client.ts        # Orders API, HMAC-SHA256 signature verification, mock fallback
    │       ├── db/
    │       │   └── prisma.client.ts          # Singleton Prisma client connection pool & shared transaction types
    │       ├── types/                 # TypeScript interfaces, SessionPayload, SafeUser, ApiResponse
    │       │   └── index.ts
    │       └── utils/                 # Utilities
    │           ├── code-generator.util.ts    # Unambiguous human codes (A-Z, 2-9) & team sequences
    │           ├── format.util.ts            # CSV sanitization with formula injection defense
    │           ├── jwt.util.ts               # WebCrypto JWT token sign/verify
    │           ├── pricing.util.ts           # Server-authoritative fee computation & INR formatters
    │           ├── qr.util.ts                # Dynamic 256-bit QR generation & payload parser
    │           └── response.util.ts          # Uniform HttpError & sendSuccess/sendError helpers
    │
    ├── frontend/                      # 🔵 Next.js 14 App Router Client
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── next.config.mjs            # Next config with /api/* reverse proxy to backend
    │   ├── tailwind.config.ts         # Custom cyber colors, typography, neon shadows
    │   ├── postcss.config.mjs
    │   ├── public/                    # Static assets (logos, images)
    │   └── src/
    │       ├── middleware.ts          # Edge middleware for route protection
    │       ├── app/
    │       │   ├── layout.tsx         # Root layout with header, footer, cyber fonts
    │       │   ├── page.tsx           # Homepage experience with intro sequence & sections
    │       │   ├── globals.css        # Cyberpunk design system, glowing text, cyber-cards
    │       │   ├── login/             # Sign-in & registration portal
    │       │   ├── admin/             # Organizer & admin portal (stats, rosters, CSV export, live scanner)
    │       │   ├── dashboard/         # Participant dashboard (passes, QR slips, team invite links)
    │       │   ├── events/[slug]/     # Dynamic event detail page
    │       │   ├── register/[slug]/   # Checkout wizard (participant details, team setup, Razorpay/Mock checkout)
    │       │   ├── registration/[id]/ # Confirmed registration pass slip & printable receipt
    │       │   ├── join/              # Team invite code redemption page
    │       │   └── v/[token]/         # QR verification view for gate check-in
    │       ├── components/
    │       │   ├── common/            # CountdownTimer, CyberCanvas
    │       │   ├── events/            # EventCard, EventsSection, EventModal, DynamicCapacityBadge
    │       │   ├── home/              # Hero, About, Schedule, FAQ, Contact, SangamamExperience, TechRailNav
    │       │   ├── layout/            # SiteHeader, SiteFooter, HeaderClient
    │       │   ├── scanner/           # CameraScanner (HTML5 QR camera scanner)
    │       │   └── index.ts           # Barrel exports
    │       ├── config/
    │       │   ├── fest.ts            # Fest constants, dates, categories
    │       │   └── flagship-events.ts # Flagship card metadata (Hackathon, Music Mob, Comedy Night)
    │       ├── services/
    │       │   ├── api.ts             # Typed server-side and client-side backend API client
    │       │   └── razorpay.ts        # Razorpay checkout script dynamic loader
    │       ├── utils/
    │       │   ├── audio.ts           # Web Audio API sound synthesizer
    │       │   ├── format.ts          # INR currency formatters, date/time in IST, accents
    │       │   ├── pricing.ts         # Client calculation mirror
    │       │   └── session.ts         # Edge-compatible session encoder
    │       └── lib/                   # Module adapters & shared types (events.ts, auth.ts)
    │
    └── scripts/                       # Developer & CI verification harnesses
        ├── dev-db.mjs                 # Embedded PostgreSQL database engine (port 5433)
        ├── test-e2e.mjs               # Full domain business logic verification test
        ├── test-api-e2e.mjs           # HTTP REST API end-to-end integration test
        └── test-full-roundtrip.mjs    # Complete user lifecycle test (leader -> payment -> invite -> join -> checkin)
```

---

## 3. Production Architecture Pattern

In strict adherence to production-grade software engineering, business logic and database queries are never mixed with HTTP transport logic:

```
┌────────────────────────────────────────────────────────┐
│                   HTTP Request                         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 1. Routes Layer (`backend/src/routes/`)                │
│    - Binds URL endpoints                               │
│    - Attaches rate-limiting middleware                 │
│    - Attaches authorization guards                     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Controllers Layer (`backend/src/controllers/`)      │
│    - Validates request body/params using Zod DTOs      │
│    - Extracts authenticated session from `req.user`    │
│    - Invokes domain services                           │
│    - Sets secure HTTP-only cookies                     │
│    - Formats uniform JSON responses via `sendSuccess`  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Services Layer (`backend/src/services/`)            │
│    - Pure domain & business calculations               │
│    - Enforces rules: team capacity, payment timeouts   │
│    - Direct Prisma ORM operations & transactions (tx)  │
│    - Generates codes, handles Razorpay orders          │
│    - Executes atomic conditional updates (CAS)         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Database (PostgreSQL via Prisma ORM Singleton)      │
└────────────────────────────────────────────────────────┘
```

---

## 4. Relational Database Schema & Entities

The platform uses PostgreSQL with Prisma ORM (`backend/prisma/schema.prisma`):

### 1. `User`
- **Fields:** `id` (cuid), `email` (unique, lowercase), `passwordHash` (bcrypt 12 rounds), `name`, `phone`, `college`, `studentId`, `role` (enum: `PARTICIPANT`, `ORGANIZER`, `ADMIN`), timestamps.
- **Relations:** 1-to-many `Registration`, 1-to-many `TeamMember`, 1-to-many led `Team`, 1-to-many `CheckIn` records executed as organizer.

### 2. `Event`
- **Fields:** `id`, `slug` (unique), `name`, `category` (enum: `HACKATHON`, `TECHNICAL`, `CULTURAL`, `GAMING`, `WORKSHOP`, `OTHER`), `tagline`, `description`, `rules` (string[]), `eligibility`, `startsAt`, `endsAt`, `venue`, `fee` (INR integer whole rupees), `pricingMode` (enum: `PER_PARTICIPANT`, `PER_TEAM`), `participationType` (enum: `INDIVIDUAL`, `TEAM`), `minTeamSize`, `maxTeamSize`, `capacity` (null = unlimited), `slotsTaken` (confirmed + currently held reservations), `teamSeq` (monotonic counter for human team IDs), `teamCodePrefix` (e.g. `HACK-2026`), `prizes` (JSON), `coordinators` (JSON), `faqs` (JSON), `accent`, `requiresStudentId`, `isPublished`, `registrationOpen`, `sortOrder`.

### 3. `Registration`
- **Fields:** `id`, `code` (unique human ref, e.g. `REG-X8K2M9`), `userId`, `eventId`, `status` (enum: `PENDING`, `CONFIRMED`, `EXPIRED`, `CANCELLED`, `FAILED`), `activeKey` (unique: `${userId}:${eventId}` when pending/confirmed, `null` when expired/cancelled to prevent multiple active registrations while allowing re-registration), `participantCount`, `amount` (INR integer computed server-side), `fullName`, `email`, `phone`, `college`, `studentId`, `teamName`, `qrToken` (unique 256-bit URL-safe token), `expiresAt` (held slot expiration timestamp), `confirmedAt`, timestamps.
- **Relations:** Belongs to `User` and `Event`. Has many `Payment` attempts, optional 1-to-1 `Team`, optional 1-to-1 `CheckIn`.

### 4. `Team`
- **Fields:** `id`, `code` (assigned upon payment, e.g. `HACK-2026-0012`), `name` (unique per event: `@@unique([eventId, name])`), `eventId`, `leaderId`, `registrationId` (unique 1-to-1 with Registration), `paidCapacity`, `memberCount`, `status` (enum: `PENDING`, `ACTIVE`).
- **Relations:** Led by `User`, belongs to `Event` and `Registration`. Has many `TeamMember` entries, optional 1-to-1 `InvitationCode`.

### 5. `TeamMember`
- **Fields:** `id`, `teamId`, `userId`, `eventId`, `role` (enum: `LEADER`, `MEMBER`), `fullName`, `email`, `phone`, `college`, `studentId`, `joinedAt`.
- **Unique Constraint:** `@@unique([eventId, userId])` — guarantees a user can belong to only one team per event across the entire fest.

### 6. `InvitationCode`
- **Fields:** `id`, `code` (unique 6-character human code without ambiguous characters `I, L, O, 0, 1`), `teamId` (unique), `isActive` (boolean), `expiresAt`, `createdAt`.

### 7. `Payment`
- **Fields:** `id`, `registrationId`, `razorpayOrderId` (unique), `razorpayPaymentId` (unique), `razorpaySignature`, `amount` (in paise, integer), `currency` ("INR"), `status` (enum: `CREATED`, `PAID`, `FAILED`, `CANCELLED`, `EXPIRED`, `REFUND_REQUIRED`), `method`, `failureReason`, timestamps.

### 8. `CheckIn`
- **Fields:** `id`, `registrationId` (unique 1-to-1 guard preventing double check-in at DB level), `checkedInById` (`User`), `checkedInAt`.

---

## 5. Key Workflows & State Machines

### 5.1. Registration & Payment Flow

```
[ Participant selects event & fills form ]
                     │
                     ▼
[ POST /api/registrations ]
  1. Validates input via Zod schema
  2. Recomputes amount server-side via computeAmount()
  3. Cleans up stale registrations (status: PENDING & expiresAt < NOW)
  4. Checks activeKey: ${userId}:${eventId}
  5. Atomically reserves slot:
     UPDATE "Event" SET "slotsTaken" = "slotsTaken" + 1 
     WHERE id = :id AND (capacity IS NULL OR slotsTaken < capacity)
  6. Holds slot for 15 minutes (FEST.paymentWindowMinutes)
  7. If fee == 0: immediately confirms and generates QR
  8. If fee > 0: creates Razorpay order (or mock order)
                     │
                     ▼
[ Client Checkout (Razorpay Modal or Sandbox Simulation) ]
                     │
         ┌───────────┴───────────┐
      Success                 Failure / Cancel
         │                       │
         ▼                       ▼
[ POST /api/payments/verify ]  [ POST /api/payments/failure ]
  1. Verifies HMAC-SHA256 signature   1. Records failure reason
  2. Marks Payment as PAID            2. Allows retry before expiresAt
  3. Confirms Registration (CONFIRMED)
  4. Generates 256-bit QR token
  5. Activates Team & generates:
     - Team Code: HACK-2026-0001
     - Invitation Code: CFX87F
```

### 5.2. Teammate Invitation & Free Join Flow

1. **Leader Obtains Code:** After paying for $N$ members (e.g., 3 members), the leader's dashboard and registration slip display the 6-character code (e.g. `CFX87F`) and one-click invite link (`http://localhost:3000/join?code=CFX87F`).
2. **Lookup:** Teammate navigates to `/join`. Client queries `GET /api/teams/lookup?code=CFX87F`.
3. **State Validation:** Service verifies:
   - Team status is `ACTIVE`
   - Code is not expired
   - Team is not full (`memberCount < paidCapacity`)
4. **Seat Claim:** Teammate signs up/logs in and clicks **Join Team**:
   - Executes atomic seat claim:
     `UPDATE "Team" SET "memberCount" = "memberCount" + 1 WHERE id = :id AND status = 'ACTIVE' AND memberCount < paidCapacity`
   - Inserts `TeamMember` record.
   - If `memberCount == paidCapacity`, sets `InvitationCode.isActive = false`.

### 5.3. Gate QR Verification & Check-In

1. **Pass Generation:** Every confirmed registration generates a cryptographically random 256-bit token (`qrToken`) encoded as a QR code pointing to `/v/[token]`.
2. **Scan:** Gate volunteer/organizer scans the attendee's mobile screen using the built-in HTML5 camera scanner (`/admin`) or any camera app.
3. **Verification Screen (`/v/[token]`):**
   - Shows event details, participant credentials, team roster, payment proof.
   - If attendee was already checked in, displays alert: `Already checked in at [Time] by [Volunteer]`.
   - If scanned by logged-in `ORGANIZER` or `ADMIN`, displays one-tap **"Confirm Venue Admission"** button.
4. **Execution:** `POST /api/checkin` creates a `CheckIn` record linked to the registration. The database `registrationId` unique constraint ensures admission can never be recorded twice.

---

## 6. API Sitemap & Endpoint Reference

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user account & set session cookie |
| `POST` | `/api/auth/login` | Public | Sign in with email & password, sets session cookie |
| `POST` | `/api/auth/logout` | Public | Clears `sangamam_session` HTTP cookie |
| `GET` | `/api/auth/me` | Public / Optional | Returns sanitized profile (passwordHash omitted) |
| `GET` | `/api/events` | Public | List all published events with remaining slots |
| `GET` | `/api/events/stats` | Public | Fest-wide telemetry (events count, participants) |
| `GET` | `/api/events/:slug` | Public | Event detail metadata, rules, prizes, coordinators |
| `GET` | `/api/events/:slug/availability` | Public | Real-time capacity tracker (slots taken, remaining, open) |
| `POST` | `/api/events` | `ADMIN` | Create new fest event |
| `PUT` | `/api/events/:id` | `ADMIN` | Update existing event metadata |
| `DELETE` | `/api/events/:id` | `ADMIN` | Delete event (blocked if registrations exist) |
| `POST` | `/api/registrations` | `PARTICIPANT` | Reserve slot & initiate registration / order |
| `GET` | `/api/registrations/:id` | Owner / Organizer | Get registration pass slip, QR image, team invite |
| `DELETE` | `/api/registrations/:id` | Owner / `ADMIN` | Cancel pending registration and release slot |
| `POST` | `/api/registrations/:id/resume` | Owner | Resume checkout on pending registration |
| `POST` | `/api/payments/verify` | Public / Client | Verify Razorpay checkout signature & confirm pass |
| `POST` | `/api/payments/failure` | `PARTICIPANT` | Record payment gateway failure/cancellation |
| `POST` | `/api/webhooks/razorpay` | Razorpay / Public | Inbound webhook for payment.captured, order.paid |
| `GET` | `/api/teams/lookup` | Public | Validate invite code & retrieve team preview |
| `POST` | `/api/teams/join` | `PARTICIPANT` | Join team using valid invitation code |
| `GET` | `/api/checkin/:token` | Public | Fetch verification card for gate admission |
| `POST` | `/api/checkin` | `ORGANIZER` / `ADMIN` | Record gate check-in admission |
| `GET` | `/api/v/:token` | Public | Alias for verification card |
| `GET` | `/api/dashboard/overview` | `PARTICIPANT` | Participant passes, led teams, and memberships |
| `GET` | `/api/admin/overview` | `ORGANIZER` / `ADMIN` | Aggregated fest stats, rosters, and financial audit |
| `GET` | `/api/admin/export` | `ORGANIZER` / `ADMIN` | Download formula-safe CSV export (optional `?eventId=`) |
| `POST` | `/api/admin/users` | `ADMIN` | Promote or reassign user roles |
| `POST` | `/api/admin/events` | `ADMIN` | Admin alias for event creation |
| `PUT` | `/api/admin/events/:id` | `ADMIN` | Admin alias for event updates |
| `DELETE` | `/api/admin/events/:id` | `ADMIN` | Admin alias for event deletion |
| `GET` | `/health` | Public | Healthcheck probe returning timestamp |

---

## 7. Security Hardening & Defenses

1. **Password Sanitization:**
   - Passwords hashed using standard `bcryptjs` with salt round cost 12.
   - Timing attack protection on login via constant-time dummy hash comparison.
   - All controller outputs sanitize user records; `passwordHash` is never exposed over the API.
2. **Session Protection:**
   - WebCrypto HMAC-SHA256 JWT tokens with 7-day expiration.
   - Transmitted via secure `HttpOnly`, `SameSite=Lax` cookies, with `Bearer` header fallback.
   - Server-side role re-validation on every protected endpoint directly against PostgreSQL.
3. **Race Condition Prevention:**
   - Atomic SQL conditional updates for slot holding (`reserveSlot`) and seat claiming (`claimSeat`).
   - PostgreSQL row-level locks (`SELECT id FROM "Payment" WHERE "razorpayOrderId" = :id FOR UPDATE`) preventing double-payment confirmation during simultaneous webhook and client callbacks.
4. **Anti-CSV Formula Injection:**
   - Cells in CSV exports starting with `=`, `+`, `-`, `@`, `\t`, `\r` are automatically prefixed with a single quote `'` in `backend/src/utils/format.util.ts`.
5. **Rate Limiting:**
   - In-memory token-bucket sliding-window rate limiters protecting authentication routes (15 req/min), payment confirmations, and invitation lookups.
   - Automatic background cleanup of stale IP buckets every 5 minutes.
6. **Port Conflict Protection (macOS Monterey+):**
   - Backend configured to run on Port `5001` (to prevent conflict with macOS AirPlay Receiver which binds `5000` by default).

---

## 8. Development Workflows & Running the System

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22)
- npm 9+

### 1. Start Local Database (PostgreSQL)
```bash
cd mvsr-sangamam
npm run db:local
```
*Starts embedded PostgreSQL on `localhost:5433` storing data in `.pg-data/`.*

### 2. Push Prisma Schema & Seed Events
```bash
npm run db:push
npm run db:seed
```
*Creates initial events (Hackathon, Code Sprint, Byte Quiz, RoboWars, etc.) and creates the default admin account.*

### 3. Start Development Servers
```bash
# Run both Backend (Port 5001) and Frontend (Port 3000) simultaneously:
npm run dev:all

# Or run separately:
npm run dev:backend   # Express REST API on http://localhost:5001
npm run dev:frontend  # Next.js 14 App Client on http://localhost:3000
```

### 4. Verify & Test Suite
```bash
# 1. Typecheck across entire monorepo
npm run typecheck

# 2. Run domain business logic verification (atomic slots, team capacity, payment confirmation)
npm run test:e2e

# 3. Build validation
npm run build:backend
npm run build:frontend
```

### 5. Default Credentials
- **Admin Email:** `admin@mvsrsangamam.in`
- **Admin Password:** `Sangamam@Admin2026`
- **Admin Dashboard:** `http://localhost:3000/admin`
- **Leader Mock Sandbox:** When registering without live Razorpay credentials, use the simulated payment modal. Mock payments confirm immediately without charging real money.
