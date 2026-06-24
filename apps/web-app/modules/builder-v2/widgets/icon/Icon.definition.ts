import Icon from "./Icon";
import IconDefaults from "./Icon.defaults";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const IconDefinition: WidgetDefinition = {
  type: "icon",
  name: "Icon",
  category: "media",
  canHaveChildren: false,
  render: Icon,
  aiPrompt: "Use a compact symbolic icon for feature highlights.",
  defaultNode: {
    type: "icon",
    children: [],
    props: IconDefaults.props,
    style: IconDefaults.style,
  },
  properties: [
    {
      id: "glyph",
      label: "Glyph",
      type: "text",
      target: "props",
      category: "content",
      defaultValue: "*",
    },
    {
      id: "fontSize",
      label: "Size",
      type: "slider",
      target: "style",
      category: "style",
      defaultValue: 16,
      min: 8,
      max: 64,
    },
    {
      id: "color",
      label: "Color",
      type: "color",
      target: "style",
      category: "style",
      defaultValue: "#0f172a",
    },
    {
      id: "backgroundColor",
      label: "Background",
      type: "color",
      target: "style",
      category: "style",
      defaultValue: "#e2e8f0",
    },
  ],
};
