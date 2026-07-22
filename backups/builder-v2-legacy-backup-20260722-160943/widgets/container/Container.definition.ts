import Container from "./Container";
import ContainerDefaults from "./Container.defaults";
import ContainerAIPrompt from "./Container.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const ContainerDefinition: WidgetDefinition = {
  type: "container",

  name: "Container",

  category: "layout",

  canHaveChildren: true,

  render: Container,

  aiPrompt: ContainerAIPrompt,

  defaultNode: {
    type: "container",
    children: [],
    props: ContainerDefaults.props,
    style: ContainerDefaults.style,
  },

  properties: [
    {
      id: "layout",
      label: "Layout",
      type: "select",
      category: "layout",
      defaultValue: "flex",
      options: [
        { label: "Flex", value: "flex" },
        { label: "Grid", value: "grid" },
      ],
    },
    {
      id: "direction",
      label: "Direction",
      type: "select",
      category: "layout",
      defaultValue: "column",
      options: [
        { label: "Column", value: "column" },
        { label: "Row", value: "row" },
      ],
    },
    {
      id: "gap",
      label: "Gap",
      type: "slider",
      category: "layout",
      responsive: true,
      defaultValue: 24,
    },
    {
      id: "backgroundColor",
      label: "Background",
      type: "color",
      category: "style",
      defaultValue: "transparent",
    },
    {
      id: "padding",
      label: "Padding",
      type: "spacing",
      category: "style",
    },
    {
      id: "borderRadius",
      label: "Border Radius",
      type: "slider",
      category: "style",
      defaultValue: 0,
    },
  ],
};