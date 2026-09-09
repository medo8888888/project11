import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { handleError } from "@/lib/apiError";

// POST /api/projects/[id]/comments — post a message onto the project's unified
// activity feed. Anyone who can see the project (owning PM or an assigned
// reviewer) may comment.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const message: string = body?.message?.trim();
    if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });
    if (message.length > 2000) {
      return NextResponse.json({ error: "message is too long (max 2000 chars)" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { disciplineReviews: { select: { reviewerId: true } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant =
      project.pmId === user.id || project.disciplineReviews.some((r) => r.reviewerId === user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Not authorized to comment on this project" }, { status: 403 });
    }

    await logActivity(prisma, {
      projectId: params.id,
      type: "COMMENT",
      actorId: user.id,
      message,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
