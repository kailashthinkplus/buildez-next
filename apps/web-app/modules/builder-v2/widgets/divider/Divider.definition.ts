import Divider from "./Divider";
import DividerDefaults from "./Divider.defaults";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const DividerDefinition: WidgetDefinition = {
  type: "divider",
  name: "Divider",
  category: "basic",
  canHaveChildren: false,
  render: Divider,
  aiPrompt: "Use a subtle divider to separate visual sections.",
  defaultNode: {
    type: "divider",
    children: [],
    props: DividerDefaults.props,
    style: DividerDefaults.style,
  },
  properties: [
    {
      id: "height",
      label: "Thickness",
      type: "slider",
      target: "style",
      category: "style",
      defaultValue: 1,
      min: 1,
      max: 12,
    },
    {
      id: "color",
      label: "Color",
      type: "color",
      target: "style",
      category: "style",
      defaultValue: "#cbd5e1",
    },
  ],
};
