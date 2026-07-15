export type PreviewStageTiming = Readonly<{ stage: string; durationMs: number }>;

export function createPreviewTrace(requestId: string) {
  const events: string[] = [`preview.request.${requestId}`, "preview.mode.fixture-local"];
  const timings: PreviewStageTiming[] = [];
  return {
    events,
    timings,
    run<T>(stage: string, operation: () => T): T {
      const startedAt = performance.now();
      const value = operation();
      timings.push(Object.freeze({ stage, durationMs: Number((performance.now() - startedAt).toFixed(3)) }));
      events.push(`preview.stage.${stage}.complete`);
      return value;
    },
  };
}

