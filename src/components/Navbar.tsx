"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardCheck, LogOut, Menu, X, Users, Settings } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CodeJump } from "@/components/CodeJump";

export function Navbar({ userName, role }: { userName: string; role: string }) {
  const router = useRouter();
  const pathname = usePathname();
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
          { href: "/team", label: "Team", icon: Users },
        ]
      : [{ href: "/reviews", label: "My Reviews" }];

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <ClipboardCheck size={16} />
          </span>
          <span className="hidden sm:inline">Bright</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                pathname === l.href ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <CodeJump className="ml-2 w-40" />
          <Link
            href="/settings"
            className={`ml-1 rounded-md p-1.5 transition-colors ${
              pathname === "/settings" ? "bg-brand-50 text-brand-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title="Settings"
          >
            <Settings size={16} />
          </Link>
          <div className="mx-2 h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Avatar name={userName} size={26} />
            <span className="text-sm text-gray-600">{userName}</span>
          </div>
          <button onClick={logout} className="btn-ghost px-2 py-1.5 text-sm">
            <LogOut size={15} />
          </button>
        </div>

        <button className="text-gray-500 sm:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="animate-slide-up border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
          <div className="mb-3 flex items-center gap-2">
            <Avatar name={userName} size={32} />
            <span className="text-sm font-medium text-gray-700">{userName}</span>
          </div>
          <CodeJump className="mb-3" />
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                  pathname === l.href ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                pathname === "/settings" ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
