"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, FolderPlus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function NewProjectForm() {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create project");
      return;
    }
    push("Project submitted");
    router.push(`/projects/${data.project.id}`);
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="e.g. Warehouse Retrofit - Building 4"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">Description</label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input resize-none"
          placeholder="Scope, location, relevant details..."
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <LoaderCircle className="animate-spin" size={16} /> : <FolderPlus size={16} />}
        Submit Project
      </button>
    </form>
  );
}
