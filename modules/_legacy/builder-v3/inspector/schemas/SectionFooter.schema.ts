import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionFooterSchema: InspectorSchema = {
  content: [
    {
      title: "Footer",
      fields: [
        {
          name: "props.content.text",
          label: "Footer Text",
          type: "text",
          component: F.TextField,
        },
      ],
    },
  ],

  style: [
    {
      title: "Colors",
      fields: [
        {
          name: "props.style.backgroundColor",
          label: "Background",
          type: "color",
          component: F.ColorField,
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
      title: "Border",
      fields: [
        {
          name: "props.style.borderWidth",
          label: "Border Width",
          type: "number",
          component: F.NumberField,
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
          label: "Padding/Margin",
          type: "spacing",
          component: F.BoxSpacingField,
        },
      ],
    },
  ],

  layout: [],

  effects: [],
};

export default SectionFooterSchema;
