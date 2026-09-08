"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ArrowRight } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { SlaTimer } from "@/components/SlaTimer";

const STATUS_FLOW: Record<string, string[]> = {
  SUBMITTED: ["PM_REVIEW"],
  PM_REVIEW: ["WAITING", "APPROVED", "IN_PROGRESS"],
  WAITING: ["IN_PROGRESS"],
  IN_PROGRESS: ["PM_REVIEW", "APPROVED"],
  APPROVED: ["IN_PROGRESS"],
};

type Review = {
  id: string;
  discipline: string;
  status: string;
  priority: string;
  comments: string | null;
  lastStatusChangeAt: string;
  reviewer: { id: string; name: string; email: string } | null;
};

type ProjectDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  pm: { name: string; email: string };
  disciplineReviews: Review[];
};

export function ProjectDetailClient({
  project,
  isOwningPm,
}: {
  project: ProjectDetail;
  isOwningPm: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(project);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    setError(null);
    const res = await fetch(`/api/projects/${current.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Failed to update status");
      return;
    }
    router.refresh();
    setCurrent((c) => ({ ...c, status }));
  }

  const nextOptions = STATUS_FLOW[current.status] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{current.title}</h1>
          <StatusBadge status={current.status} />
        </div>
        <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600">{current.description}</p>
        <p className="text-xs text-gray-400">PM: {current.pm.name} ({current.pm.email})</p>

        {isOwningPm && nextOptions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-xs font-medium text-gray-500">Move to:</span>
            {nextOptions.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={loading !== null}
                className="flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
              >
                {loading === s ? <LoaderCircle className="animate-spin" size={13} /> : <ArrowRight size={13} />}
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}
        {current.status === "PM_REVIEW" && isOwningPm && (
          <p className="mt-2 text-xs text-gray-400">
            "APPROVED" auto-routes the project to Mechanical + Fire Safety review and parks it in WAITING until both sign off.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {current.disciplineReviews.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Discipline Reviews</h2>
          <div className="flex flex-col gap-3">
            {current.disciplineReviews.map((r) => (
              <div key={r.id} className="rounded-md border p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{r.discipline.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={r.priority} />
                    <StatusBadge status={r.status} kind="review" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Reviewer: {r.reviewer ? `${r.reviewer.name} (${r.reviewer.email})` : "Unassigned"}
                </p>
                {r.status === "PENDING" && (
                  <div className="mt-1">
                    <SlaTimer since={r.lastStatusChangeAt} active />
                  </div>
                )}
                {r.comments && <p className="mt-2 text-xs italic text-gray-600">"{r.comments}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
