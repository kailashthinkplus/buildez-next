import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionTestimonialsSchema: InspectorSchema = {
  content: [
    {
      title: "Testimonials",
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
      title: "Colors",
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
      title: "Layout",
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

export default SectionTestimonialsSchema;
