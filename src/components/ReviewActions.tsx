"use client";

import { useState } from "react";
import { Check, X, LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function ReviewActions({
  reviewId,
  token,
  onDone,
}: {
  reviewId: string;
  token?: string;
  onDone: (decision: "APPROVED" | "REJECTED") => void;
}) {
  const { push } = useToast();
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
      push(data.error ?? "Failed to submit review", "error");
      return;
    }
    push(decision === "APPROVED" ? "Review approved" : "Sent back for changes");
    onDone(decision);
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comments (optional)"
        rows={3}
        className="input resize-none"
      />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => act("APPROVED")}
          disabled={loading !== null}
          className="btn flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {loading === "APPROVED" ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}
          Approve
        </button>
        <button
          onClick={() => act("REJECTED")}
          disabled={loading !== null}
          className="btn-danger flex-1"
        >
          {loading === "REJECTED" ? <LoaderCircle className="animate-spin" size={16} /> : <X size={16} />}
          Request Changes
        </button>
      </div>
    </div>
  );
}
