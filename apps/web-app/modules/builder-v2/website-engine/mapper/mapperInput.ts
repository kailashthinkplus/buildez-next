import type { BuilderNode, NodeType } from "../../types/blueprint";
import type {
  BuilderBlueprint,
  BuilderBlueprintResult,
  NativeBuilderNodeIntent,
  NativeCommandIntent,
  NativeInspectorBindingIntent,
  NativeWidgetIntent,
} from "../builder-blueprint";

/**
 * Inputs accepted by the inert Native Builder Mapper contract layer.
 *
 * @example
 * const input: MapperInput = { builderBlueprintResult };
 */
export type MapperInput = Readonly<{
  builderBlueprintResult?: BuilderBlueprintResult;
  builderBlueprint?: BuilderBlueprint;
  nativeNodeIntents?: readonly NativeBuilderNodeIntent[];
  nativeWidgetIntents?: readonly NativeWidgetIntent[];
  nativeInspectorBindingIntents?: readonly NativeInspectorBindingIntent[];
  nativeCommandIntents?: readonly NativeCommandIntent[];
  existingBuilderNodeSchema?: readonly BuilderNode[];
  existingWidgetTypes?: readonly NodeType[];
  featureFlags?: Record<string, boolean>;
}>;
