import { CREATIVE_PROVIDERS_VERSION_STRING } from "./version";
import type { HiggsfieldMcpStrategy } from "./creativeProvider";

/**
 * Builds metadata-only Higgsfield MCP strategy.
 *
 * @example
 * const strategy = buildHiggsfieldMcpStrategy();
 */
export function buildHiggsfieldMcpStrategy(): HiggsfieldMcpStrategy {
  return Object.freeze({
    id: "higgsfield-mcp-strategy",
    version: CREATIVE_PROVIDERS_VERSION_STRING,
    enabled: false,
    providerRole: "optional_execution_provider",
    allowedTasks: [
      "cinematic image concepts",
      "parallax concept references",
      "hero scene concepts",
      "gallery scene concepts",
      "motion inspiration previews",
      "visual direction previews",
    ],
    forbiddenDecisions: [
      "final website generation",
      "non-editable final site output",
      "Website Engine decision replacement",
      "constraints bypass",
      "truth policy bypass",
      "media truth policy bypass",
      "motion accessibility policy bypass",
      "Builder node output",
    ],
    requiredInputs: [
      "BuildEZ inspiration profile",
      "BuildEZ visual mood profile",
      "BuildEZ media strategy",
      "BuildEZ motion strategy when motion-related",
      "truth constraints",
      "known/provided assets",
      "editability target",
    ],
    outputHandling: "convert_to_native_builder_or_reference_only",
    safetyNotes: [
      "Higgsfield is optional and disabled in this phase.",
      "No MCP call is made.",
      "Any future output must become reference-only or be converted into editable native Builder plans.",
    ],
  });
}
