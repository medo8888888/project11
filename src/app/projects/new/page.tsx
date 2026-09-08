import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { NewProjectForm } from "./NewProjectForm";

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "PM") redirect("/reviews");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} role={user.role} />
      <main className="mx-auto max-w-xl px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold">New Project</h1>
        <NewProjectForm />
      </main>
    </div>
  );
}
