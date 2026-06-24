import { NodeType } from "@/modules/builder/blueprint/types";

export type InspectorField = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "color"
    | "select"
    | "toggle";
  options?: { label: string; value: any }[];
};

type FieldGroups = {
  content?: InspectorField[];
  layout?: InspectorField[];
  style?: InspectorField[];
  spacing?: InspectorField[];
  effects?: InspectorField[];
  advanced?: InspectorField[];
};

const FIELD_REGISTRY: Partial<Record<NodeType, FieldGroups>> = {
  [NodeType.Heading]: {
    content: [
      { key: "text", label: "Text", type: "text" },
    ],
    style: [
      { key: "color", label: "Text Color", type: "color" },
    ],
  },

  [NodeType.Button]: {
    content: [
      { key: "label", label: "Label", type: "text" },
      { key: "href", label: "Link", type: "text" },
    ],
    style: [
      { key: "background", label: "Background", type: "color" },
      { key: "color", label: "Text Color", type: "color" },
    ],
  },

  [NodeType.Image]: {
    content: [
      { key: "src", label: "Image URL", type: "text" },
      { key: "alt", label: "Alt Text", type: "text" },
    ],
  },

  [NodeType.Container]: {
    layout: [
      {
        key: "width",
        label: "Width",
        type: "select",
        options: [
          { label: "Full", value: "full" },
          { label: "Contained", value: "contained" },
        ],
      },
    ],
  },
};

export function getFieldSchemaForNode(
  type: NodeType,
  group: keyof FieldGroups
): InspectorField[] {
  return FIELD_REGISTRY[type]?.[group] ?? [];
}
