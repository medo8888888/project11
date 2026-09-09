import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { projectDetailInclude } from "@/lib/projectDetail";
import { ProjectDetailClient } from "./ProjectDetailClient";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: projectDetailInclude,
  });
  if (!project) notFound();

  const isParticipant =
    user.role === "PM" ? user.id === project.pmId : project.disciplineReviews.some((r) => r.reviewerId === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} role={user.role} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ProjectDetailClient
          project={JSON.parse(JSON.stringify(project))}
          isOwningPm={user.role === "PM" && user.id === project.pmId}
          currentUserId={user.id}
          canComment={isParticipant}
        />
      </main>
    </div>
  );
}
