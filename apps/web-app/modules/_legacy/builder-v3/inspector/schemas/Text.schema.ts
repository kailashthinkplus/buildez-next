import { InspectorSchema } from "../types";
import * as F from "../fields";

const TextSchema: InspectorSchema = {
  content: [
    {
      title: "Text",
      fields: [
        {
          name: "props.content.text",
          label: "Text",
          type: "text",
          component: F.TextField,
        },
      ],
    },
  ],

  style: [
    {
      title: "Style",
      fields: [
        {
          name: "props.style.fontSize",
          label: "Font Size",
          type: "number",
          component: F.NumberField,
        },
        {
          name: "props.style.textColor",
          label: "Color",
          type: "color",
          component: F.ColorField,
        },
      ],
    },
    {
      title: "Spacing",
      fields: [
        {
          name: "props.spacing",
          label: "Padding / Margin",
          type: "spacing",
          component: F.BoxSpacingField,
        },
      ],
    },
  ],

  layout: [],

  effects: [],
};

export default TextSchema;
