import { prisma } from "@/lib/prisma";
import { createMagicToken, magicLinkUrl } from "@/lib/magicToken";
import { notify, nudgeMessage } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { DISCIPLINE_LABEL, formatProjectCode } from "@/lib/labels";
import type { Discipline, Project, ProjectStatus } from "@prisma/client";

/**
 * Status pipeline: SUBMITTED -> PM_REVIEW -> WAITING -> IN_PROGRESS -> APPROVED
 *
 * Two special-case rules apply on top of a plain status write (per the SLA
 * routing spec):
 *
 *  - Moving a project to APPROVED auto-generates the two parallel discipline
 *    review sub-tasks (MECHANICAL + FIRE_SAFETY). Since the project isn't
 *    actually done until both disciplines sign off, the project is then
 *    parked in WAITING (awaiting those reviews) rather than staying
 *    APPROVED — APPROVED becomes final again only once every discipline
 *    review for the project has been approved (see `maybeFinalizeProject`).
 *  - Moving a project to WAITING (re)starts the SLA clock: every PENDING
 *    discipline review on the project gets lastStatusChangeAt reset and its
 *    reminder flags cleared, so the cron engine begins timing from now.
 */
const REVIEW_DISCIPLINES: Discipline[] = ["MECHANICAL", "FIRE_SAFETY"];

export async function transitionProjectStatus(
  projectId: string,
  targetStatus: ProjectStatus,
  actorId: string
): Promise<Project> {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUniqueOrThrow({ where: { id: projectId } });

    await logActivity(tx, {
      projectId,
      type: "STATUS_CHANGE",
      actorId,
      message: `Status changed from ${project.status.replace(/_/g, " ")} to ${targetStatus.replace(/_/g, " ")}`,
    });

    if (targetStatus === "APPROVED") {
      const existing = await tx.disciplineReview.findMany({ where: { projectId } });
      const routed: Discipline[] = [];
      for (const discipline of REVIEW_DISCIPLINES) {
        const already = existing.find((r) => r.discipline === discipline);
        if (!already) {
          const reviewerId = await findReviewerId(tx, discipline);
          await tx.disciplineReview.create({
            data: {
              projectId,
              discipline,
              reviewerId,
              status: "PENDING",
              lastStatusChangeAt: new Date(),
            },
          });
          routed.push(discipline);
        } else if (already.status === "REJECTED") {
          // Resubmission cycle: reopen the rejected review for a fresh pass.
          await tx.disciplineReview.update({
            where: { id: already.id },
            data: {
              status: "PENDING",
              priority: "NORMAL",
              lastStatusChangeAt: new Date(),
              nudge2hSent: false,
              escalation2dSent: false,
            },
          });
          routed.push(discipline);
        }
      }
      if (routed.length > 0) {
        await logActivity(tx, {
          projectId,
          type: "REVIEW_ROUTED",
          actorId,
          message: `Routed to ${routed.map((d) => DISCIPLINE_LABEL[d]).join(" + ")} review`,
        });
      }
      // Not actually "approved" until both disciplines sign off — see header comment.
      const updated = await tx.project.update({ where: { id: projectId }, data: { status: "WAITING" } });
      await resetPendingReviewClocks(tx, projectId);
      return updated;
    }

    if (targetStatus === "WAITING") {
      const updated = await tx.project.update({ where: { id: projectId }, data: { status: "WAITING" } });
      await resetPendingReviewClocks(tx, projectId);
      return updated;
    }

    return tx.project.update({ where: { id: projectId }, data: { status: targetStatus } });
  });
}

async function resetPendingReviewClocks(tx: PrismaTx, projectId: string) {
  await tx.disciplineReview.updateMany({
    where: { projectId, status: "PENDING" },
    data: { lastStatusChangeAt: new Date(), nudge2hSent: false, escalation2dSent: false },
  });
}

/** Least-loaded engineer whose discipline matches (or who covers ALL disciplines). */
async function findReviewerId(tx: PrismaTx, discipline: Discipline): Promise<string | null> {
  const engineers = await tx.user.findMany({
    where: { role: "ENGINEER", discipline: { in: [discipline, "ALL"] } },
    include: { _count: { select: { reviewsAssigned: { where: { status: "PENDING" } } } } },
  });
  if (engineers.length === 0) return null;
  engineers.sort((a, b) => a._count.reviewsAssigned - b._count.reviewsAssigned);
  return engineers[0].id;
}

export type ReviewDecision = "APPROVED" | "REJECTED";

/**
 * An engineer submits a decision on their discipline review. This halts any
 * pending SLA reminders immediately (the cron query only ever looks at
 * PENDING reviews) and, once every review on the project is APPROVED, flips
 * the project itself to APPROVED. A rejection sends the project back to
 * IN_PROGRESS so the PM can address the feedback and resubmit.
 */
export async function submitDisciplineReview(
  reviewId: string,
  decision: ReviewDecision,
  comments: string | undefined,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const review = await tx.disciplineReview.update({
      where: { id: reviewId },
      data: {
        status: decision,
        comments,
        lastStatusChangeAt: new Date(),
      },
    });

    await logActivity(tx, {
      projectId: review.projectId,
      type: "REVIEW_DECISION",
      actorId,
      message: `${DISCIPLINE_LABEL[review.discipline]} review ${decision === "APPROVED" ? "approved" : "sent back for changes"}${
        comments ? `: "${comments}"` : ""
      }`,
    });

    await maybeFinalizeProject(tx, review.projectId);
    return review;
  });
}

async function maybeFinalizeProject(tx: PrismaTx, projectId: string) {
  const reviews = await tx.disciplineReview.findMany({ where: { projectId } });
  if (reviews.length === 0) return;

  if (reviews.some((r) => r.status === "REJECTED")) {
    await tx.project.update({ where: { id: projectId }, data: { status: "IN_PROGRESS" } });
    await logActivity(tx, {
      projectId,
      type: "STATUS_CHANGE",
      message: "Auto-moved to IN PROGRESS pending rework (a discipline review was rejected)",
    });
    return;
  }
  if (reviews.every((r) => r.status === "APPROVED")) {
    await tx.project.update({ where: { id: projectId }, data: { status: "APPROVED" } });
    await logActivity(tx, {
      projectId,
      type: "STATUS_CHANGE",
      message: "Auto-approved — all discipline reviews signed off",
    });
  }
}

/** Sends the reviewer an immediate magic-link notification (used right after routing, ahead of the SLA nudge). */
export async function notifyReviewerAssigned(reviewId: string) {
  const review = await prisma.disciplineReview.findUnique({
    where: { id: reviewId },
    include: { project: true, reviewer: true },
  });
  if (!review?.reviewer) return;

  const token = await createMagicToken(review.reviewer.id, review.projectId, review.id);
  const url = magicLinkUrl(token);
  const msg = nudgeMessage(review.project.title, formatProjectCode(review.project.seq), url);
  await notify(review.reviewer, msg.subject, msg.html, msg.text);
}

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
