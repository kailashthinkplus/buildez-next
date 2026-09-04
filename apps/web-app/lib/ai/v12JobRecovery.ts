import { prisma } from "@buildez/db";
import { releaseV12Credits, type V12CreditReservation } from "@/modules/ai-v12/creditAccounting";

/*
 * A V12GenerationJob's own "running"/"stage_complete" status IS the
 * one-generation-per-site lock (see app/api/builder-v3/agent/run/route.ts).
 * The only place that ever clears it is the same process instance that set
 * it, in its own try/catch — a hard process kill (pm2 restart, SIGKILL, an
 * uncaught crash) skips that entirely and leaves the lock held forever from
 * the user's point of view, blocking every new generation for that site
 * until STALE_JOB_MS elapses and the check in route.ts starts ignoring it.
 *
 * This reaper closes that gap from the other side: it actively clears
 * abandoned jobs (marking them "failed" and returning their reserved
 * credits) instead of waiting for a user's next attempt to notice one is
 * stale.
 */
export const STALE_JOB_MS = 15 * 60_000;

const ABANDONED_ERROR = "Interrupted by a server restart. Please try again.";

async function clearJob(job: { id: string; input: unknown }) {
  try {
    await prisma.v12GenerationJob.update({
      where: { id: job.id },
      data: { status: "failed", error: ABANDONED_ERROR },
    });
  } catch (error) {
    console.error("[v12 job reaper] failed to mark job failed:", job.id, error);
    return;
  }
  const reservation = (job.input as { reservation?: V12CreditReservation } | null)?.reservation;
  if (!reservation) return;
  await releaseV12Credits(reservation, "generation_failed").catch((error) => {
    console.error("[v12 job reaper] failed to release credits for job:", job.id, error);
  });
}

/**
 * Clears every job left in "running"/"stage_complete" by a previous process
 * instance. Safe to call unconditionally right after this process boots:
 * this app runs as a single pm2 fork instance (no cluster/horizontal
 * scaling), so any such job at startup was necessarily orphaned by whatever
 * instance existed before this one — it can't belong to a still-live sibling.
 */
export async function reapAllActiveV12Jobs() {
  const stuck = await prisma.v12GenerationJob.findMany({
    where: { status: { in: ["running", "stage_complete"] } },
    select: { id: true, input: true },
  });
  await Promise.all(stuck.map(clearJob));
  return stuck.length;
}

/**
 * Clears jobs that have been inactive past STALE_JOB_MS — the general,
 * ongoing safety net for a job orphaned without a full process restart
 * (e.g. an uncaught rejection that never reaches the route's own
 * catch/failJob). Only touches jobs already old enough that route.ts's own
 * staleness check would ignore them too, so this can never race a
 * genuinely in-flight generation.
 */
export async function reapStaleV12Jobs() {
  const stuck = await prisma.v12GenerationJob.findMany({
    where: {
      status: { in: ["running", "stage_complete"] },
      updatedAt: { lt: new Date(Date.now() - STALE_JOB_MS) },
    },
    select: { id: true, input: true },
  });
  await Promise.all(stuck.map(clearJob));
  return stuck.length;
}
