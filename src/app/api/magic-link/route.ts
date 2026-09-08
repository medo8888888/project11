import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMagicToken } from "@/lib/magicToken";

// GET /api/magic-link?token=... — resolves a deep-link token into the
// project/review/user it grants access to, for the reviewer UI to render.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400 });

  const resolved = await resolveMagicToken(token);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.reason === "expired" ? "Link expired" : "Invalid link" }, { status: 410 });
  }

  const [user, project, review] = await Promise.all([
    prisma.user.findUnique({ where: { id: resolved.userId } }),
    prisma.project.findUnique({ where: { id: resolved.projectId } }),
    resolved.reviewId
      ? prisma.disciplineReview.findUnique({ where: { id: resolved.reviewId } })
      : Promise.resolve(null),
  ]);

  if (!user || !project) return NextResponse.json({ error: "Invalid link" }, { status: 410 });

  return NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role, discipline: user.discipline },
    project,
    review,
  });
}
