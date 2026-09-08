import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { resolveMagicToken, markMagicTokenUsed } from "@/lib/magicToken";
import { submitDisciplineReview } from "@/lib/workflow";

/**
 * Engineers can act on a review either while logged in, or frictionlessly
 * via a magic-link token (?token=... in the request body) minted for that
 * exact review — the tokenized path is what the SLA nudges/escalations and
 * WhatsApp/email links use.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const decision = body?.decision;
  const comments: string | undefined = body?.comments;

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json({ error: "decision must be APPROVED or REJECTED" }, { status: 400 });
  }

  const review = await prisma.disciplineReview.findUnique({ where: { id: params.id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.status !== "PENDING") {
    return NextResponse.json({ error: "This review has already been decided" }, { status: 409 });
  }

  const authorizedUserId = await authorizeReviewer(req, review.reviewerId, body?.token);
  if (!authorizedUserId) {
    return NextResponse.json({ error: "Not authorized to act on this review" }, { status: 401 });
  }

  const updated = await submitDisciplineReview(params.id, decision, comments);
  return NextResponse.json({ review: updated });
}

async function authorizeReviewer(
  req: NextRequest,
  reviewerId: string | null,
  bodyToken?: string
): Promise<string | null> {
  const token = bodyToken ?? req.nextUrl.searchParams.get("token");
  if (token) {
    const resolved = await resolveMagicToken(token);
    if (!resolved.ok) return null;
    if (reviewerId && resolved.userId !== reviewerId) return null;
    await markMagicTokenUsed(resolved.tokenId);
    return resolved.userId;
  }

  const user = await getCurrentUser();
  if (!user) return null;
  if (reviewerId && user.id !== reviewerId) return null;
  return user.id;
}
