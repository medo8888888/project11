"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { SlaTimer } from "@/components/SlaTimer";
import { ReviewActions } from "@/components/ReviewActions";

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
    return <p className="py-16 text-center text-gray-400">No reviews assigned to you.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link href={`/projects/${r.project.id}`} className="font-medium text-brand-700 hover:underline">
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
            <div className="mt-3 border-t pt-3">
              <ReviewActions
                reviewId={r.id}
                onDone={() => {
                  setExpanded(null);
                  load();
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
