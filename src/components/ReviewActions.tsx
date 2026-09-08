"use client";

import { useState } from "react";
import { Check, X, LoaderCircle } from "lucide-react";

export function ReviewActions({
  reviewId,
  token,
  onDone,
}: {
  reviewId: string;
  token?: string;
  onDone: (decision: "APPROVED" | "REJECTED") => void;
}) {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(decision: "APPROVED" | "REJECTED") {
    setLoading(decision);
    setError(null);
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comments: comments || undefined, token }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Failed to submit review");
      return;
    }
    onDone(decision);
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comments (optional)"
        rows={3}
        className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => act("APPROVED")}
          disabled={loading !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading === "APPROVED" ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}
          Approve
        </button>
        <button
          onClick={() => act("REJECTED")}
          disabled={loading !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading === "REJECTED" ? <LoaderCircle className="animate-spin" size={16} /> : <X size={16} />}
          Request Changes
        </button>
      </div>
    </div>
  );
}
