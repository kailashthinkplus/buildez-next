import { InspectorSchema } from "../types";
import * as F from "../fields";

const DividerSchema: InspectorSchema = {
  content: [],

  style: [
    {
      title: "Divider Style",
      fields: [
        {
          name: "props.style.thickness",
          label: "Thickness",
          type: "number",
          component: F.NumberField,
          min: 1,
          max: 20,
        },
        {
          name: "props.style.color",
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

export default DividerSchema;
