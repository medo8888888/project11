"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table2, Plus, Search, FolderKanban, Clock, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Kanban, type ProjectRow } from "@/components/Kanban";
import { ProjectTable } from "@/components/ProjectTable";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatTile } from "@/components/ui/StatTile";
import { formatProjectCode } from "@/lib/labels";

const STATUS_FILTERS = ["ALL", "SUBMITTED", "PM_REVIEW", "WAITING", "IN_PROGRESS", "APPROVED"];

export function DashboardClient() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function load() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const list = projects ?? [];
    const pending = list.reduce(
      (n, p) => n + p.disciplineReviews.filter((r) => r.status === "PENDING").length,
      0
    );
    const overdue = list.reduce(
      (n, p) => n + p.disciplineReviews.filter((r) => r.priority === "HIGH_PRIORITY").length,
      0
    );
    const approved = list.filter((p) => p.status === "APPROVED").length;
    return { total: list.length, pending, overdue, approved };
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects ?? [];
    if (statusFilter !== "ALL") list = list.filter((p) => p.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.pm.name.toLowerCase().includes(q) ||
          formatProjectCode(p.seq).toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, query]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Track approvals and discipline review SLAs in one place.</p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          <Plus size={16} /> New Project
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={FolderKanban} label="Total projects" value={stats.total} />
        <StatTile icon={Clock} label="Pending reviews" value={stats.pending} tone="warning" />
        <StatTile icon={AlertTriangle} label="Overdue (2d+)" value={stats.overdue} tone="danger" />
        <StatTile icon={CheckCircle2} label="Approved" value={stats.approved} tone="success" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, PM, or code..."
            className="input pl-9"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hide-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-0.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-brand-600 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {s === "ALL" ? "All" : s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 rounded-md border bg-white p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                view === "kanban" ? "bg-brand-600 text-white" : "text-gray-600"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                view === "table" ? "bg-brand-600 text-white" : "text-gray-600"
              }`}
            >
              <Table2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {!projects ? (
        <DashboardSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length === 0 ? "No projects yet" : "No projects match your filters"}
          description={
            projects.length === 0 ? "Create your first project to get the approval pipeline moving." : undefined
          }
          action={
            projects.length === 0 ? (
              <Link href="/projects/new" className="btn-primary">
                <Plus size={16} /> New Project
              </Link>
            ) : undefined
          }
        />
      ) : view === "kanban" ? (
        <Kanban projects={filtered} />
      ) : (
        <ProjectTable projects={filtered} />
      )}
    </div>
  );
}
