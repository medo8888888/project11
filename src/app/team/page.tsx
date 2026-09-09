import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "PM") redirect("/reviews");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} role={user.role} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Team</h1>
        <p className="mb-6 text-sm text-gray-500">Manage the engineers and PMs who can be routed reviews.</p>
        <TeamClient />
      </main>
    </div>
  );
}
