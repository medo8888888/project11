import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — long enough to survive a 2-day escalation

/**
 * Mints a single-use, expiring deep link a reviewer can open with zero
 * login friction from an email or WhatsApp message.
 */
export async function createMagicToken(userId: string, projectId: string, reviewId?: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await prisma.magicToken.create({
    data: { token, userId, projectId, reviewId, expiresAt },
  });
  return token;
}

export function magicLinkUrl(token: string) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base}/approve?token=${token}`;
}

export type MagicTokenResolution =
  | { ok: true; userId: string; projectId: string; reviewId: string | null; tokenId: string }
  | { ok: false; reason: "not_found" | "expired" };

export async function resolveMagicToken(token: string): Promise<MagicTokenResolution> {
  const record = await prisma.magicToken.findUnique({ where: { token } });
  if (!record) return { ok: false, reason: "not_found" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return {
    ok: true,
    userId: record.userId,
    projectId: record.projectId,
    reviewId: record.reviewId,
    tokenId: record.id,
  };
}

export async function markMagicTokenUsed(tokenId: string) {
  await prisma.magicToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } });
}
