"use client";

import { useState } from "react";
import { LoaderCircle, Mail, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

type SettingsUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
};

export function SettingsClient({ user }: { user: SettingsUser }) {
  const { push } = useToast();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [notifyEmail, setNotifyEmail] = useState(user.notifyEmail);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(user.notifyWhatsapp);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: phone || null, notifyEmail, notifyWhatsapp }),
    });
    setSaving(false);
    if (!res.ok) {
      push("Failed to save settings", "error");
      return;
    }
    push("Settings saved");
  }

  return (
    <form onSubmit={save} className="card flex flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} size={44} />
        <div>
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">Phone (for WhatsApp)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+15551234567"
          className="input"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-3 text-xs font-medium text-gray-600">Notifications</p>
        <div className="flex flex-col gap-2">
          <ToggleRow
            icon={Mail}
            label="Email nudges & escalations"
            checked={notifyEmail}
            onChange={setNotifyEmail}
          />
          <ToggleRow
            icon={MessageCircle}
            label="WhatsApp nudges & escalations"
            checked={notifyWhatsapp}
            onChange={setNotifyWhatsapp}
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary self-start">
        {saving && <LoaderCircle className="animate-spin" size={16} />}
        Save changes
      </button>
    </form>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: typeof Mail;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-gray-700">
        <Icon size={15} className="text-gray-400" /> {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
