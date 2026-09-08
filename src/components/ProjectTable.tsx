"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { SlaTimer } from "./SlaTimer";
import type { ProjectRow } from "./Kanban";

export function ProjectTable({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Project</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">PM</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Discipline Reviews</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects.map((p) => {
            const pendingReview = p.disciplineReviews.find((r) => r.status === "PENDING");
            const highPriority = p.disciplineReviews.some((r) => r.priority === "HIGH_PRIORITY");
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link href={`/projects/${p.id}`} className="font-medium text-brand-700 hover:underline">
                    {p.title}
                  </Link>
                  {highPriority && <span className="ml-2"><PriorityBadge priority="HIGH_PRIORITY" /></span>}
                </td>
                <td className="px-4 py-2 text-gray-600">{p.pm.name}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-2">
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
                <td className="px-4 py-2">
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
