"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { SlaTimer } from "./SlaTimer";
import { Avatar } from "./ui/Avatar";
import { ProjectCode } from "./ProjectCode";

export type ProjectRow = {
  id: string;
  seq: number;
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
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
      {COLUMNS.map((col) => {
        const items = projects.filter((p) => p.status === col);
        return (
          <div key={col} className="flex w-[85vw] shrink-0 snap-start flex-col rounded-xl bg-gray-100/70 p-3 sm:w-auto sm:shrink">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {col.replace(/_/g, " ")}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-soft">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
              {items.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                  No projects
                </p>
              )}
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
      className="card group block animate-fade-in p-3 transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug text-gray-900 group-hover:text-brand-700">
          {project.title}
        </h4>
        {highPriority && <PriorityBadge priority="HIGH_PRIORITY" />}
      </div>
      <div className="mb-2.5 flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Avatar name={project.pm.name} size={16} />
          {project.pm.name}
        </span>
        <ProjectCode seq={project.seq} />
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={project.status} />
        {pendingReview && <SlaTimer since={pendingReview.lastStatusChangeAt} active />}
      </div>
      {project.disciplineReviews.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1 border-t border-gray-100 pt-2.5">
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
