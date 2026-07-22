import Heading from "./Heading";
import HeadingDefaults from "./Heading.defaults";
import HeadingAIPrompt from "./Heading.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const HeadingDefinition: WidgetDefinition = {
  type: "heading",

  name: "Heading",

  category: "basic",

  canHaveChildren: false,

  render: Heading,

  aiPrompt: HeadingAIPrompt,

  defaultNode: {
    type: "heading",
    children: [],
    props: HeadingDefaults.props,
    style: HeadingDefaults.style,
  },

  properties: [
{
  id: "text",
  label: "Text",
  type: "textarea",
  target: "props",
  category: "content",
  placeholder: "Enter heading...",
  aiEditable: true,
},
    {
      id: "level",
      label: "Heading Level",
      type: "select",
      category: "content",
      defaultValue: "h2",
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
        { label: "H5", value: "h5" },
        { label: "H6", value: "h6" },
      ],
    },
{
  id: "fontSize",
  label: "Font Size",
  type: "slider",
  target: "style",
  category: "style",
  responsive: true,
  defaultValue: 48,
  min: 12,
  max: 120,
  step: 1,
  unit: "px",
},
    {
      id: "fontWeight",
      label: "Weight",
      type: "select",
      category: "style",
      defaultValue: 700,
      options: [
        { label: "400", value: 400 },
        { label: "500", value: 500 },
        { label: "600", value: 600 },
        { label: "700", value: 700 },
        { label: "800", value: 800 },
      ],
    },
    {
      id: "color",
      label: "Color",
      type: "color",
      category: "style",
      defaultValue: "text.primary",
    },
    {
      id: "textAlign",
      label: "Alignment",
      type: "alignment",
      category: "style",
      defaultValue: "left",
    },
  ],
};