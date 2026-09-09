const PROJECT_STYLES: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-600",
  PM_REVIEW: "bg-sky-100 text-sky-700",
  WAITING: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

const REVIEW_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const DOT_STYLES: Record<string, string> = {
  SUBMITTED: "bg-gray-400",
  PM_REVIEW: "bg-sky-500",
  WAITING: "bg-amber-500",
  IN_PROGRESS: "bg-violet-500",
  APPROVED: "bg-emerald-500",
  PENDING: "bg-amber-500",
  REJECTED: "bg-red-500",
};

export function StatusBadge({ status, kind = "project" }: { status: string; kind?: "project" | "review" }) {
  const styles = kind === "project" ? PROJECT_STYLES : REVIEW_STYLES;
  const cls = styles[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`chip ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status] ?? "bg-gray-400"}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority !== "HIGH_PRIORITY") return null;
  return <span className="chip animate-pulse bg-red-600 font-semibold text-white">OVERDUE</span>;
}
