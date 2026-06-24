import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionPricingSchema: InspectorSchema = {
  content: [
    {
      title: "Pricing",
      fields: [
        {
          name: "props.content.title",
          label: "Title",
          type: "text",
          component: F.TextField,
        },
      ],
    },
  ],

  style: [
    {
      title: "Background",
      fields: [
        {
          name: "props.style.backgroundColor",
          label: "Background",
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

  layout: [
    {
      title: "Stacking",
      fields: [
        {
          name: "props.layout.gap",
          label: "Gap",
          type: "number",
          component: F.NumberField,
        },
      ],
    },
  ],

  effects: [],
};

export default SectionPricingSchema;
