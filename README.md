# Project Approval & SLA Routing System

A full-stack Next.js app that routes projects through a PM approval pipeline
and, once approved, fans out parallel discipline (Mechanical / Fire Safety)
reviews with automated SLA nudges, escalations, and passwordless magic-link
approvals over Email/WhatsApp.

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide icons — mobile-responsive.
- **Backend:** Next.js API Routes (Node.js runtime).
- **Database:** PostgreSQL via Prisma ORM.
- **Background worker:** SLA cron engine, runnable either as a Vercel Cron
  hitting `/api/cron/sla`, or as a standalone `node-cron` process
  (`src/worker/cron.ts`) for non-Vercel hosts.
- **Notifications:** Resend (email) and Twilio (WhatsApp). Both degrade to
  console logging when their API keys are unset, so the app runs end-to-end
  without live credentials.

## File structure

```
prisma/
  schema.prisma        # Users, Projects, DisciplineReviews, MagicTokens
  seed.ts               # Seed a PM + two engineers + one sample project
src/
  app/
    layout.tsx, globals.css
    page.tsx             # Redirects to /dashboard (PM) or /reviews (engineer)
    login/                # Passwordless email login
    dashboard/            # PM kanban/table view of all projects
    projects/new/         # Create a project
    projects/[id]/        # Project detail + status transitions + review list
    reviews/              # Logged-in engineer's assigned reviews
    approve/              # Tokenized, no-login reviewer deep link (?token=)
    api/
      auth/{login,logout,me}/route.ts
      projects/route.ts               # list / create
      projects/[id]/route.ts          # detail
      projects/[id]/status/route.ts   # PM status transitions (auto-routing)
      reviews/route.ts                # current engineer's reviews
      reviews/[id]/route.ts           # approve/reject (session OR magic token)
      magic-link/route.ts             # resolve a token for the /approve UI
      cron/sla/route.ts               # SLA engine entry point
  components/             # Kanban, ProjectTable, StatusBadge, SlaTimer, ReviewActions, Navbar
  lib/
    prisma.ts, auth.ts, magicToken.ts
    workflow.ts           # status transitions + auto-routing to discipline reviews
    sla.ts                # 2h nudge / 2d escalation engine
    notifications/        # email.ts (Resend), whatsapp.ts (Twilio), index.ts
  worker/cron.ts          # standalone node-cron runner
vercel.json               # Vercel Cron config (every 10 min)
```

## Workflow & auto-routing

Pipeline: `SUBMITTED -> PM_REVIEW -> WAITING / IN_PROGRESS -> APPROVED`

- A PM moves a project to **APPROVED** → the system auto-creates two
  `DisciplineReview` rows (`MECHANICAL`, `FIRE_SAFETY`), each assigned to the
  least-loaded matching engineer, and parks the project in **WAITING** until
  both disciplines sign off (a project isn't truly done until then).
- Moving a project to **WAITING** (re)starts the SLA clock: every pending
  discipline review's `lastStatusChangeAt` is reset and its reminder flags
  cleared.
- When an engineer approves/rejects their review, reminders stop immediately
  (the SLA query only ever looks at `PENDING` reviews). Once *every* review
  on a project is `APPROVED`, the project auto-finalizes to **APPROVED**. If
  any review is `REJECTED`, the project drops back to **IN_PROGRESS** for
  rework, and re-approving reopens a fresh review cycle for the rejected
  discipline.

## SLA engine (`src/lib/sla.ts`)

Runs on a schedule (5–10 min) and, for every `PENDING` review on a `WAITING`
project:

- **2h nudge:** sends the assigned engineer an email/WhatsApp message with a
  magic-link deep link, sets `nudge2hSent`.
- **2d escalation:** sends an urgent alert to *both* the engineer and the
  PM, flags the review `HIGH_PRIORITY`, sets `escalation2dSent`.
- **Auto-cancel:** implicit — once a review leaves `PENDING`, the cron query
  simply stops selecting it.

## Getting started

```bash
cp .env.example .env   # fill in DATABASE_URL at minimum
npm install
npm run db:push        # create tables from schema.prisma
npm run db:seed         # seed a PM + 2 engineers + 1 sample project
npm run dev
```

Sign in at `/login` with a seeded email (e.g. `pm@example.com`,
`mech@example.com`, `fire@example.com`) — no password required in this demo
auth flow.

### Running the SLA engine locally

Either:

```bash
npm run worker          # standalone node-cron process, every 5 min by default
```

or hit the endpoint manually:

```bash
curl http://localhost:3000/api/cron/sla
```

### Deploying

On Vercel, `vercel.json` wires `/api/cron/sla` to Vercel Cron automatically.
Set `CRON_SECRET` in your project env vars — Vercel Cron sends it as
`Authorization: Bearer <CRON_SECRET>` automatically, and the route rejects
any other caller once that secret is set.
