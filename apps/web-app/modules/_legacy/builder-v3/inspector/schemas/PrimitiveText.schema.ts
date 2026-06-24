import { InspectorSchema } from "../types";
import * as F from "../fields";

const PrimitiveTextSchema: InspectorSchema = {
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
      title: "Typography",
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
  ],

  layout: [],

  effects: [],
};

export default PrimitiveTextSchema;
