import { InspectorSchema } from "../types";
import * as F from "../fields";

const PrimitiveImageSchema: InspectorSchema = {
  content: [
    {
      title: "Image",
      fields: [
        {
          name: "props.content.src",
          label: "Source",
          type: "image",
          component: F.ImageField,
        },
        {
          name: "props.content.alt",
          label: "Alt Text",
          type: "text",
          component: F.TextField,
        },
      ],
    },
  ],

  style: [],

  layout: [
    {
      title: "Size",
      fields: [
        {
          name: "props.layout.width",
          label: "Width",
          type: "number",
          component: F.NumberField,
        },
        {
          name: "props.layout.height",
          label: "Height",
          type: "number",
          component: F.NumberField,
        },
      ],
    },
  ],

  effects: [],
};

export default PrimitiveImageSchema;
