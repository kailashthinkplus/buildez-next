import { InspectorSchema } from "../types";
import * as F from "../fields";

const HeadingSchema: InspectorSchema = {
  content: [
    {
      title: "Content",
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
          min: 8,
          max: 200,
        },
        {
          name: "props.style.fontWeight",
          label: "Font Weight",
          type: "number",
          component: F.NumberField,
          min: 100,
          max: 900,
        },
        {
          name: "props.style.textColor",
          label: "Text Color",
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

  effects: [
    {
      title: "Opacity",
      fields: [
        {
          name: "props.style.opacity",
          label: "Opacity",
          type: "slider",
          component: F.SliderField,
          min: 0,
          max: 1,
          step: 0.01,
        },
      ],
    },
  ],
};

export default HeadingSchema;
