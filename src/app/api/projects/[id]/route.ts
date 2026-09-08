import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/apiError";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
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
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    return handleError(err);
  }
}
