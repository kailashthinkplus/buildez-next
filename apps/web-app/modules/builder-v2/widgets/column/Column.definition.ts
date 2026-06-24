import Column from "./Column";
import ColumnDefaults from "./Column.defaults";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const ColumnDefinition: WidgetDefinition = {
  type: "column",
  name: "Column",
  category: "layout",
  canHaveChildren: true,
  render: Column,
  aiPrompt: "Use responsive columns to structure content blocks.",
  defaultNode: {
    type: "column",
    children: [],
    props: {
      ...ColumnDefaults.props,
      layout: "vertical",
    },
    style: ColumnDefaults.style,
  },
  properties: [
    {
      id: "layout",
      label: "Direction",
      type: "select",
      target: "props",
      category: "layout",
      options: [
        { value: "vertical", label: "Vertical (Stacked)" },
        { value: "horizontal", label: "Horizontal (Side-by-side)" },
      ],
      defaultValue: "vertical",
    },
    {
      id: "width",
      label: "Width",
      type: "text",
      target: "style",
      category: "layout",
      defaultValue: "100%",
    },
    {
      id: "minHeight",
      label: "Min Height",
      type: "slider",
      target: "style",
      category: "layout",
      responsive: true,
      defaultValue: 80,
      min: 40,
      max: 800,
      unit: "px",
    },
    {
      id: "gap",
      label: "Gap",
      type: "slider",
      target: "style",
      category: "layout",
      defaultValue: 16,
      min: 0,
      max: 64,
      unit: "px",
    },
    {
      id: "padding",
      label: "Padding",
      type: "spacing",
      target: "style",
      category: "style",
    },
    {
      id: "backgroundColor",
      label: "Background",
      type: "color",
      target: "style",
      category: "style",
      defaultValue: "transparent",
    },
    {
      id: "borderRadius",
      label: "Border Radius",
      type: "slider",
      target: "style",
      category: "style",
      defaultValue: 0,
      min: 0,
      max: 48,
      unit: "px",
    },
  ],
};
