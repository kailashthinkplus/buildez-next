import type { BuilderBlueprint as ExistingBuilderBlueprint, BuilderNode, BuilderStyle, NodeType } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import type { WebsiteDNA, WebsiteSpec, EngineWarning, MissingFact, PatternIntelligenceResult } from "../sdk";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RepositoryRecord } from "../repository";

export type BuilderPrimitiveType = "page" | "section" | "container" | "column" | "heading" | "text" | "button" | "image" | "video" | "icon" | "divider" | "spacer";
export type NativeBuilderNode = BuilderNode;
export type NativeBuilderBlueprint = ExistingBuilderBlueprint;
export type NativeWidgetType = NodeType;
export type NativeWidgetProperty = WidgetProperty;
export type BuilderBlueprintWarning = EngineWarning;
export type BuilderBreakpoint = "desktop" | "tablet" | "mobile";
export type PropertyControlType = "text" | "textarea" | "richText" | "select" | "color" | "image" | "video" | "icon" | "slider" | "number" | "toggle" | "spacing" | "typography" | "alignment" | "link" | "border" | "shadow" | "animation";
export type PropertyGroupId = "content" | "typography" | "layout" | "spacing" | "background" | "border" | "shadow" | "media" | "button" | "animation" | "responsive" | "advanced" | "ai";

export type PropertyGroup = Readonly<{ id: PropertyGroupId; label: string; description?: string }>;

export type PropertyDefinition = Readonly<{
  id: string;
  label: string;
  propertyPath: string;
  controlType: PropertyControlType;
  group: PropertyGroupId;
  defaultValue: unknown;
  currentValue: unknown;
  responsive: boolean;
  aiEditable: boolean;
  userEditable: boolean;
  validationRules: string[];
  allowedValues?: readonly unknown[];
  min?: number;
  max?: number;
  step?: number;
  unitOptions?: readonly string[];
  helpText?: string;
}>;

export type ResponsivePropertyDefinition = PropertyDefinition & Readonly<{ breakpoints: readonly BuilderBreakpoint[]; inheritance: "desktop-first" | "independent" }>;
export type ResponsiveBinding = Readonly<{ propertyId: string; defaultValue: unknown; overrides: Partial<Record<BuilderBreakpoint, unknown>>; inheritance: "desktop-first" | "independent"; userOverride: boolean }>;
export type StyleBinding = Readonly<{ widgetId: string; stylePath: string; value: unknown; source: "design" | "compiler" | "blueprint"; responsive?: ResponsiveBinding }>;
export type MotionBinding = Readonly<{ widgetId: string; motionIntent: string; source: "motion-intelligence" | "compiler" | "blueprint"; codeGenerated: false }>;
export type PropertyBinding = Readonly<{ widgetId: string; propertyId: string; widgetPropertyPath: string; inspectorControl: PropertyControlType; value: unknown; responsiveOverrides: Partial<Record<BuilderBreakpoint, unknown>>; sourceModule: string; regenerationSafe: boolean }>;
export type EditablePropertyBinding = PropertyBinding & Readonly<{ editable: true; userEditable: true; aiEditable: boolean; protected: boolean }>;

export type WidgetCapabilities = Readonly<{ canEdit: boolean; canMove: boolean; canDuplicate: boolean; canDelete: boolean; canResize: boolean; canHide: boolean; canLock: boolean; canAnimate: boolean; canRegenerate: boolean; canReplace: boolean; canNest: boolean; canReorder: boolean; canBindData: boolean }>;
export type SectionCapabilities = Readonly<{ canEdit: boolean; canMove: boolean; canDuplicate: boolean; canDelete: boolean; canSwapLayout: boolean; canSwapPattern: boolean; canSwapComponentVariant: boolean; canRegenerateContent: boolean; canRegenerateMedia: boolean; canRegenerateDesign: boolean; canRegenerateMotion: boolean; canAddWidgets: boolean; canRemoveWidgets: boolean; canChangeBackground: boolean; canChangeSpacing: boolean; canChangeResponsiveLayout: boolean }>;

export type AIWidgetMetadata = Readonly<{
  generatedBy: "website-engine";
  engineVersion: string;
  sourceWebsiteSpecId?: string;
  sourceSectionId?: string;
  sourcePatternId?: string;
  sourceComponentVariantId?: string;
  sourceDesignLanguage?: string;
  sourceContentRole?: string;
  sourceExperienceRole?: string;
  sourceMotionIntent?: string;
  generationTraceId: string;
  regenerationScope: "widget" | "section" | "page";
  dependencies: string[];
  protectedFields: string[];
  editable: true;
  regeneratable: true;
}>;

export type RegenerationMetadata = Readonly<{
  generatedBy: "website-engine";
  engineVersion: string;
  sourceWebsiteSpecId?: string;
  sourceSectionId?: string;
  sourcePatternId?: string;
  sourceComponentVariantId?: string;
  designLanguage?: string;
  sectionRole?: string;
  editable: true;
  regeneratable: true;
}>;

export type InspectorBlueprint = Readonly<{ widgetId: string; tabs: readonly ("content" | "design" | "advanced" | "responsive" | "ai")[]; groups: PropertyGroup[]; propertyDefinitions: PropertyDefinition[]; propertyBindings: PropertyBinding[]; editablePropertyBindings: EditablePropertyBinding[]; responsiveBindings: ResponsiveBinding[] }>;

export type WidgetTreeNode = Readonly<{ id: string; type: BuilderPrimitiveType; parentId: string | null; children: WidgetTreeNode[] }>;
export type ResponsiveBlueprint = Readonly<{ breakpoints: readonly BuilderBreakpoint[]; bindings: ResponsiveBinding[] }>;

export type WidgetBlueprint = Readonly<{
  id: string;
  type: BuilderPrimitiveType;
  name: string;
  parentId: string | null;
  children: string[];
  props: Record<string, unknown>;
  style: BuilderStyle;
  inspector: InspectorBlueprint;
  propertyDefinitions: PropertyDefinition[];
  propertyBindings: PropertyBinding[];
  editablePropertyBindings: EditablePropertyBinding[];
  responsiveBindings: ResponsiveBinding[];
  styleBindings: StyleBinding[];
  motionBindings: MotionBinding[];
  capabilities: WidgetCapabilities;
  aiMetadata: AIWidgetMetadata;
  regenerationMetadata: RegenerationMetadata;
  allowedChildren: BuilderPrimitiveType[];
  sourcePatternId?: string;
  sourceComponentVariantId?: string;
  sectionRole?: string;
}>;

export type ContainerBlueprint = Readonly<{ id: string; sectionId: string; widgetIds: string[]; tree: WidgetTreeNode; responsive: ResponsiveBlueprint; capabilities: WidgetCapabilities }>;
export type SectionBlueprint = Readonly<{ id: string; sourceSectionId: string; role: string; purpose: string; rootWidgetId: string; widgetTree: WidgetTreeNode; widgets: WidgetBlueprint[]; containers: ContainerBlueprint[]; inspectorBlueprints: InspectorBlueprint[]; capabilities: SectionCapabilities; responsive: ResponsiveBlueprint; regenerationMetadata: RegenerationMetadata }>;
export type BuilderBlueprintValidationResult = Readonly<{ valid: boolean; issues: readonly { path: string; code: string; message: string }[] }>;
export type BuilderBlueprintMetrics = Readonly<{ sectionCount: number; widgetCount: number; inspectorCount: number; propertyDefinitionCount: number; propertyBindingCount: number; responsiveBindingCount: number; warningCount: number; missingFactCount: number; missingAssetCount: number }>;

export type NativeBuilderNodeIntent = Readonly<{ node: BuilderNode; sourceWidgetId: string; insertParentId: string | null; insertIndex?: number; commandType: "InsertNodeCommand" }>;
export type NativeWidgetIntent = Readonly<{ widgetId: string; widgetType: NodeType; registeredWidgetType: true; props: Record<string, unknown>; style: BuilderStyle; childIds: string[] }>;
export type NativeInspectorBindingIntent = Readonly<{ widgetId: string; propertyId: string; nativePropertyPath: string; nativeProperty: WidgetProperty; sourceInspectorDefinitionId: string }>;
export type NativeCommandIntent = Readonly<{
  commandType: "InsertNodeCommand" | "UpdateNodeCommand" | "StyleCommands" | "MoveNodeCommand" | "ReorderNodeCommand" | "DuplicateNodeCommand";
  targetNodeId?: string;
  parentId?: string | null;
  node?: BuilderNode;
  patch?: Partial<Omit<BuilderNode, "id">>;
  stylePatch?: Partial<BuilderStyle>;
  index?: number;
  description: string;
}>;
export type NativeBlueprintCompatibilityResult = Readonly<{
  compatible: boolean;
  supportedWidgetTypes: NodeType[];
  unsupportedWidgetTypes: string[];
  unsupportedPropertyIds: string[];
  nodeIntents: NativeBuilderNodeIntent[];
  widgetIntents: NativeWidgetIntent[];
  inspectorBindingIntents: NativeInspectorBindingIntent[];
  commandIntents: NativeCommandIntent[];
  notes: string[];
}>;

export type BuilderBlueprintInput = Readonly<{
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  compiledPlan?: CompiledWebsitePlan;
  designResult?: DesignResult;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  patternIntelligence?: PatternIntelligenceResult;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  knownAssets?: readonly string[];
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly MissingFact[];
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  featureFlags?: Record<string, boolean>;
}>;

export type BuilderBlueprint = Readonly<{
  id: string;
  version: string;
  nativeBlueprint: ExistingBuilderBlueprint;
  rootWidgetId: string;
  widgetTree: WidgetTreeNode;
  sections: SectionBlueprint[];
  widgets: WidgetBlueprint[];
  inspectorBlueprints: InspectorBlueprint[];
  propertyDefinitions: PropertyDefinition[];
  propertyBindings: PropertyBinding[];
  editablePropertyBindings: EditablePropertyBinding[];
  responsiveBindings: ResponsiveBinding[];
  styleBindings: StyleBinding[];
  motionBindings: MotionBinding[];
  widgetCapabilities: Record<string, WidgetCapabilities>;
  sectionCapabilities: Record<string, SectionCapabilities>;
  regenerationMetadata: RegenerationMetadata;
  validation: BuilderBlueprintValidationResult;
  nativeCompatibility: NativeBlueprintCompatibilityResult;
  nativeNodeIntents: NativeBuilderNodeIntent[];
  nativeWidgetIntents: NativeWidgetIntent[];
  nativeInspectorBindingIntents: NativeInspectorBindingIntent[];
  nativeCommandIntents: NativeCommandIntent[];
  missingFacts: MissingFact[];
  missingAssets: string[];
  metadata: { sourceWebsiteSpecId?: string; sourceCompiledPlanId?: string; featureFlags: Record<string, boolean>; trace: string[] };
}>;

export type BuilderBlueprintResult = Readonly<{ blueprint: BuilderBlueprint; sections: SectionBlueprint[]; widgetTree: WidgetTreeNode; inspectorBlueprints: InspectorBlueprint[]; propertyDefinitions: PropertyDefinition[]; editablePropertyBindings: EditablePropertyBinding[]; responsiveBindings: ResponsiveBinding[]; styleBindings: StyleBinding[]; motionBindings: MotionBinding[]; widgetCapabilities: Record<string, WidgetCapabilities>; sectionCapabilities: Record<string, SectionCapabilities>; aiWidgetMetadata: AIWidgetMetadata[]; regenerationMetadata: RegenerationMetadata[]; nativeCompatibility: NativeBlueprintCompatibilityResult; nativeNodeIntents: NativeBuilderNodeIntent[]; nativeWidgetIntents: NativeWidgetIntent[]; nativeInspectorBindingIntents: NativeInspectorBindingIntent[]; nativeCommandIntents: NativeCommandIntent[]; validation: BuilderBlueprintValidationResult; warnings: BuilderBlueprintWarning[]; metrics: BuilderBlueprintMetrics; trace: string[] }>;

export function primitiveToNodeType(type: BuilderPrimitiveType): NodeType {
  return type;
}

export function widgetToNativeNode(widget: WidgetBlueprint): BuilderNode {
  return Object.freeze({ id: widget.id, type: primitiveToNodeType(widget.type), name: widget.name, parentId: widget.parentId, children: [...widget.children], props: widget.props, style: widget.style });
}
