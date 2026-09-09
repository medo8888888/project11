"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, LoaderCircle, ArrowLeft, Workflow, Clock, MessagesSquare } from "lucide-react";
import { safeRelativePath } from "@/lib/safeRedirect";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeRelativePath(params.get("next"));
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      return;
    }
    router.push(next);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-mesh-light opacity-40" />
        <Link href="/" className="relative flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <ClipboardCheck size={18} />
          </span>
          Bright
        </Link>

        <div className="relative flex flex-col gap-6">
          <h2 className="text-3xl font-semibold leading-tight">
            Approvals that route themselves — and reminders that don't let up.
          </h2>
          <div className="flex flex-col gap-4 text-sm text-brand-50">
            <div className="flex items-center gap-3">
              <Workflow size={18} /> Auto-routed Mechanical + Fire Safety reviews
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} /> 2h nudge, 2d escalation — built in
            </div>
            <div className="flex items-center gap-3">
              <MessagesSquare size={18} /> One-tap approvals via WhatsApp or email
            </div>
          </div>
        </div>

        <p className="relative text-xs text-brand-100">Project Approval & SLA Routing</p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 lg:hidden">
            <ArrowLeft size={13} /> Back
          </Link>

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Use your work email — no password needed.</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Email address</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary mt-1 w-full py-2.5">
              {loading && <LoaderCircle className="animate-spin" size={16} />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Reviewers: use the tokenized link sent by email/WhatsApp instead — no login needed.
          </p>
        </div>
      </div>
    </div>
  );
}
