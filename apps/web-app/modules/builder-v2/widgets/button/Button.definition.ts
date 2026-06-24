import Button from "./Button";
import ButtonDefaults from "./Button.defaults";
import ButtonAIPrompt from "./Button.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const ButtonDefinition: WidgetDefinition = {

  type: "button",

  name: "Button",

  category: "basic",

  canHaveChildren: false,

  render: Button,

  aiPrompt: ButtonAIPrompt,

  defaultNode: {
    type: "button",
    children: [],
    props: ButtonDefaults.props,
    style: ButtonDefaults.style,
  },

  properties: [

    {
      id: "text",
      label: "Button Text",
      type: "text",
      category: "content",
      defaultValue: "Get Started",
      aiEditable: true,
    },

    {
      id: "url",
      label: "Link",
      type: "url",
      category: "content",
      defaultValue: "#",
    },

    {
      id: "variant",
      label: "Variant",
      type: "select",
      category: "style",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
      ],
    },

    {
      id: "size",
      label: "Size",
      type: "select",
      category: "style",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },

    {
      id: "backgroundColor",
      label: "Background",
      type: "color",
      category: "style",
      defaultValue: "primary.500",
    },

    {
      id: "color",
      label: "Text Color",
      type: "color",
      category: "style",
      defaultValue: "white",
    },

    {
      id: "borderRadius",
      label: "Radius",
      type: "slider",
      category: "style",
      defaultValue: 12,
    },

  ],

};