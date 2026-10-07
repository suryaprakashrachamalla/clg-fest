# MVSR Sangamam 2026 — Current Website Functioning

> A plain-English walkthrough of how this codebase currently works end-to-end, what a real user / organizer / admin can actually do today, and what is still missing. Based on the current `main` branch of the repo at `clg-fest/mvsr-sangamam/`.

---

## 1. What this codebase is

Written for: a non-engineer collaborator who wants to understand what the site can already do before deciding what to build next.

This is a **two-service full-stack web app** for a college fest called *MVSR Sangamam 2026* (dated 16–17 Oct 2026, MVSR Engineering College,  Hyderabad). It handles the full lifecycle of a fest:

- Public marketing homepage (hero, events, schedule, FAQ, contact)
- User sign-up / login
- Registering for events (solo or team)
- Paying through **Razorpay** (with a mock-mode fallback for local testing)
- Participants get a QR-coded pass
- Team invitation codes so members join the leader's paid team without paying again
- A participant dashboard
- An admin + organizer portal with stats, CSV export, event CRUD, and camera-based QR check-in

### Stack at a glance

| Layer | Technology |
|------|------------|
| Frontend | Next.js 14 (App Router) + React 18 + TailwindCSS + lucide-react icons |
| Backend  | Node.js + Express 5 + TypeScript |
| DB       | PostgreSQL (via Prisma ORM 5.22) — embedded Postgres for local dev on port 5433 |
| Auth     | JWT sessions (via `jose`) stored in an HTTP-only cookie, with role claims |
| Payments | Razorpay (orders API + checkout + webhooks, HMAC-SHA256 signature verification) |
| QR       | `qrcode` lib server-side, `html5-qrcode` scanner client-side |
| Validation | Zod schemas at the controller layer |

### Repo layout (short)

```
clg-fest/mvsr-sangamam/
├── backend/     # Express REST API, Prisma schema, seed script
├── frontend/    # Next.js app (pages, components, config)
├── scripts/     # dev-db runner + 3 e2e test runners
├── docker-compose.yml
└── package.json # root npm workspace that orchestrates both
```

The two packages are glued together with:
- a **root npm workspace** (`npm run dev:all` launches both at once)
- a **Next.js rewrite** in [frontend/next.config.mjs](clg-fest/mvsr-sangamam/frontend/next.config.mjs): everything the frontend requests from `/api/*` is reverse-proxied to the Express server on `http://localhost:5001`. So the frontend never has to know a separate backend URL in the browser.

---

## 2. The data model (what gets stored)

Defined in [backend/prisma/schema.prisma](clg-fest/mvsr-sangamam/backend/prisma/schema.prisma). The important tables:

| Model | What it holds |
|-------|---------------|
| **User** | email, bcrypt password hash, name, phone, college, optional studentId, `role` (`PARTICIPANT` / `ORGANIZER` / `ADMIN`) |
| **Event** | slug, name, category, pricing (`fee`, `pricingMode` — per participant vs per team), `participationType` (`INDIVIDUAL` / `TEAM`), `minTeamSize`/`maxTeamSize`, **`capacity`** and **`slotsTaken`** (used for atomic concurrency), prizes, coordinators, FAQs, `isPublished`, `registrationOpen` |
| **Registration** | the "ticket". Links a user to an event. Has `code` (REG-XXXXXX), `status` (`PENDING`/`CONFIRMED`/`EXPIRED`/`CANCELLED`/`FAILED`), `amount` (computed server-side), `participantCount`, `qrToken`, `expiresAt`. Also an `activeKey` = `"${userId}:${eventId}"` which is unique → **DB-enforced "one active registration per user per event"** |
| **Team** | code (e.g. `HACK-2026-0012`), name, leader, `paidCapacity`, `memberCount`, status (`PENDING` → `ACTIVE` once payment confirms) |
| **TeamMember** | one row per person in a team. Unique on (`eventId`,`userId`) — a person can only be in one team per event |
| **InvitationCode** | the human-shareable code the leader gives teammates; expires at `event.startsAt`; auto-deactivates once team is full |
| **Payment** | one row per Razorpay order. `razorpayOrderId` unique, `razorpayPaymentId`, `razorpaySignature`, status (`CREATED`/`PAID`/`FAILED`/`CANCELLED`/`EXPIRED`/`REFUND_REQUIRED`), method, failure reason |
| **CheckIn** | one row per registration (unique on `registrationId` → **can't double-check-in**), who scanned the QR and when |

The seed script in [backend/prisma/seed.mjs](clg-fest/mvsr-sangamam/backend/prisma/seed.mjs) loads **14 events** (hackathon, music mob, comedy night, code sprint, byte quiz, project expo, robo race, treasure hunt, etc.) and upserts an initial admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars. Default: `admin@mvsrsangamam.in` / `Sangamam@Admin2026`.

---

## 3. Backend architecture

The backend follows a strict **5-layer architecture** (`routes` → `controllers` → `services` → `repositories`/Prisma, with cross-cutting `middlewares`, `validators`, `integrations`, `utils`). Entry point is [backend/src/server.ts](clg-fest/mvsr-sangamam/backend/src/server.ts) → [app.ts](clg-fest/mvsr-sangamam/backend/src/app.ts), which:

- Trusts proxy headers (so rate limiting works behind Next.js)
- Permissively CORS-allows localhost + configured origins with cookies
- Captures `rawBody` on JSON requests (needed for Razorpay webhook signature verification)
- Mounts everything under `/api` from [routes/index.ts](clg-fest/mvsr-sangamam/backend/src/routes/index.ts)

### API surface (what the frontend can actually call)

**Auth** ([auth.routes.ts](clg-fest/mvsr-sangamam/backend/src/routes/auth.routes.ts))
- `POST /api/auth/signup` – create account, returns JWT in cookie
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile` – update name/phone/college/studentId
- `PUT /api/auth/password` – change password (rate-limited 5/min)

**Events** ([event.routes.ts](clg-fest/mvsr-sangamam/backend/src/routes/event.routes.ts))
- `GET /api/events` – list published events
- `GET /api/events/stats`
- `GET /api/events/:slug` – single event details
- `GET /api/events/:slug/availability` – live slotsTaken / capacity

**Registrations** ([registration.routes.ts](clg-fest/mvsr-sangamam/backend/src/routes/registration.routes.ts))
- `POST /api/registrations` – create a registration (holds a slot, returns a Razorpay order payload)
- `GET /api/registrations/:id` – fetch own registration
- `GET /api/registrations/:id/checkout` – resume checkout if the user bailed out mid-payment
- `POST /api/registrations/:id/cancel`

**Payments** ([payment.routes.ts](clg-fest/mvsr-sangamam/backend/src/routes/payment.routes.ts))
- `POST /api/payments/verify` – client POSTs Razorpay `order_id`/`payment_id`/`signature` here after checkout; backend HMAC-verifies and confirms
- `POST /api/payments/failure` – client reports a cancelled/failed modal

**Teams** ([team.routes.ts](clg-fest/mvsr-sangamam/backend/src/routes/team.routes.ts))
- `GET /api/teams/lookup?code=...` – unauthenticated preview of a team from an invite code
- `POST /api/teams/join` – authenticated redeem of invite code

**Check-in** ([checkin.routes.ts](clg-fest/mvsr-sangamam/backend/src/routes/checkin.routes.ts))
- `GET /api/checkin/:token` – fetch verification card (what the QR shows when scanned)
- `POST /api/checkin` – organizer-only, actually marks person as checked in

**Admin + Dashboard**
- `GET /api/admin/overview` – stats + registrations list (organizer+)
- `GET /api/admin/export` – CSV export of all registrations
- `POST /api/admin/users` – promote user to ORGANIZER/ADMIN
- `POST|PUT|DELETE /api/admin/events[/:id]` – event CRUD
- `GET /api/dashboard/overview` – participant's own registrations/memberships

**Webhook**
- `POST /api/webhooks/razorpay` – `payment.captured`, `order.paid`, `payment.failed` events from Razorpay

Rate limiting is applied per route (signup 15/min, login 15/min, register 20/min, checkin 120/min, etc.) through a sliding-window middleware.

Auth middlewares come in 3 flavours ([auth.middleware.ts](clg-fest/mvsr-sangamam/backend/src/middlewares/auth.middleware.ts)): `requireAuth` (any logged-in), `requireOrganizer` (ORGANIZER or ADMIN), `requireAdmin` (ADMIN only). Every call **re-reads the user from the DB** by `sub` claim — so a role revoke takes effect immediately, not next-login.

---

## 4. The full registration & payment flow (the heart of the app)

This is the most important thing to understand. The flow is split between [registration.service.ts](clg-fest/mvsr-sangamam/backend/src/services/registration.service.ts) and [payment.service.ts](clg-fest/mvsr-sangamam/backend/src/services/payment.service.ts), with the frontend driver in [register-client.tsx](clg-fest/mvsr-sangamam/frontend/src/app/register/[slug]/register-client.tsx).

### Step-by-step

1. **User browses homepage** → clicks an event → `/events/[slug]` → `Register`.
2. **Edge middleware** ([frontend/src/middleware.ts](clg-fest/mvsr-sangamam/frontend/src/middleware.ts)) runs. If no session cookie, redirect to `/login?next=/register/<slug>`. Protected routes = `/dashboard`, `/admin`, `/register`, `/registration`.
3. **Frontend register page** collects name, phone, college, student ID (mandatory for hackathon), team name + team size if it's a team event. Validates INR phone pattern, team-size bounds, then calls `POST /api/registrations`.
4. **Backend `createRegistration`** does the following in order:
   - Loads the event; refuses if unpublished, closed, or past.
   - Validates team size against `minTeamSize`/`maxTeamSize`; requires studentId if event does.
   - **Computes amount server-side** via [`computeAmount`](clg-fest/mvsr-sangamam/backend/src/utils/pricing.util.ts) — the client's number is ignored, so no one can tamper with price. `PER_PARTICIPANT` → `fee × seats`; `PER_TEAM` → flat `fee`.
   - **Expires stale registrations** of this event first (any `PENDING` past `expiresAt` are released and their slot freed).
   - Checks for an existing `activeKey` → user already registered or already pending for this event → 409.
   - For TEAM events, also checks the user isn't already in another team for this event and the team name is free.
   - Then inside a transaction:
     - **Atomically reserves a slot**: `UPDATE Event SET slotsTaken = slotsTaken + 1 WHERE id = X AND (capacity IS NULL OR slotsTaken < capacity)` — if the affected-row count isn't exactly 1, the event is full and the whole thing throws. This is the race-condition guard against double-booking the last slot.
     - Creates the `Registration` row with `expiresAt = now + 15 min` (from [`FEST.paymentWindowMinutes`](clg-fest/mvsr-sangamam/backend/src/config/fest.config.ts)).
     - For team events, also creates a `Team` (status `PENDING`) with the leader as the first member.
     - If `amount === 0` (free event), confirms immediately in the same transaction.
5. **If paid**, backend calls `createRazorpayOrder` ([razorpay.client.ts](clg-fest/mvsr-sangamam/backend/src/integrations/razorpay.client.ts)) — or returns a `order_mock_...` id if `RAZORPAY_KEY_ID` is missing/`rzp_test_mock*` (**mock mode**, used in local dev). A `Payment` row is created with status `CREATED` and returned to the client as a `checkout` payload (keyId, orderId, amount, name, description, prefill).
6. **Client opens Razorpay checkout** via `window.Razorpay(options)`. On success handler, it posts `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` to `/api/payments/verify`. If mock mode, the frontend shows an in-page sandbox simulator with success/fail buttons that POSTs the same shape with a fake signature.
7. **Backend `verifyAndConfirm`**:
   - **Verifies signature**: HMAC-SHA256(`order_id|payment_id`, `KEY_SECRET`) in constant time. In mock mode, accepts any non-empty signature.
   - Fetches payment details from Razorpay (for `method`).
   - Then `confirmPayment` runs in a transaction with `SELECT ... FOR UPDATE` on the Payment row (so parallel webhook + browser callback can't race):
     - If payment already `PAID` with the same payment id → `already_confirmed` (idempotent, safe to retry).
     - If payment `PAID` but a *different* payment id came in → marks `REFUND_REQUIRED` (duplicate payment detected).
     - If registration is still `PENDING` → marks payment `PAID`, flips registration to `CONFIRMED`, assigns a fresh 256-bit `qrToken`, activates the team (status `ACTIVE`, assigns sequential team code like `HACK-2026-0012`), and if there are empty paid seats, creates an `InvitationCode` for teammates.
     - If registration already expired or cancelled but money came in anyway → **tries to re-reserve a slot**; if the event is now full or user already has another registration, marks `REFUND_REQUIRED` with a clear reason (so organizers can refund manually).
8. **Webhook ([payment.controller.ts](clg-fest/mvsr-sangamam/backend/src/controllers/payment.controller.ts))** independently calls the same `confirmPayment` for `payment.captured` / `order.paid`, so even if the user closes their browser before the client callback fires, the registration still gets confirmed. For `payment.failed`, records the failure. All operations are idempotent so the belt-and-braces design is safe.
9. **Client redirects** to `/registration/[id]` which shows the pass receipt + the QR image. The QR encodes a URL `${APP_URL}/v/${qrToken}` — opening/scanning it hits the verification page.

**Payment window**: 15 minutes. If the user bails, they can resume checkout from the dashboard via `GET /api/registrations/:id/checkout` which either reuses the open Razorpay order or creates a new one.

**Pricing authority**: the client-shown price is purely display; the server recomputes from `event.fee × teamSize` or flat per-team fee. Impossible to pay the "wrong" amount.

---

## 5. Team flow (hackathon-style events)

- Leader registers, picks `teamSize` ∈ `[minTeamSize, maxTeamSize]`, pays for all N seats upfront.
- On successful payment, the backend creates an `InvitationCode` tied to that team.
- Leader sees the invite code + a shareable link `/join?code=XXXX` on their dashboard.
- Teammates visit `/join?code=XXXX`, log in / sign up, and submit their details.
- `TeamService.joinTeam` ([team.service.ts](clg-fest/mvsr-sangamam/backend/src/services/team.service.ts)) atomically:
  - `UPDATE Team SET memberCount = memberCount + 1 WHERE status = ACTIVE AND memberCount < paidCapacity` (same affected-row trick).
  - Creates the `TeamMember` row.
  - If the team is now full, deactivates the invite code so it can't be reused.
- Teammate's dashboard then also shows the team pass QR (shared with the leader).

Guards: user can't be in two teams for the same event, can't have their own paid registration + a team membership for the same event, can't reuse a FULL / EXPIRED / INACTIVE invite.

---

## 6. QR check-in flow

- Every CONFIRMED registration has a `qrToken` (opaque 256-bit random). The QR encodes the URL `/v/<token>`.
- `/v/[token]` on the frontend is **publicly viewable** — anyone with the QR can see the verification card (name, team, event, paid status, check-in status). This is intentional: organizers at the gate can read it without logging in.
- Only an authenticated **ORGANIZER / ADMIN** can hit `POST /api/checkin` to actually mark attendance. The admin portal has an inline camera scanner ([camera-scanner.tsx](clg-fest/mvsr-sangamam/frontend/src/components/scanner/camera-scanner.tsx)) built on `html5-qrcode` that pipes scans straight to this endpoint.
- Double-check-in is impossible: `CheckIn.registrationId` is unique at the DB level. If an organizer scans a second time, the API returns `{ status: "already" }` instead of error.

---

## 7. Frontend page map

Routes under [frontend/src/app/](clg-fest/mvsr-sangamam/frontend/src/app/):

| Route | What it does |
|-------|-------------|
| `/` | Homepage — currently uses the [SangamamExperience](clg-fest/mvsr-sangamam/frontend/src/components/home/SangamamExperience.tsx) cyberpunk experience: a `CSEIntroSequence` photo intro, `FuturisticHero`, `EventCategoriesSection` with 3 flagship events (Hackathon, Music Mob, Comedy Night from [flagship-events.ts](clg-fest/mvsr-sangamam/frontend/src/config/flagship-events.ts)), schedule, about, FAQ, contact. Clicking "Register" opens an in-page modal rather than routing. |
| `/events` | Catalogue page listing *all* events from the DB. |
| `/events/[slug]` | Full event details page (rules, prizes, FAQs, coordinators, live capacity). |
| `/login` | Combined sign-in + sign-up form ([auth-form.tsx](clg-fest/mvsr-sangamam/frontend/src/app/login/auth-form.tsx)). |
| `/register/[slug]` | Two-step register form → confirm → Razorpay checkout (mock sandbox UI in dev). |
| `/registration/[id]` | Printable pass + QR after confirmation ([registration-slip.tsx](clg-fest/mvsr-sangamam/frontend/src/app/registration/[id]/registration-slip.tsx)). |
| `/join` and `/join?code=XXXX` | Teammate invite redemption. |
| `/dashboard` | Participant's registrations + team memberships + QR passes. |
| `/admin` | Admin / organizer portal — stats, registration table, CSV export, event CRUD, camera check-in. |
| `/v/[token]` | QR verification landing page. |

The site header/footer are rendered from [components/layout/](clg-fest/mvsr-sangamam/frontend/src/components/layout/) via [frontend/src/app/layout.tsx](clg-fest/mvsr-sangamam/frontend/src/app/layout.tsx).

---

## 8. Security posture of the current code

Not a security audit, but things to note:

- Passwords are bcrypt-hashed with cost 12. Login uses a dummy hash fallback to defeat timing attacks against unknown emails ([auth.service.ts:7](clg-fest/mvsr-sangamam/backend/src/services/auth.service.ts#L7)).
- Sessions are JWTs signed with `AUTH_SECRET` via `jose`, stored in an HTTP-only cookie, and middleware re-reads the user from the DB each request (so role changes take effect instantly).
- Razorpay signatures (both checkout and webhook) are verified with HMAC-SHA256 in `timingSafeEqual`.
- CSV exports go through a formula-injection sanitizer in [format.util.ts](clg-fest/mvsr-sangamam/backend/src/utils/format.util.ts).
- Rate limiters sit in front of every expensive or abuse-prone endpoint.
- The seat-reservation / team-slot / check-in uniqueness use atomic conditional SQL + unique constraints — concurrent requests converge safely.
- `activeKey = "${userId}:${eventId}"` is a unique partial key so Postgres directly enforces "one open registration per event per user".

Things that are **not yet** addressed (gaps, not bugs):

- No email service — users don't get emailed their pass; they can only re-fetch from `/dashboard`.
- No OTP / email verification during signup.
- No password-reset flow.
- CORS is intentionally permissive (open to any origin) — fine for local dev, must be tightened before prod.
- No file uploads anywhere (project expo, posters, etc. have no attachment pathway).
- No refund automation — `REFUND_REQUIRED` just sets a flag; the actual refund is a manual Razorpay dashboard action.

---

## 9. What the current version can do today (quick answer to "is it ready?")

**Yes, end-to-end for the critical path**: a student can land on the home page, create an account, pick a published event, register (solo or as a team leader), pay through real Razorpay or the local mock mode, receive a QR pass, invite teammates with a code, show up on event day, and get scanned in by an organizer at the gate. An admin can log in, see live stats, export the roster to CSV, create/edit/delete events, and promote users to organizer or admin.

**What is still "placeholder" or missing** (the "lot of stuff is to be done" from your message):

1. **Content pages**:
   - Only the homepage uses the fancy `SangamamExperience` cyberpunk shell. `/events`, `/dashboard`, `/admin`, `/login` have functional UI but no themed polish yet.
   - The homepage shows only **3 flagship events** hardcoded in [flagship-events.ts](clg-fest/mvsr-sangamam/frontend/src/config/flagship-events.ts); the real event catalogue (14 events from the seed) only shows at `/events`. These two need to be reconciled.
   - **Informational pages missing**: no sponsors page, no rules/policies page, no about-the-college page, no venue map page, no "past editions" / gallery page, no refund/cancellation policy, no privacy / terms (required for Razorpay prod activation).
2. **Database**:
   - Schema is solid, but non-hackathon events in the seed have placeholder fees, venues, and times — a note in the seed file itself calls them out (`NOTE(organizers)`).
   - No `prisma migrate` migration folder on disk — using `db:push` only, which is fine for dev but should move to migrations before prod.
3. **Registration gaps**:
   - No per-event custom form fields (e.g. GitHub profile for hackathon, song choice for music mob) — only name/phone/college/studentId are captured.
   - No bulk team registration from a single form (teammates have to self-join).
   - No "waitlist" or "notify me when open".
4. **Communications**:
   - No emails of any kind — confirmation, reminders, team invite via email, "your event starts in 2 hours", none.
   - No SMS/WhatsApp integration (very common for college fests in India).
5. **Admin**:
   - Event CRUD exists but no editor UI for the rich fields (prizes JSON, coordinators JSON, FAQ JSON) beyond raw forms.
   - No per-event dashboard — organizer sees everything mixed; no "I only care about my event" scope.
   - No audit log of admin actions.
6. **Day-of experience**:
   - No live leaderboard, no announcements feed, no schedule-day map.
   - QR check-in is per registration — no "track whether each individual team member actually attended" (currently the whole team is marked present together).
7. **Media / branding**:
   - Only one logo in `public/mvsr-logo.png`. No sponsor logos, hero media, event posters, judge photos.
8. **Payments**:
   - Razorpay keys not yet set; running in mock mode. Real `rzp_test_*` keys need to go in `.env` for test-mode payment to work.
   - No refund workflow, no payout dashboard, no settlement reports.
9. **Testing & deployment**:
   - Three node e2e scripts exist in [scripts/](clg-fest/mvsr-sangamam/scripts/) (`test-e2e.mjs`, `test-api-e2e.mjs`, `test-full-roundtrip.mjs`) — covers happy paths, not UI.
   - No CI config, no Dockerfile for the apps themselves (only `docker-compose.yml` for Postgres), no deployment target picked (Vercel for Next, somewhere for Express).

---

## 10. How to run it locally (verified from the scripts/README)

```bash
cd clg-fest/mvsr-sangamam
cp .env.example .env       # fill AUTH_SECRET; leave Razorpay empty for mock mode
npm install
npm run db:local           # embedded Postgres on 5433 (background terminal)
npm run db:push            # apply schema
npm run db:seed            # 14 events + admin account
npm run dev:all            # frontend on :3000, backend on :5000 (via Next rewrite from :3000/api)
```

Then visit <http://localhost:3000>, sign up as a student or log in with `admin@mvsrsangamam.in` / `Sangamam@Admin2026` for the admin portal.

---

## 11. TL;DR

The platform's **core transactional loop** — register → hold slot → pay → confirm → QR pass → gate scan — is complete, atomic, and race-safe. What's left is mostly **content, communication, and polish**: fleshing out the non-homepage pages, adding emails/SMS, wiring real Razorpay credentials, filling in event metadata, creating sponsor/about/policy pages, and iterating on the admin UX. The architecture is clean enough that any of these can be bolted on without rewiring the data model.
