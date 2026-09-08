import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ProjectDetailClient } from "./ProjectDetailClient";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      pm: { select: { id: true, name: true, email: true } },
      disciplineReviews: {
        include: { reviewer: { select: { id: true, name: true, email: true } } },
        orderBy: { discipline: "asc" },
      },
    },
  });
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} role={user.role} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ProjectDetailClient
          project={JSON.parse(JSON.stringify(project))}
          isOwningPm={user.role === "PM" && user.id === project.pmId}
        />
      </main>
    </div>
  );
}
