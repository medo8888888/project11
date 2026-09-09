"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ArrowRight, Mail } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { SlaTimer } from "@/components/SlaTimer";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { StatusStepper } from "./StatusStepper";
import { ActivityFeed, type ActivityEntry } from "./ActivityFeed";
import { AttachmentsPanel, type Attachment } from "./AttachmentsPanel";

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
  activityLog: ActivityEntry[];
  attachments: Attachment[];
};

export function ProjectDetailClient({
  project,
  isOwningPm,
  currentUserId,
  canComment,
}: {
  project: ProjectDetail;
  isOwningPm: boolean;
  currentUserId: string;
  canComment: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [current, setCurrent] = useState(project);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    const res = await fetch(`/api/projects/${current.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      push(data.error ?? "Failed to update status", "error");
      return;
    }
    push(
      status === "APPROVED"
        ? "Approved — routed to Mechanical + Fire Safety review"
        : `Status moved to ${status.replace(/_/g, " ")}`
    );
    router.refresh();
    setCurrent((c) => ({ ...c, status }));
  }

  const nextOptions = STATUS_FLOW[current.status] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{current.title}</h1>
              <StatusBadge status={current.status} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Avatar name={current.pm.name} size={16} />
              {current.pm.name}
              <Mail size={11} className="ml-1" /> {current.pm.email}
            </div>
          </div>
        </div>

        <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{current.description}</p>

        <div className="mb-1 border-t border-gray-100 pt-5">
          <StatusStepper status={current.status} />
        </div>

        {isOwningPm && nextOptions.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            <span className="text-xs font-medium text-gray-500">Move to:</span>
            {nextOptions.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={loading !== null}
                className="btn-secondary border-brand-200 bg-brand-50 px-3 py-1.5 text-xs text-brand-700 hover:bg-brand-100"
              >
                {loading === s ? <LoaderCircle className="animate-spin" size={13} /> : <ArrowRight size={13} />}
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}
        {current.status === "PM_REVIEW" && isOwningPm && (
          <p className="mt-2 text-xs text-gray-400">
            "APPROVED" auto-routes the project to Mechanical + Fire Safety review and parks it in WAITING until both
            sign off.
          </p>
        )}
      </div>

      {current.disciplineReviews.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Discipline Reviews</h2>
          <div className="flex flex-col gap-3">
            {current.disciplineReviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-100 p-3.5">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">{r.discipline.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={r.priority} />
                    <StatusBadge status={r.status} kind="review" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {r.reviewer ? (
                    <>
                      <Avatar name={r.reviewer.name} size={16} />
                      {r.reviewer.name} ({r.reviewer.email})
                    </>
                  ) : (
                    "Unassigned"
                  )}
                </div>
                {r.status === "PENDING" && (
                  <div className="mt-1.5">
                    <SlaTimer since={r.lastStatusChangeAt} active />
                  </div>
                )}
                {r.comments && (
                  <p className="mt-2 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs italic text-gray-600">
                    "{r.comments}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <AttachmentsPanel
        projectId={current.id}
        attachments={current.attachments}
        canUpload={canComment}
        currentUserId={currentUserId}
      />

      <ActivityFeed projectId={current.id} entries={current.activityLog} canComment={canComment} />
    </div>
  );
}
