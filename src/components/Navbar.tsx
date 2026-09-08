"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar({ userName, role }: { userName: string; role: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links =
    role === "PM"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/projects/new", label: "New Project" },
        ]
      : [{ href: "/reviews", label: "My Reviews" }];

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand-700">
          <ClipboardCheck size={22} />
          <span className="hidden sm:inline">SLA Routing</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-brand-700">
              {l.label}
            </Link>
          ))}
          <span className="text-sm text-gray-500">{userName}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <button className="sm:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-3 sm:hidden">
          <div className="mb-2 text-sm text-gray-500">{userName}</div>
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-100">
                {l.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-md px-2 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
