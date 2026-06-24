import { InspectorSchema } from "../types";
import * as F from "../fields";

const ButtonSchema: InspectorSchema = {
  content: [
    {
      title: "Content",
      fields: [
        {
          name: "props.content.label",
          label: "Label",
          type: "text",
          component: F.TextField,
        },
        {
          name: "props.content.href",
          label: "URL",
          type: "text",
          component: F.TextField,
        },
      ],
    },
  ],

  style: [
    {
      title: "Button Style",
      fields: [
        {
          name: "props.style.backgroundColor",
          label: "Background Color",
          type: "color",
          component: F.ColorField,
        },
        {
          name: "props.style.textColor",
          label: "Text Color",
          type: "color",
          component: F.ColorField,
        },
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
      title: "Layout",
      fields: [
        {
          name: "props.layout.display",
          label: "Display",
          type: "select",
          component: F.SelectField,
          options: ["inline-flex", "flex", "block"],
        },
      ],
    },
  ],

  effects: [],
};

export default ButtonSchema;
