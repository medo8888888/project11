"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, ClipboardList } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { SlaTimer } from "@/components/SlaTimer";
import { ReviewActions } from "@/components/ReviewActions";
import { EmptyState } from "@/components/ui/EmptyState";

type Review = {
  id: string;
  discipline: string;
  status: string;
  priority: string;
  lastStatusChangeAt: string;
  project: { id: string; title: string; status: string };
};

export function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  if (!reviews) {
    return (
      <div className="flex justify-center py-16 text-gray-400">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return <EmptyState icon={ClipboardList} title="No reviews assigned" description="You're all caught up." />;
  }

  const pending = reviews.filter((r) => r.status === "PENDING");
  const decided = reviews.filter((r) => r.status !== "PENDING");

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Awaiting your review</h2>
          {pending.map((r) => (
            <ReviewCard key={r.id} r={r} expanded={expanded} setExpanded={setExpanded} onDone={load} />
          ))}
        </div>
      )}
      {decided.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Decided</h2>
          {decided.map((r) => (
            <ReviewCard key={r.id} r={r} expanded={expanded} setExpanded={setExpanded} onDone={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  r,
  expanded,
  setExpanded,
  onDone,
}: {
  r: Review;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  onDone: () => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href={`/projects/${r.project.id}`} className="font-medium text-gray-900 hover:text-brand-700">
            {r.project.title}
          </Link>
          <p className="text-xs text-gray-500">{r.discipline.replace("_", " ")} review</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={r.priority} />
          <StatusBadge status={r.status} kind="review" />
        </div>
      </div>
      {r.status === "PENDING" && (
        <div className="mt-2 flex items-center justify-between">
          <SlaTimer since={r.lastStatusChangeAt} active />
          <button
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            {expanded === r.id ? "Cancel" : "Review now"}
          </button>
        </div>
      )}
      {expanded === r.id && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <ReviewActions
            reviewId={r.id}
            onDone={() => {
              setExpanded(null);
              onDone();
            }}
          />
        </div>
      )}
    </div>
  );
}
