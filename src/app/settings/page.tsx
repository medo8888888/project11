import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} role={user.role} />
      <main className="mx-auto max-w-xl px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="mb-6 text-sm text-gray-500">Your profile and notification preferences.</p>
        <SettingsClient
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            notifyEmail: user.notifyEmail,
            notifyWhatsapp: user.notifyWhatsapp,
          }}
        />
      </main>
    </div>
  );
}
