import type { Discipline } from "@prisma/client";

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MECHANICAL: "Mechanical",
  FIRE_SAFETY: "Fire Safety",
  ALL: "All disciplines",
};
