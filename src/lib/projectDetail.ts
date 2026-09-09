/** Shared Prisma `include` shape for a full project detail view (used by
 *  both the server-rendered page and the JSON API route so they stay in sync). */
export const projectDetailInclude = {
  pm: { select: { id: true, name: true, email: true } },
  disciplineReviews: {
    include: { reviewer: { select: { id: true, name: true, email: true } } },
    orderBy: { discipline: "asc" as const },
  },
  activityLog: {
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  attachments: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" as const },
  },
};
