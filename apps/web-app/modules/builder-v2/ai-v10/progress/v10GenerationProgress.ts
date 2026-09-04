export type V10GenerationProgress = Readonly<{
  runId: string;
  agent: string;
  stage: string;
  summary: string;
  completed: number;
  total: number;
  updatedAt: number;
}>;

type V10ProgressRun = { current: V10GenerationProgress; events: V10GenerationProgress[] };

const globalProgress = globalThis as typeof globalThis & {
  __buildezV10Progress?: Map<string, V10ProgressRun>;
};

const progress = globalProgress.__buildezV10Progress ?? new Map<string, V10ProgressRun>();
globalProgress.__buildezV10Progress = progress;

export function publishV10Progress(update: Omit<V10GenerationProgress, "updatedAt">) {
  const event = Object.freeze({ ...update, updatedAt: Date.now() });
  const existing = progress.get(update.runId);
  const previous = existing?.events.at(-1);
  const isNew = !previous || previous.stage !== event.stage || previous.summary !== event.summary;
  progress.set(update.runId, {
    current: event,
    events: isNew ? [...(existing?.events || []), event].slice(-80) : existing?.events || [event],
  });
  if (progress.size > 100) {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [key, value] of progress) if (value.current.updatedAt < cutoff) progress.delete(key);
  }
}

export function readV10Progress(runId: string) {
  return progress.get(runId) ?? null;
}
