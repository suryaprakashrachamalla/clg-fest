# MVSR SANGAMAM 2026 — Official Fest & Hackathon Platform

The official full-stack event website and registration platform for **MVSR Sangamam 2026**, happening on **17th–18th October 2026** at **Maturi Venkata Subba Rao (MVSR) Engineering College**, Nadergul, Hyderabad.

---

## 🏛️ Project Architecture: Separated Frontend & Backend

The project is decoupled into standalone **`frontend/`** and **`backend/`** services, structured according to modern production / real-world (IRL) software engineering practices.

```
mvsr-sangamam/
├── backend/                       # 🟢 Standalone Node.js + Express REST API
│   ├── prisma/                    # Database schema & migrations
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── seed.mjs               # Fest seed data & initial admin
│   ├── src/
│   │   ├── config/                # Environment & Fest configuration
│   │   │   ├── env.config.ts      # Validated environment variables (PORT, JWT, Razorpay)
│   │   │   └── fest.config.ts     # Fest schedule, hackathon rules, categories
│   │   ├── controllers/           # HTTP Request/Response layer
│   │   │   ├── admin.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── checkin.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── event.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── registration.controller.ts
│   │   │   └── team.controller.ts
│   │   ├── services/              # Pure Domain & Business Logic layer
│   │   │   ├── admin.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── checkin.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── event.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── registration.service.ts
│   │   │   └── team.service.ts
│   │   ├── repositories/          # Data Access Layer (Prisma query abstraction)
│   │   │   ├── event.repository.ts
│   │   │   ├── payment.repository.ts
│   │   │   ├── registration.repository.ts
│   │   │   ├── team.repository.ts
│   │   │   └── user.repository.ts
│   │   ├── middlewares/           # Express Guards & Middlewares
│   │   │   ├── auth.middleware.ts        # Role verification & session token guard
│   │   │   ├── error.middleware.ts       # Global exception & Zod error transformer
│   │   │   └── rate-limit.middleware.ts  # Token-bucket sliding window rate limiter
│   │   ├── routes/                # Express Route Endpoints
│   │   │   ├── admin.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── checkin.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── event.routes.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── registration.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   └── index.ts                  # Master API router (/api/*)
│   │   ├── validators/            # Zod Input Validation & DTO schemas
│   │   │   ├── admin.validator.ts
│   │   │   ├── auth.validator.ts
│   │   │   ├── event.validator.ts
│   │   │   ├── registration.validator.ts
│   │   │   └── team.validator.ts
│   │   ├── integrations/          # 3rd-Party Gateway Integrations
│   │   │   └── razorpay.client.ts        # Razorpay Orders & HMAC-SHA256 signatures
│   │   ├── utils/                 # Utility helpers
│   │   │   ├── code-generator.util.ts    # Sequential team IDs & human invite codes
│   │   │   ├── format.util.ts            # CSV sanitization with formula injection defense
│   │   │   ├── jwt.util.ts               # Jose JWT token signing & verification
│   │   │   ├── pricing.util.ts           # Server-authoritative fee computation
│   │   │   ├── qr.util.ts                # Dynamic 256-bit QR pass generation
│   │   │   └── response.util.ts          # Uniform HTTP response format & HttpError
│   │   ├── db/
│   │   │   └── prisma.client.ts          # Singleton Prisma client connection pool
│   │   ├── app.ts                 # Express App (CORS, cookies, rawBody webhook capture)
│   │   ├── server.ts              # Server entrypoint (Port 5000, graceful shutdown)
│   │   └── index.ts               # Facade exports
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # 🔵 Next.js 14 App Client
│   ├── public/                    # Static assets (mvsr-logo.png)
│   ├── src/
│   │   ├── app/                   # App Router Pages
│   │   │   ├── admin/             # Admin & Organizer portal
│   │   │   ├── dashboard/         # Participant dashboard
│   │   │   ├── events/[slug]/     # Event detail view
│   │   │   ├── join/              # Team invite code redemption
│   │   │   ├── login/             # Sign-in & registration
│   │   │   ├── register/[slug]/   # Event registration & Razorpay checkout
│   │   │   ├── registration/[id]/ # Pass receipt & dynamic QR slip
│   │   │   ├── v/[token]/         # QR check-in verification page
│   │   │   ├── globals.css        # Tailwind styling & cyberpunk themes
│   │   │   ├── layout.tsx         # Root layout with header & footer
│   │   │   └── page.tsx           # Fest homepage
│   │   ├── components/            # Categorized UI Components
│   │   │   ├── common/            # CountdownTimer, CyberCanvas
│   │   │   ├── events/            # EventCard, EventsSection, EventModal, CapacityBadge
│   │   │   ├── home/              # Hero, About, Schedule, FAQ, Contact
│   │   │   ├── layout/            # SiteHeader, SiteFooter, HeaderClient
│   │   │   ├── scanner/           # CameraScanner (HTML5 QR scanner)
│   │   │   └── index.ts           # Central barrel component exports
│   │   ├── config/                # Fest constants (dates, theme colors)
│   │   ├── services/              # Client & SSR Backend API callers
│   │   │   ├── api.ts             # Typed fetch client connecting to backend
│   │   │   └── razorpay.ts        # Razorpay checkout script loader
│   │   ├── utils/                 # Formatting, currency, session verifier
│   │   └── middleware.ts          # Fast edge route redirects
│   ├── next.config.mjs            # Next.js config with /api/* reverse proxy to backend
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── scripts/                       # Verification & Database scripts
│   ├── dev-db.mjs                 # Embedded PostgreSQL database runner (port 5433)
│   ├── test-api-e2e.mjs           # HTTP REST API end-to-end verification
│   ├── test-e2e.mjs               # Backend service & business logic test
│   └── test-full-roundtrip.mjs    # Complete user flow test
├── package.json                   # Root monorepo workspace orchestration
└── README.md
```

---

## ⚡ How IRL (In Real Life) Backend Files are Organized

In real-world production engineering, a backend should not mix HTTP routing, business calculations, and database calls into a single file. Our backend strictly implements the **Layered 3-Tier Architecture**:

1. **Routes Layer (`routes/`)**:
   Defines the HTTP endpoints, attaches URL paths, and binds rate-limiting and authorization middlewares.
2. **Controllers Layer (`controllers/`)**:
   Receives the HTTP request, validates the input using Zod DTO schemas, invokes domain services, sets HTTP cookies, and formats the HTTP response.
3. **Services Layer (`services/`)**:
   Contains pure business rules and domain logic (e.g. calculating registration amounts, holding slots atomically, generating sequential team IDs, confirming payments, checking team capacity).
4. **Repositories Layer (`repositories/`)**:
   Abstracts all database access using Prisma ORM. Uses atomic conditional queries (`UPDATE ... WHERE capacity IS NULL OR slotsTaken < capacity`) to prevent race conditions.
5. **Middlewares Layer (`middlewares/`)**:
   - `auth.middleware.ts`: Validates JWT tokens and re-verifies roles directly against the database.
   - `rate-limit.middleware.ts`: Prevents brute-force attacks using sliding-window rate limiters.
   - `error.middleware.ts`: Uniform error format catching Zod validation, HTTP exceptions, and Prisma constraints.
6. **Integrations Layer (`integrations/`)**:
   External 3rd-party clients (Razorpay payment gateway, order creation, HMAC-SHA256 signature verification).
7. **Utils Layer (`utils/`)**:
   Reusable security and format utilities (JWT signer, 256-bit QR token generator, CSV formula-injection defense).

---

## 🚀 Running the Project

### 1. Start Local Database (PostgreSQL)
```bash
npm run db:local
```
*Starts embedded PostgreSQL on port `5433`.*

### 2. Push Schema & Seed Initial Data
```bash
npm run db:push
npm run db:seed
```

### 3. Run Development Servers
You can run the backend and frontend separately or simultaneously:

- **Run Backend (Port 5000):**
  ```bash
  npm run dev:backend
  ```

- **Run Frontend (Port 3000):**
  ```bash
  npm run dev:frontend
  ```

- **Run Both Simultaneously:**
  ```bash
  npm run dev:all
  ```

### 4. Verify System
```bash
# Verify business logic against backend
npm run test:e2e

# Run TypeScript type check across both packages
npm run typecheck
```

---

## 🔑 Default Admin Account
- **Email:** `admin@mvsrsangamam.in`
- **Password:** `Sangamam@Admin2026`
- **Admin Portal:** `http://localhost:3000/admin`
