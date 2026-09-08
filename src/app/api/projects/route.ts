import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requirePM } from "@/lib/auth";
import { handleError } from "@/lib/apiError";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const status = req.nextUrl.searchParams.get("status");
    const projects = await prisma.project.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        pm: { select: { id: true, name: true, email: true } },
        disciplineReviews: {
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const pm = await requirePM();
    const body = await req.json().catch(() => null);
    const title = body?.title?.trim();
    const description = body?.description?.trim();
    if (!title || !description) {
      return NextResponse.json({ error: "title and description are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: { title, description, pmId: pm.id, status: "SUBMITTED" },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
