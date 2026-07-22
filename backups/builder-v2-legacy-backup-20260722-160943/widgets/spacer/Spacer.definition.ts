import Spacer from "./Spacer";
import SpacerDefaults from "./Spacer.defaults";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const SpacerDefinition: WidgetDefinition = {
  type: "spacer",
  name: "Spacer",
  category: "layout",
  canHaveChildren: false,
  render: Spacer,
  aiPrompt: "Use spacer blocks to improve rhythm and vertical breathing room.",
  defaultNode: {
    type: "spacer",
    children: [],
    props: SpacerDefaults.props,
    style: SpacerDefaults.style,
  },
  properties: [
    {
      id: "height",
      label: "Height",
      type: "slider",
      target: "style",
      category: "layout",
      defaultValue: 24,
      responsive: true,
      min: 4,
      max: 240,
      step: 1,
      unit: "px",
    },
  ],
};
