import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/apiError";
import { readUpload, deleteUpload } from "@/lib/storage";

async function authorize(userId: string, attachmentId: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { project: { include: { disciplineReviews: { select: { reviewerId: true } } } } },
  });
  if (!attachment) return { attachment: null, allowed: false };
  const allowed =
    attachment.project.pmId === userId ||
    attachment.project.disciplineReviews.some((r) => r.reviewerId === userId) ||
    attachment.uploadedById === userId;
  return { attachment, allowed };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { attachment, allowed } = await authorize(user.id, params.id);
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const buffer = await readUpload(attachment.storagePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
        "Content-Length": String(attachment.fileSize),
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { attachment, allowed } = await authorize(user.id, params.id);
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    await prisma.attachment.delete({ where: { id: params.id } });
    await deleteUpload(attachment.storagePath);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
