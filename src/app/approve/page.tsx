"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, LoaderCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ReviewActions } from "@/components/ReviewActions";
import { StatusBadge } from "@/components/StatusBadge";

type Resolution = {
  user: { name: string; role: string };
  project: { id: string; title: string; description: string; status: string };
  review: { id: string; discipline: string; status: string } | null;
};

export default function ApprovePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-brand-700">
          <ClipboardCheck size={22} />
          <span className="text-sm font-semibold">Discipline Review</span>
        </div>

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
            <div>
              <p className="text-xs text-gray-400">Hi {data.user.name},</p>
              <h1 className="text-lg font-semibold">{data.project.title}</h1>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{data.project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.project.status} />
              {data.review && <span className="text-xs text-gray-500">{data.review.discipline.replace("_", " ")} review</span>}
            </div>

            {data.review && data.review.status !== "PENDING" ? (
              <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
                This review has already been decided ({data.review.status.toLowerCase()}).
              </p>
            ) : data.review ? (
              <ReviewActions reviewId={data.review.id} token={token ?? undefined} onDone={setDone} />
            ) : (
              <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
                This link isn't tied to a specific review.
              </p>
            )}
          </div>
        )}

        {done && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="text-emerald-600" size={32} />
            <p className="text-sm font-medium">
              Review {done === "APPROVED" ? "approved" : "sent back for changes"}. Thank you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
