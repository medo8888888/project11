"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { SlaTimer } from "./SlaTimer";
import { Users } from "lucide-react";

export type ProjectRow = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  pm: { name: string };
  disciplineReviews: {
    id: string;
    discipline: string;
    status: string;
    priority: string;
    lastStatusChangeAt: string;
    reviewer: { name: string } | null;
  }[];
};

const COLUMNS = ["SUBMITTED", "PM_REVIEW", "WAITING", "IN_PROGRESS", "APPROVED"];

export function Kanban({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
      {COLUMNS.map((col) => {
        const items = projects.filter((p) => p.status === col);
        return (
          <div key={col} className="flex min-w-[240px] flex-col rounded-lg bg-gray-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {col.replace(/_/g, " ")}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
              {items.length === 0 && <p className="text-xs text-gray-400">No projects</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectRow }) {
  const pendingReview = project.disciplineReviews.find((r) => r.status === "PENDING");
  const highPriority = project.disciplineReviews.some((r) => r.priority === "HIGH_PRIORITY");

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-md border bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug text-gray-900">{project.title}</h4>
        {highPriority && <PriorityBadge priority="HIGH_PRIORITY" />}
      </div>
      <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
        <Users size={12} /> {project.pm.name}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={project.status} />
        {pendingReview && <SlaTimer since={pendingReview.lastStatusChangeAt} active />}
      </div>
      {project.disciplineReviews.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.disciplineReviews.map((r) => (
            <span key={r.id} className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">
              {r.discipline.replace("_", " ")}: {r.status}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
