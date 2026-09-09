"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, LoaderCircle, AlertTriangle, CheckCircle2, Wrench, FlameKindling } from "lucide-react";
import { ReviewActions } from "@/components/ReviewActions";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";

type Resolution = {
  user: { name: string; role: string };
  project: { id: string; title: string; description: string; status: string };
  review: { id: string; discipline: string; status: string } | null;
};

const DISCIPLINE_ICON: Record<string, typeof Wrench> = {
  MECHANICAL: Wrench,
  FIRE_SAFETY: FlameKindling,
};

export default function ApprovePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-mesh-light bg-gray-50">
          <LoaderCircle className="animate-spin text-gray-400" />
        </div>
      }
    >
      <ApprovePageInner />
    </Suspense>
  );
}

function ApprovePageInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [data, setData] = useState<Resolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"APPROVED" | "REJECTED" | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing token");
      return;
    }
    fetch(`/api/magic-link?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Invalid link");
        setData(json);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  const DisciplineIcon = data?.review ? DISCIPLINE_ICON[data.review.discipline] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-light bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-5 flex items-center justify-center gap-2 text-gray-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <ClipboardCheck size={15} />
          </span>
          <span className="text-sm font-semibold text-gray-700">Bright</span>
        </div>

        <div className="card p-6">
          {error && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-600">
              <AlertTriangle className="text-red-500" size={28} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!error && !data && (
            <div className="flex justify-center py-10 text-gray-400">
              <LoaderCircle className="animate-spin" />
            </div>
          )}

          {data && !done && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Avatar name={data.user.name} size={20} /> Hi {data.user.name},
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{data.project.title}</h1>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {data.project.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={data.project.status} />
                {data.review && (
                  <span className="chip bg-gray-100 text-gray-600">
                    {DisciplineIcon && <DisciplineIcon size={12} />}
                    {data.review.discipline.replace("_", " ")} review
                  </span>
                )}
              </div>

              {data.review && data.review.status !== "PENDING" ? (
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                  This review has already been decided ({data.review.status.toLowerCase()}).
                </p>
              ) : data.review ? (
                <ReviewActions reviewId={data.review.id} token={token ?? undefined} onDone={setDone} />
              ) : (
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                  This link isn't tied to a specific review.
                </p>
              )}
            </div>
          )}

          {done && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </span>
              <p className="text-sm font-medium text-gray-900">
                Review {done === "APPROVED" ? "approved" : "sent back for changes"}
              </p>
              <p className="text-xs text-gray-400">Thank you — you can close this page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
