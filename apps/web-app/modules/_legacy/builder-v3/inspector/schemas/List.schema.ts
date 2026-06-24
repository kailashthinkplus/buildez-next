import { InspectorSchema } from "../types";
import * as F from "../fields";

const ListSchema: InspectorSchema = {
  content: [
    {
      title: "List",
      fields: [
        {
          name: "props.content.list",
          label: "Items",
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
          name: "props.style.textColor",
          label: "Color",
          type: "color",
          component: F.ColorField,
        },
        {
          name: "props.style.fontSize",
          label: "Font Size",
          type: "number",
          component: F.NumberField,
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

export default ListSchema;
