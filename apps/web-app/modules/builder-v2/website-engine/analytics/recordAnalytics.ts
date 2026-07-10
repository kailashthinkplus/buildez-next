import { createSkeletonResult, type EngineResult } from "../sdk";

export type RecordAnalyticsInput = {
  eventName?: string;
  metadata?: Record<string, unknown>;
};

export type AnalyticsRecordResult = {
  recorded: false;
};

export function recordAnalytics(_input: RecordAnalyticsInput = {}): EngineResult<AnalyticsRecordResult> {
  return createSkeletonResult("analytics", { recorded: false });
}

