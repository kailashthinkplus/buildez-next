import Section from "./Section";
import SectionDefaults from "./Section.defaults";
import SectionAIPrompt from "./Section.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const SectionDefinition: WidgetDefinition = {

  type: "section",

  name: "Section",

  category: "layout",

  canHaveChildren: true,

  render: Section,

  aiPrompt: SectionAIPrompt,

  defaultNode: {
    type: "section",

    children: [],

    props: SectionDefaults.props,

    style: SectionDefaults.style,
  },

  properties: [

    {
      id: "container",
      label: "Container Width",
      type: "select",
      category: "layout",
      defaultValue: "boxed",
      options: [
        { label: "Boxed", value: "boxed" },
        { label: "Full Width", value: "full" },
      ],
    },

    {
      id: "maxWidth",
      label: "Max Width",
      type: "slider",
      category: "layout",
      defaultValue: 1280,
    },

    {
      id: "paddingTop",
      label: "Padding Top",
      type: "slider",
      category: "style",
      responsive: true,
      defaultValue: 80,
    },

    {
      id: "paddingBottom",
      label: "Padding Bottom",
      type: "slider",
      category: "style",
      responsive: true,
      defaultValue: 80,
    },

    {
      id: "backgroundColor",
      label: "Background",
      type: "color",
      category: "style",
      defaultValue: "surface",
    },

  ],

};