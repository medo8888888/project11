import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePM } from "@/lib/auth";
import { transitionProjectStatus, notifyReviewerAssigned } from "@/lib/workflow";
import { handleError } from "@/lib/apiError";

const VALID_STATUSES = ["SUBMITTED", "PM_REVIEW", "WAITING", "IN_PROGRESS", "APPROVED"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pm = await requirePM();
    const body = await req.json().catch(() => null);
    const status = body?.status;
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.pmId !== pm.id) {
      return NextResponse.json({ error: "Only the owning PM can update this project" }, { status: 403 });
    }

    const wasApprovalTransition = status === "APPROVED";
    const updated = await transitionProjectStatus(params.id, status);

    if (wasApprovalTransition) {
      const reviews = await prisma.disciplineReview.findMany({
        where: { projectId: params.id, status: "PENDING" },
      });
      await Promise.all(reviews.map((r) => notifyReviewerAssigned(r.id)));
    }

    return NextResponse.json({ project: updated });
  } catch (err) {
    return handleError(err);
  }
}
