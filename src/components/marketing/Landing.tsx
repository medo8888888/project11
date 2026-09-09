import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Clock,
  Workflow,
  MessagesSquare,
  ShieldCheck,
  Smartphone,
  Wrench,
  FlameKindling,
} from "lucide-react";

const FEATURES = [
  {
    icon: Workflow,
    title: "Auto-routing",
    body: "Approve a project once and it fans out to parallel Mechanical + Fire Safety reviews automatically — no manual hand-offs.",
  },
  {
    icon: Clock,
    title: "SLA enforcement",
    body: "A background engine nudges reviewers at 2 hours and escalates to the PM at 2 days, so nothing quietly stalls.",
  },
  {
    icon: MessagesSquare,
    title: "Frictionless approvals",
    body: "Reviewers act straight from an emailed or WhatsApp'd link — no password, no app install, just tap and decide.",
  },
  {
    icon: ShieldCheck,
    title: "Full audit trail",
    body: "Every status change, decision, nudge, and comment lands in one timeline per project — nothing gets lost.",
  },
  {
    icon: Smartphone,
    title: "Built for mobile",
    body: "Reviewers are often in the field. Every screen — dashboard to approval — is designed mobile-first.",
  },
  {
    icon: ClipboardCheck,
    title: "One source of truth",
    body: "PMs get a live Kanban or table view of every project, its SLA timers, and who's holding it up.",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm">
            <ClipboardCheck size={18} />
          </span>
          Bright
        </div>
        <Link href="/login" className="btn-secondary">
          Sign in <ArrowRight size={15} />
        </Link>
      </header>

      <section className="relative overflow-hidden bg-mesh-light">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="chip border border-brand-100 bg-brand-50 text-brand-700">
            Project approval & SLA routing
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Never let an approval <span className="text-brand-600">quietly stall</span> again
          </h1>
          <p className="max-w-xl text-balance text-base text-gray-500 sm:text-lg">
            Bright routes every approved project to the right discipline reviewers, watches the clock,
            and escalates the moment someone's sitting on it — over email or WhatsApp, no login required.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary px-5 py-2.5 text-base">
              Sign in to your dashboard <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs font-medium text-gray-400 sm:gap-10">
            <div className="flex items-center gap-1.5">
              <Wrench size={14} className="text-brand-500" /> Mechanical
            </div>
            <div className="flex items-center gap-1.5">
              <FlameKindling size={14} className="text-brand-500" /> Fire Safety
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-500" /> 2h nudge · 2d escalation
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Everything the approval loop needs</h2>
          <p className="mt-2 text-sm text-gray-500">From submission to sign-off, with reminders built in.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 transition-shadow hover:shadow-card">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <f.icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-gray-900">Ready to route your first project?</h2>
          <p className="max-w-md text-sm text-gray-500">
            Sign in with your work email — reviewers never need to; their link does the rest.
          </p>
          <Link href="/login" className="btn-primary px-5 py-2.5 text-base">
            Sign in <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-gray-400 sm:px-6">
        Bright — Project Approval & SLA Routing
      </footer>
    </div>
  );
}
