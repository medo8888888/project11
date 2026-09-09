"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, ArrowRight } from "lucide-react";

/** Paste/type a project code (e.g. P000042, from an email or WhatsApp
 *  message) and jump straight to that project via /go. */
export function CodeJump({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/go?code=${encodeURIComponent(value.trim())}`);
    setValue("");
  }

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <Hash size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Jump to code (P000042)"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-7 text-xs text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-100"
      />
      {value && (
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-brand-600 hover:bg-brand-50"
        >
          <ArrowRight size={13} />
        </button>
      )}
    </form>
  );
}
