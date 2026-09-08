"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const TWO_HOURS_MS = 1000 * 60 * 60 * 2;
const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;

/** Live-updating elapsed timer showing how close a PENDING review is to breaching its SLA tiers. */
export function SlaTimer({ since, active }: { since: string | Date; active: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const elapsed = now - new Date(since).getTime();
  const overdue = elapsed >= TWO_DAYS_MS;
  const nudged = elapsed >= TWO_HOURS_MS;

  const color = overdue ? "text-red-600" : nudged ? "text-amber-600" : "text-gray-500";
  const Icon = overdue ? AlertTriangle : Clock;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={13} />
      {formatElapsed(elapsed)}
    </span>
  );
}

function formatElapsed(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h waiting`;
  if (hours > 0) return `${hours}h ${minutes}m waiting`;
  return `${minutes}m waiting`;
}
