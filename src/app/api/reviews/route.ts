import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/apiError";

// GET /api/reviews — the current engineer's assigned discipline reviews.
export async function GET() {
  try {
    const user = await requireUser();
    const reviews = await prisma.disciplineReview.findMany({
      where: { reviewerId: user.id },
      include: { project: { select: { id: true, title: true, status: true } } },
      orderBy: [{ status: "asc" }, { lastStatusChangeAt: "asc" }],
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    return handleError(err);
  }
}
