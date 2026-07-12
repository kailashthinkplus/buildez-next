import type { NodeType } from "../types/blueprint";
import type { WidgetDefinition } from "../core/registry/WidgetRegistry";
import type { WidgetProperty } from "../types/property";

import { PageDefinition } from "./page/Page.definition";
import { SectionDefinition } from "./section/Section.definition";
import { ContainerDefinition } from "./container/Container.definition";
import { ColumnDefinition } from "./column/Column.definition";
import { HeadingDefinition } from "./heading/Heading.definition";
import { TextDefinition } from "./text/Text.definition";
import { ButtonDefinition } from "./button/Button.definition";
import { ImageDefinition } from "./image/Image.definition";
import { VideoDefinition } from "./video/Video.definition";
import { IconDefinition } from "./icon/Icon.definition";
import { DividerDefinition } from "./divider/Divider.definition";
import { SpacerDefinition } from "./spacer/Spacer.definition";
import { PremiumWidgetDefinitions } from "./premium";

export type WidgetReadinessStatus =
  | "production-ready"
  | "baseline"
  | "scaffold-only"
  | "gated"
  | "blocked";

export type WidgetCapability = Readonly<{
  type: NodeType | string;
  name: string;
  registered: boolean;
  scaffoldOnly: boolean;
  productionReady: boolean;
  category: WidgetDefinition["category"] | "advanced";
  supportedInspectorGroups: readonly ("content" | "design" | "advanced" | "responsive" | "theme" | "motion")[];
  editableProps: readonly string[];
  editableStyles: readonly string[];
  responsiveFields: readonly string[];
  serializationRequirements: readonly string[];
  allowedChildren: readonly string[];
  themeTokenFields: readonly string[];
  clipboardSupport: boolean;
  undoRedoSupport: boolean;
  runtimeParityStatus: WidgetReadinessStatus;
  aiReadinessStatus: WidgetReadinessStatus;
  safetyWarnings: readonly string[];
}>;

export const REGISTERED_WIDGET_DEFINITIONS: readonly WidgetDefinition[] = [
  PageDefinition,
  SectionDefinition,
  ContainerDefinition,
  ColumnDefinition,
  HeadingDefinition,
  TextDefinition,
  ButtonDefinition,
  ImageDefinition,
  VideoDefinition,
  IconDefinition,
  DividerDefinition,
  SpacerDefinition,
  ...PremiumWidgetDefinitions,
];

export const SCAFFOLD_WIDGET_CAPABILITIES: readonly WidgetCapability[] = [
];

export function buildRegisteredWidgetCapabilities(): WidgetCapability[] {
  return REGISTERED_WIDGET_DEFINITIONS.map(capabilityFromDefinition);
}

export function buildWidgetCapabilities(): WidgetCapability[] {
  return [...buildRegisteredWidgetCapabilities(), ...SCAFFOLD_WIDGET_CAPABILITIES];
}

export function getWidgetCapability(type: NodeType | string): WidgetCapability | undefined {
  return buildWidgetCapabilities().find((capability) => capability.type === type);
}

function capabilityFromDefinition(definition: WidgetDefinition): WidgetCapability {
  const editableProps = fieldsByTarget(definition.properties, "props");
  const editableStyles = fieldsByTarget(definition.properties, "style");
  const responsiveFields = definition.properties
    .filter((property) => property.responsive)
    .map((property) => property.id);
  const themeTokenFields = definition.properties
    .filter((property) => property.type === "color" || ["fontFamily", "backgroundColor", "color", "borderRadius", "boxShadow"].includes(property.id))
    .map((property) => property.id);
  const productionWidget = isProductionWidget(definition.type);
  const metadataOnlyWidget = isRuntimeGatedWidget(definition.type);
  const restrictedWidget = isRestrictedWidget(definition.type);

  return {
    type: definition.type,
    name: definition.name,
    registered: true,
    scaffoldOnly: false,
    productionReady: !metadataOnlyWidget,
    category: definition.category,
    supportedInspectorGroups: inspectorGroups(definition.properties),
    editableProps,
    editableStyles,
    responsiveFields,
    serializationRequirements: ["id", "type", "parentId", "children", "props", "style"],
    allowedChildren: definition.canHaveChildren ? ["native-builder-node"] : [],
    themeTokenFields,
    clipboardSupport: true,
    undoRedoSupport: true,
    runtimeParityStatus: metadataOnlyWidget ? "gated" : productionWidget ? "production-ready" : "baseline",
    aiReadinessStatus: metadataOnlyWidget || restrictedWidget ? "gated" : "baseline",
    safetyWarnings: widgetSafetyWarnings(definition.type),
  };
}

function scaffold(
  type: string,
  name: string,
  category: WidgetCapability["category"],
  editableProps: readonly string[],
  editableStyles: readonly string[],
  themeTokenFields: readonly string[],
  warning: string
): WidgetCapability {
  const gated = type === "embed";

  return {
    type,
    name,
    registered: false,
    scaffoldOnly: true,
    productionReady: false,
    category,
    supportedInspectorGroups: ["content", "design", "advanced", "responsive", "theme", "motion"],
    editableProps,
    editableStyles,
    responsiveFields: editableStyles.filter((field) => ["width", "height", "gap", "fontSize"].includes(field)),
    serializationRequirements: ["id", "type", "parentId", "children", "props", "style", "scaffoldOnly"],
    allowedChildren: ["native-builder-node"],
    themeTokenFields,
    clipboardSupport: false,
    undoRedoSupport: false,
    runtimeParityStatus: gated ? "gated" : "scaffold-only",
    aiReadinessStatus: "blocked",
    safetyWarnings: [warning],
  };
}

function fieldsByTarget(properties: readonly WidgetProperty[], target: "props" | "style") {
  return properties
    .filter((property) => (property.target ?? inferTarget(property.id, property.category)) === target)
    .map((property) => property.id);
}

function inferTarget(propertyId: string, category: WidgetProperty["category"]) {
  if (category === "style" || category === "layout" || ["color", "backgroundColor", "fontSize", "width", "height"].includes(propertyId)) {
    return "style";
  }
  return "props";
}

function inspectorGroups(properties: readonly WidgetProperty[]): WidgetCapability["supportedInspectorGroups"] {
  const groups = new Set<WidgetCapability["supportedInspectorGroups"][number]>();
  for (const property of properties) {
    if (property.category === "content") groups.add("content");
    if (property.category === "style" || property.category === "layout") groups.add("design");
    if (property.category === "advanced") groups.add("advanced");
    if (property.category === "animation") groups.add("motion");
    if (property.category === "responsive") groups.add("responsive");
    if (property.responsive) groups.add("responsive");
    if (property.type === "color" || property.themeTokenReady) groups.add("theme");
  }
  groups.add("advanced");
  return [...groups];
}

function isProductionWidget(type: NodeType) {
  return PremiumWidgetDefinitions.some((definition) => definition.type === type);
}

function isRuntimeGatedWidget(type: NodeType) {
  return false;
}

function isRestrictedWidget(type: NodeType) {
  return type === "embed";
}

function widgetSafetyWarnings(type: NodeType) {
  if (isRestrictedWidget(type)) {
    return [
      "Restricted embed stores safe provider metadata only. Opaque HTML and script execution are blocked.",
    ];
  }

  return [];
}
