import { prisma } from "@/lib/prisma";
import { createMagicToken, magicLinkUrl } from "@/lib/magicToken";
import { notify, nudgeMessage, escalationMessage } from "@/lib/notifications";

const TWO_HOURS_MS = 1000 * 60 * 60 * 2;
const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;

export type SlaRunSummary = {
  checked: number;
  nudgesSent: number;
  escalationsSent: number;
  errors: { reviewId: string; error: string }[];
};

/**
 * The SLA engine. Runs on a schedule (every 5-10 min via cron) and drives
 * two reminder tiers off `lastStatusChangeAt` for every discipline review
 * that is still PENDING while its project is WAITING on it. A review that
 * has already moved to APPROVED/REJECTED is invisible to this query, which
 * is what "halts pending reminders" means in practice — there's nothing to
 * un-send, the next run simply stops seeing it.
 */
export async function runSlaCheck(): Promise<SlaRunSummary> {
  const now = Date.now();
  const summary: SlaRunSummary = { checked: 0, nudgesSent: 0, escalationsSent: 0, errors: [] };

  const pendingReviews = await prisma.disciplineReview.findMany({
    where: { status: "PENDING", project: { status: "WAITING" } },
    include: { project: true, reviewer: true },
  });

  summary.checked = pendingReviews.length;

  for (const review of pendingReviews) {
    try {
      const elapsed = now - review.lastStatusChangeAt.getTime();

      // 2-day escalation takes priority and implies the 2h nudge already fired.
      if (elapsed >= TWO_DAYS_MS && !review.escalation2dSent) {
        const pm = await prisma.user.findUnique({ where: { id: review.project.pmId } });
        const token = await createMagicToken(
          review.reviewerId ?? review.project.pmId,
          review.projectId,
          review.id
        );
        const url = magicLinkUrl(token);
        const msg = escalationMessage(review.project.title, review.projectId, url, review.discipline);

        const recipients = [review.reviewer, pm].filter(
          (u): u is NonNullable<typeof u> => Boolean(u)
        );
        await Promise.all(recipients.map((r) => notify(r, msg.subject, msg.html, msg.text)));

        await prisma.disciplineReview.update({
          where: { id: review.id },
          data: { escalation2dSent: true, nudge2hSent: true, priority: "HIGH_PRIORITY" },
        });
        summary.escalationsSent += 1;
        continue;
      }

      if (elapsed >= TWO_HOURS_MS && !review.nudge2hSent) {
        if (review.reviewer) {
          const token = await createMagicToken(review.reviewer.id, review.projectId, review.id);
          const url = magicLinkUrl(token);
          const msg = nudgeMessage(review.project.title, review.projectId, url);
          await notify(review.reviewer, msg.subject, msg.html, msg.text);
        }
        await prisma.disciplineReview.update({
          where: { id: review.id },
          data: { nudge2hSent: true },
        });
        summary.nudgesSent += 1;
      }
    } catch (err) {
      summary.errors.push({ reviewId: review.id, error: (err as Error).message });
    }
  }

  return summary;
}
