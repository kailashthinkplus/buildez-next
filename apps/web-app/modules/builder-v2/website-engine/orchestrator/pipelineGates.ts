import { AI_V10_ENABLED, MAPPER_EXECUTION_ENABLED, WEBSITE_ENGINE_ENABLED, type JsonValue } from "../sdk";

export type PipelineGateName =
  | "liveLLM"
  | "mapperExecution"
  | "builderStoreWrite"
  | "productionRoute"
  | "providerExecution"
  | "persistence"
  | "publish";

/**
 * Disabled execution gate for unsafe orchestration behavior.
 *
 * @example
 * const gate: PipelineGate = { name: "liveLLM", enabled: false, reason: "Live LLM calls are disabled." };
 */
export type PipelineGate = Readonly<{
  name: PipelineGateName;
  enabled: boolean;
  reason: string;
  featureFlag?: string;
  metadata: Record<string, JsonValue>;
}>;

export type PipelineGateInput = Readonly<{
  featureFlags?: Readonly<Record<string, boolean>>;
  gateOverrides?: Partial<Record<PipelineGateName, boolean>>;
}>;

const DEFAULT_GATE_REASONS: Record<PipelineGateName, string> = {
  liveLLM: "Live LLM/API calls are disabled for Phase 39.",
  mapperExecution: "Mapper execution remains disabled unless explicitly enabled in a later rollout.",
  builderStoreWrite: "Builder store writes are forbidden for inert orchestration.",
  productionRoute: "Production route wiring is forbidden for AI v10 Orchestrator.",
  providerExecution: "MCP/provider execution is disabled.",
  persistence: "DB and persistence writes are disabled.",
  publish: "Publishing is not part of orchestration.",
};

const FEATURE_FLAG_BY_GATE: Partial<Record<PipelineGateName, string>> = {
  mapperExecution: "MAPPER_EXECUTION_ENABLED",
  productionRoute: "WEBSITE_ENGINE_ENABLED",
  liveLLM: "AI_V10_ENABLED",
};

function runtimeFeatureFlagEnabled(name: string | undefined, inputFlags: Readonly<Record<string, boolean>> | undefined): boolean {
  if (!name) return false;
  if (name === "WEBSITE_ENGINE_ENABLED") return WEBSITE_ENGINE_ENABLED && Boolean(inputFlags?.[name]);
  if (name === "AI_V10_ENABLED") return AI_V10_ENABLED && Boolean(inputFlags?.[name]);
  if (name === "MAPPER_EXECUTION_ENABLED") return MAPPER_EXECUTION_ENABLED && Boolean(inputFlags?.[name]);
  return Boolean(inputFlags?.[name]);
}

/**
 * Builds the default disabled pipeline gates.
 *
 * @example
 * const gates = buildPipelineGates();
 */
export function buildPipelineGates(input: PipelineGateInput = {}): readonly PipelineGate[] {
  const names: PipelineGateName[] = ["liveLLM", "mapperExecution", "builderStoreWrite", "productionRoute", "providerExecution", "persistence", "publish"];
  return Object.freeze(
    names.map((name) => {
      const featureFlag = FEATURE_FLAG_BY_GATE[name];
      const canEnable = runtimeFeatureFlagEnabled(featureFlag, input.featureFlags);
      const requested = Boolean(input.gateOverrides?.[name]);
      return Object.freeze({
        name,
        enabled: requested && canEnable,
        reason: requested && !canEnable ? `${DEFAULT_GATE_REASONS[name]} Requested override ignored because required feature flags are false.` : DEFAULT_GATE_REASONS[name],
        featureFlag,
        metadata: {
          requested,
          featureFlagEnabled: canEnable,
          defaultDisabled: true,
        },
      });
    })
  );
}

/**
 * Validates that all risky gates are disabled by default.
 *
 * @example
 * const issues = validatePipelineGates(buildPipelineGates());
 */
export function validatePipelineGates(gates: readonly PipelineGate[]): string[] {
  const issues: string[] = [];
  const expected: PipelineGateName[] = ["liveLLM", "mapperExecution", "builderStoreWrite", "productionRoute", "providerExecution", "persistence", "publish"];
  for (const name of expected) {
    const gate = gates.find((item) => item.name === name);
    if (!gate) issues.push(`Missing pipeline gate: ${name}.`);
    if (gate?.enabled) issues.push(`Pipeline gate must default disabled: ${name}.`);
  }
  return issues;
}
