import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/apiError";
import { projectDetailInclude } from "@/lib/projectDetail";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: projectDetailInclude,
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    return handleError(err);
  }
}
