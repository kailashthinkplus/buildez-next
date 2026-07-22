import type { AICommandCapability } from "./aiCommandCapability";
import type { AIInspectorCapability } from "./aiInspectorCapability";
import type { AINodeCapability, AIWidgetCapability } from "./aiNodeCapability";
import type { AIRegenerationScope } from "./aiRegenerationScope";

export type AICompatibilityMatrix = Readonly<{
  nodeCapabilities: readonly AINodeCapability[];
  widgetCapabilities: readonly AIWidgetCapability[];
  inspectorCapabilities: readonly AIInspectorCapability[];
  commandCapabilities: readonly AICommandCapability[];
  regenerationScopes: readonly AIRegenerationScope[];
}>;

export function buildAICompatibilityMatrix(input: AICompatibilityMatrix): AICompatibilityMatrix {
  return Object.freeze({
    nodeCapabilities: Object.freeze([...input.nodeCapabilities]),
    widgetCapabilities: Object.freeze([...input.widgetCapabilities]),
    inspectorCapabilities: Object.freeze([...input.inspectorCapabilities]),
    commandCapabilities: Object.freeze([...input.commandCapabilities]),
    regenerationScopes: Object.freeze([...input.regenerationScopes]),
  });
}
