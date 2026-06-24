import { InspectorSchema } from "../types";
import * as F from "../fields";

const ImageSchema: InspectorSchema = {
  content: [
    {
      title: "Image",
      fields: [
        {
          name: "props.content.src",
          label: "Image Source",
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

  style: [
    {
      title: "Style",
      fields: [
        {
          name: "props.style.borderRadius",
          label: "Border Radius",
          type: "number",
          component: F.NumberField,
          min: 0,
          max: 200,
        },
        {
          name: "props.style.borderWidth",
          label: "Border Width",
          type: "number",
          component: F.NumberField,
          min: 0,
          max: 20,
        },
        {
          name: "props.style.borderColor",
          label: "Border Color",
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
        {
          name: "props.layout.objectFit",
          label: "Object Fit",
          type: "select",
          component: F.SelectField,
          options: ["cover", "contain", "fill", "none"],
        },
      ],
    },
  ],

  effects: [],
};

export default ImageSchema;
