import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/apiError";
import { logActivity } from "@/lib/activity";
import { saveUpload, MAX_UPLOAD_BYTES } from "@/lib/storage";

// POST /api/projects/[id]/attachments — multipart upload (field name "file").
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { disciplineReviews: { select: { reviewerId: true } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant =
      project.pmId === user.id || project.disciplineReviews.some((r) => r.reviewerId === user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Not authorized to upload to this project" }, { status: 403 });
    }

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required (multipart field 'file')" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File exceeds the 10MB limit" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = await saveUpload(params.id, file.name, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        projectId: params.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        storagePath,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    await logActivity(prisma, {
      projectId: params.id,
      type: "COMMENT",
      actorId: user.id,
      message: `Attached file "${file.name}"`,
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
