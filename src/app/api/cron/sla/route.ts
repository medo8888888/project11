import { NextRequest, NextResponse } from "next/server";
import { runSlaCheck } from "@/lib/sla";

/**
 * Entry point for the SLA background job. Designed to be hit by Vercel Cron
 * (see vercel.json) every 5-10 minutes; also callable by the standalone
 * node-cron worker (src/worker/cron.ts) for non-Vercel deployments.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runSlaCheck();
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), ...summary });
}

export async function POST(req: NextRequest) {
  return GET(req);
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — open (dev only)
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}
