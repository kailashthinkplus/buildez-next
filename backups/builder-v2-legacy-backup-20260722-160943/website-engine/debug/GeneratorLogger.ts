export type GeneratorLogLevel = "debug" | "info" | "warn" | "error";

export type GeneratorLogEvent = {
  runId: string;
  stage: string;
  level: GeneratorLogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

export type GeneratorTrace = {
  runId: string;
  startedAt: string;
  completedAt?: string;
  events: GeneratorLogEvent[];
};

function debugEnabled() {
  return /^(1|true|yes|on)$/i.test(
    process.env.WEBSITE_ENGINE_DEBUG?.trim() || "false"
  );
}

export class GeneratorLogger {
  readonly trace: GeneratorTrace;

  constructor(runId = crypto.randomUUID()) {
    this.trace = {
      runId,
      startedAt: new Date().toISOString(),
      events: [],
    };
  }

  event(input: {
    stage: string;
    level?: GeneratorLogLevel;
    message: string;
    data?: Record<string, unknown>;
  }) {
    const event: GeneratorLogEvent = {
      runId: this.trace.runId,
      stage: input.stage,
      level: input.level || "info",
      message: input.message,
      timestamp: new Date().toISOString(),
      data: input.data,
    };

    this.trace.events.push(event);

    if (debugEnabled()) {
      console.log("[WebsiteEngine]", event);
    }
  }

  complete(data?: Record<string, unknown>) {
    this.trace.completedAt = new Date().toISOString();
    this.event({
      stage: "complete",
      message: "Website generation trace completed.",
      data,
    });
    return this.trace;
  }
}
