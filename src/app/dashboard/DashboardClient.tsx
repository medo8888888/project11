"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table2, Plus, LoaderCircle } from "lucide-react";
import { Kanban, type ProjectRow } from "@/components/Kanban";
import { ProjectTable } from "@/components/ProjectTable";

export function DashboardClient() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");

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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border bg-white p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                view === "kanban" ? "bg-brand-600 text-white" : "text-gray-600"
              }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                view === "table" ? "bg-brand-600 text-white" : "text-gray-600"
              }`}
            >
              <Table2 size={14} /> Table
            </button>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      {!projects ? (
        <div className="flex justify-center py-16 text-gray-400">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No projects yet. Create your first one.</p>
      ) : view === "kanban" ? (
        <Kanban projects={projects} />
      ) : (
        <ProjectTable projects={projects} />
      )}
    </div>
  );
}
