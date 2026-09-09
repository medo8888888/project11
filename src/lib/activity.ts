import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Records one entry in a project's unified activity feed. Accepts either the plain
 *  client or a transaction handle so callers inside `prisma.$transaction` stay atomic. */
export async function logActivity(
  db: Tx | typeof prisma,
  params: { projectId: string; type: ActivityType; message: string; actorId?: string | null }
) {
  await db.activityLog.create({
    data: {
      projectId: params.projectId,
      type: params.type,
      message: params.message,
      actorId: params.actorId ?? null,
    },
  });
}
