const PROJECT_STYLES: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  PM_REVIEW: "bg-blue-100 text-blue-700",
  WAITING: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

const REVIEW_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status, kind = "project" }: { status: string; kind?: "project" | "review" }) {
  const styles = kind === "project" ? PROJECT_STYLES : REVIEW_STYLES;
  const cls = styles[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority !== "HIGH_PRIORITY") return null;
  return (
    <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
      OVERDUE
    </span>
  );
}
