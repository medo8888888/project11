"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { SlaTimer } from "./SlaTimer";
import { Avatar } from "./ui/Avatar";
import { ProjectCode } from "./ProjectCode";
import type { ProjectRow } from "./Kanban";

export function ProjectTable({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Project</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">PM</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
              Discipline Reviews
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects.map((p) => {
            const pendingReview = p.disciplineReviews.find((r) => r.status === "PENDING");
            const highPriority = p.disciplineReviews.some((r) => r.priority === "HIGH_PRIORITY");
            return (
              <tr key={p.id} className="transition-colors hover:bg-gray-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${p.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                      {p.title}
                    </Link>
                    <ProjectCode seq={p.seq} />
                    {highPriority && <PriorityBadge priority="HIGH_PRIORITY" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={p.pm.name} size={20} />
                    {p.pm.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.disciplineReviews.map((r) => (
                      <span key={r.id} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                        {r.discipline.replace("_", " ")}: {r.status}
                        {r.reviewer ? ` (${r.reviewer.name})` : ""}
                      </span>
                    ))}
                    {p.disciplineReviews.length === 0 && <span className="text-xs text-gray-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {pendingReview ? <SlaTimer since={pendingReview.lastStatusChangeAt} active /> : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
