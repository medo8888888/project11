"use client";

import { useState } from "react";
import { ArrowRightLeft, Bell, AlertTriangle, CheckCircle2, MessageSquare, Send, LoaderCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

export type ActivityEntry = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  actor: { id: string; name: string; role: string } | null;
};

const ICONS: Record<string, { icon: typeof ArrowRightLeft; cls: string }> = {
  STATUS_CHANGE: { icon: ArrowRightLeft, cls: "bg-sky-50 text-sky-600" },
  REVIEW_ROUTED: { icon: ArrowRightLeft, cls: "bg-violet-50 text-violet-600" },
  REVIEW_DECISION: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
  SLA_NUDGE: { icon: Bell, cls: "bg-amber-50 text-amber-600" },
  SLA_ESCALATION: { icon: AlertTriangle, cls: "bg-red-50 text-red-600" },
  COMMENT: { icon: MessageSquare, cls: "bg-gray-100 text-gray-500" },
};

export function ActivityFeed({
  projectId,
  entries,
  canComment,
}: {
  projectId: string;
  entries: ActivityEntry[];
  canComment: boolean;
}) {
  const { push } = useToast();
  const [items, setItems] = useState(entries);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() }),
    });
    setPosting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      push(data.error ?? "Failed to post comment", "error");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        type: "COMMENT",
        message: message.trim(),
        createdAt: new Date().toISOString(),
        actor: { id: "me", name: "You", role: "" },
      },
    ]);
    setMessage("");
    push("Comment posted");
  }

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">Activity</h2>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No activity yet.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {items.map((entry) => {
            const meta = ICONS[entry.type] ?? ICONS.COMMENT;
            const Icon = meta.icon;
            return (
              <li key={entry.id} className="flex gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    {entry.actor && <span className="font-medium text-gray-900">{entry.actor.name} </span>}
                    {entry.message}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatWhen(entry.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {canComment && (
        <form onSubmit={postComment} className="mt-5 flex items-start gap-2 border-t border-gray-100 pt-4">
          <Avatar name="You" size={28} />
          <div className="flex flex-1 items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a comment..."
              rows={1}
              className="input flex-1 resize-none"
            />
            <button type="submit" disabled={posting || !message.trim()} className="btn-secondary shrink-0 px-3 py-2">
              {posting ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
