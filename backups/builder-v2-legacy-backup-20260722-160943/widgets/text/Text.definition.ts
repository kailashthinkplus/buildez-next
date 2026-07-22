import Text from "./Text";
import TextDefaults from "./Text.defaults";
import TextAIPrompt from "./Text.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const TextDefinition: WidgetDefinition = {

  type: "text",

  name: "Text",

  category: "basic",

  canHaveChildren: false,

  render: Text,

  aiPrompt: TextAIPrompt,

  defaultNode: {
    type: "text",
    children: [],
    props: TextDefaults.props,
    style: TextDefaults.style,
  },

  properties: [

    {
      id: "text",
      label: "Text",
      type: "textarea",
      category: "content",
      defaultValue: TextDefaults.props.text,
      aiEditable: true,
    },

    {
      id: "fontSize",
      label: "Font Size",
      type: "slider",
      category: "style",
      responsive: true,
      defaultValue: 16,
    },

    {
      id: "fontWeight",
      label: "Weight",
      type: "select",
      category: "style",
      defaultValue: 400,
      options: [
        { label: "300", value: 300 },
        { label: "400", value: 400 },
        { label: "500", value: 500 },
        { label: "600", value: 600 },
        { label: "700", value: 700 },
      ],
    },

    {
      id: "color",
      label: "Color",
      type: "color",
      category: "style",
      defaultValue: "text.secondary",
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