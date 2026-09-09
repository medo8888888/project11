"use client";

import { useEffect, useState } from "react";
import { Plus, LoaderCircle, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

type TeamUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "PM" | "ENGINEER";
  discipline: "MECHANICAL" | "FIRE_SAFETY" | "ALL";
  _count: { reviewsAssigned: number };
};

const DISCIPLINES = ["MECHANICAL", "FIRE_SAFETY", "ALL"];

export function TeamClient() {
  const { push } = useToast();
  const [users, setUsers] = useState<TeamUser[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateDiscipline(id: string, discipline: string) {
    setSavingId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discipline }),
    });
    setSavingId(null);
    if (!res.ok) {
      push("Failed to update discipline", "error");
      return;
    }
    setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, discipline: discipline as TeamUser["discipline"] } : u)) ?? null);
    push("Discipline updated");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Add teammate"}
        </button>
      </div>

      {showForm && (
        <AddUserForm
          onCreated={(user) => {
            setUsers((prev) => [...(prev ?? []), { ...user, _count: { reviewsAssigned: 0 } }]);
            setShowForm(false);
          }}
        />
      )}

      {!users ? (
        <div className="flex justify-center py-16 text-gray-400">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={UserPlus} title="No teammates yet" description="Add engineers so approved projects have someone to route to." />
      ) : (
        <div className="card divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
              <Avatar name={u.name} size={36} />
              <div className="min-w-[160px] flex-1">
                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <span className={`chip ${u.role === "PM" ? "bg-brand-50 text-brand-700" : "bg-gray-100 text-gray-600"}`}>
                {u.role}
              </span>
              {u.role === "ENGINEER" && (
                <>
                  <select
                    value={u.discipline}
                    disabled={savingId === u.id}
                    onChange={(e) => updateDiscipline(u.id, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-brand-500 focus:outline-none"
                  >
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <span className="chip bg-amber-50 text-amber-700">{u._count.reviewsAssigned} pending</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddUserForm({ onCreated }: { onCreated: (u: Omit<TeamUser, "_count">) => void }) {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"PM" | "ENGINEER">("ENGINEER");
  const [discipline, setDiscipline] = useState("ALL");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone: phone || undefined, role, discipline }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      push(data.error ?? "Failed to add teammate", "error");
      return;
    }
    push(`${data.user.name} added`);
    onCreated(data.user);
  }

  return (
    <form onSubmit={submit} className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
      <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
      <input
        required
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <input
        placeholder="Phone (E.164, e.g. +15551234567)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="input"
      />
      <select value={role} onChange={(e) => setRole(e.target.value as "PM" | "ENGINEER")} className="input">
        <option value="ENGINEER">Engineer</option>
        <option value="PM">PM</option>
      </select>
      {role === "ENGINEER" && (
        <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="input sm:col-span-2">
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d.replace("_", " ")}
            </option>
          ))}
        </select>
      )}
      <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
        {loading && <LoaderCircle className="animate-spin" size={16} />}
        Add teammate
      </button>
    </form>
  );
}
