import { InspectorSchema } from "../types";
import * as F from "../fields";

const IconSchema: InspectorSchema = {
  content: [
    {
      title: "Icon",
      fields: [
        {
          name: "props.content.icon",
          label: "Icon",
          type: "text",
          component: F.TextField,
        },
      ],
    },
  ],

  style: [
    {
      title: "Appearance",
      fields: [
        {
          name: "props.style.size",
          label: "Icon Size",
          type: "number",
          component: F.NumberField,
          min: 8,
          max: 200,
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

export default IconSchema;
