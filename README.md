# Bright — Project Approval & SLA Routing System

A full-stack Next.js app that routes projects through a PM approval pipeline
and, once approved, fans out parallel discipline (Mechanical / Fire Safety)
reviews with automated SLA nudges, escalations, and passwordless magic-link
approvals over Email/WhatsApp. Includes a project activity timeline with
comments, file attachments, team management, per-user notification
preferences, short human-readable project codes (`P000042`), and a companion
browser extension (`extension/`) to jump straight to a project from its code.

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide icons — mobile-first, premium UI (Inter font, toast notifications, skeleton loading states).
- **Backend:** Next.js API Routes (Node.js runtime).
- **Database:** PostgreSQL via Prisma ORM.
- **Background worker:** SLA cron engine, runnable either as a Vercel Cron
  hitting `/api/cron/sla`, or as a standalone `node-cron` process
  (`src/worker/cron.ts`) for non-Vercel hosts.
- **Notifications:** Resend (email) and Twilio (WhatsApp). Both degrade to
  console logging when their API keys are unset, so the app runs end-to-end
  without live credentials. Recipients can opt out per-channel in `/settings`.

## File structure

```
prisma/
  schema.prisma        # User, Project, DisciplineReview, MagicToken, ActivityLog, Attachment
  seed.ts               # Seed a PM + two engineers + one sample project
src/
  app/
    layout.tsx, globals.css
    page.tsx             # Marketing landing page (logged out) / redirects to dashboard or reviews
    login/                # Passwordless email login
    dashboard/            # PM view: stat tiles, search/filter, Kanban/table
    projects/new/         # Create a project
    projects/[id]/        # Detail: status stepper, discipline reviews, attachments, activity feed
    reviews/              # Logged-in engineer's assigned reviews
    approve/              # Tokenized, no-login reviewer deep link (?token=)
    go/                   # Resolves ?code=P000042 -> redirects to the project (or to login, preserving ?next=)
    team/                 # PM-only: add/manage engineers & PMs, set discipline
    settings/             # Self-service profile + notification channel toggles
    api/
      auth/{login,logout,me}/route.ts
      projects/route.ts                    # list / create
      projects/[id]/route.ts               # detail (includes activity + attachments)
      projects/[id]/status/route.ts        # PM status transitions (auto-routing)
      projects/[id]/comments/route.ts      # post a comment onto the activity feed
      projects/[id]/attachments/route.ts   # upload a file
      attachments/[id]/route.ts            # download / delete a file
      reviews/route.ts                     # current engineer's reviews
      reviews/[id]/route.ts                # approve/reject (session OR magic token)
      users/route.ts                       # team roster (list/create), PM only
      users/[id]/route.ts                  # edit profile/role/discipline/notification prefs
      magic-link/route.ts                  # resolve a token for the /approve UI
      cron/sla/route.ts                    # SLA engine entry point
  components/
    Kanban.tsx, ProjectTable.tsx, StatusBadge.tsx, SlaTimer.tsx, ReviewActions.tsx, Navbar.tsx
    ui/                  # Toast, Avatar, EmptyState, Skeleton, StatTile — shared design system primitives
    marketing/Landing.tsx
  lib/
    prisma.ts, auth.ts, magicToken.ts, storage.ts, activity.ts, safeRedirect.ts
    labels.ts              # DISCIPLINE_LABEL, formatProjectCode/parseProjectCode
    projectDetail.ts
    workflow.ts           # status transitions + auto-routing to discipline reviews
    sla.ts                # 2h nudge / 2d escalation engine
    notifications/        # email.ts (Resend), whatsapp.ts (Twilio), index.ts
  worker/cron.ts          # standalone node-cron runner
uploads/                  # local-disk attachment storage (gitignored)
extension/                # browser extension — see extension/README.md
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
- Every transition, review decision, SLA nudge/escalation, and user comment
  is recorded to `ActivityLog` and rendered as one timeline on the project
  detail page.

## Project codes & the browser extension

Every project also gets a short, human-readable code — `P` + a zero-padded
sequence number (`P000042`) — computed from `Project.seq` by
`lib/labels.ts`. It's what shows up in nudge/escalation emails and
WhatsApp messages instead of the internal cuid, and what the "jump to code"
search box in the Navbar and the `/go?code=...` page resolve back to a
project (redirecting there, or to `/login?next=...` first if you're signed
out).

`extension/` is a small, self-contained Manifest V3 browser extension that
uses that same `/go` endpoint — paste a code into its popup, select one
anywhere and right-click "Open in Bright", or (best-effort) click one
inline while reading Gmail/Outlook web. It never talks to the API directly;
it only ever opens a normal browser tab to `{baseUrl}/go?code=...`, so your
existing login session just works. See `extension/README.md` for how to
load it (`chrome://extensions` → Developer mode → Load unpacked).

## SLA engine (`src/lib/sla.ts`)

Runs on a schedule (5–10 min) and, for every `PENDING` review on a `WAITING`
project:

- **2h nudge:** sends the assigned engineer an email/WhatsApp message (respecting
  their `/settings` channel preferences) with a magic-link deep link, sets `nudge2hSent`.
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
auth flow. As the PM, use `/team` to add real teammates.

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

Set `APP_URL` to the real hostname you deploy to — every magic link emailed
or WhatsApp'd to a reviewer is built from it, so a stale value here breaks
those links. For this project's target domain that's:

```
APP_URL="https://bright.alkashafqatar.com"
```

On Vercel, `vercel.json` wires `/api/cron/sla` to Vercel Cron automatically.
Set `CRON_SECRET` in your project env vars — Vercel Cron sends it as
`Authorization: Bearer <CRON_SECRET>` automatically, and the route rejects
any other caller once that secret is set.

Attachments are written to local disk (`UPLOAD_DIR`, default `./uploads`).
That's fine for a single persistent instance; on a platform with an
ephemeral or multi-instance filesystem (e.g. serverless Vercel functions),
swap `src/lib/storage.ts` for S3 / Vercel Blob / GCS before relying on
uploads in production.
