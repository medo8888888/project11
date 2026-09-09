import type { Discipline } from "@prisma/client";

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MECHANICAL: "Mechanical",
  FIRE_SAFETY: "Fire Safety",
  ALL: "All disciplines",
};

/** Human-readable project reference, e.g. 42 -> "P000042". This is what
 *  shows up in emails/WhatsApp messages and what people type into search —
 *  the internal cuid `id` never needs to leave the URL bar. */
export function formatProjectCode(seq: number): string {
  return `P${String(seq).padStart(6, "0")}`;
}

/** Extracts the numeric sequence from any reasonable way someone might type
 *  a code back: "P000042", "p42", "#42", or a bare "42". Returns null if no
 *  digits are present at all. */
export function parseProjectCode(raw: string): number | null {
  const digits = raw.match(/\d+/)?.[0];
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
