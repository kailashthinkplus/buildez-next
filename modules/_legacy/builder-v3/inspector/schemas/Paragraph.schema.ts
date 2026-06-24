import { InspectorSchema } from "../types";
import * as F from "../fields";

const ParagraphSchema: InspectorSchema = {
  content: [
    {
      title: "Content",
      fields: [
        {
          name: "props.content.text",
          label: "Paragraph Text",
          type: "text",
          component: F.RichTextField,
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
          max: 100,
        },
        {
          name: "props.style.textColor",
          label: "Text Color",
          type: "color",
          component: F.ColorField,
        },
        {
          name: "props.style.lineHeight",
          label: "Line Height",
          type: "number",
          component: F.NumberField,
          min: 0.5,
          max: 5,
          step: 0.1,
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

export default ParagraphSchema;
