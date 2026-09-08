/**
 * Standalone SLA worker for deployments that aren't on Vercel Cron
 * (e.g. a long-running container, Railway, Fly.io, plain systemd). Run with
 * `npm run worker`. On Vercel, prefer the scheduled hit to /api/cron/sla
 * configured in vercel.json instead of running this process.
 */
import cron from "node-cron";
import { runSlaCheck } from "../lib/sla";

const SCHEDULE = process.env.SLA_CRON_SCHEDULE ?? "*/5 * * * *"; // every 5 minutes

async function tick() {
  const startedAt = new Date().toISOString();
  try {
    const summary = await runSlaCheck();
    console.log(`[sla-worker] ${startedAt} checked=${summary.checked} nudges=${summary.nudgesSent} escalations=${summary.escalationsSent} errors=${summary.errors.length}`);
    if (summary.errors.length) console.error("[sla-worker] errors:", summary.errors);
  } catch (err) {
    console.error(`[sla-worker] ${startedAt} run failed`, err);
  }
}

console.log(`[sla-worker] starting, schedule="${SCHEDULE}"`);
cron.schedule(SCHEDULE, tick);
// Also run once immediately on boot so a fresh deploy doesn't wait a full interval.
tick();
