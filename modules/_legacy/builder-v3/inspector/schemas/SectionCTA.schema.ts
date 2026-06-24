import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionCTASchema: InspectorSchema = {
  content: [
    {
      title: "CTA",
      fields: [
        {
          name: "props.content.title",
          label: "Title",
          type: "text",
          component: F.TextField,
        },
        {
          name: "props.content.subtitle",
          label: "Subtitle",
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
          label: "Background Color",
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
      title: "Flex",
      fields: [
        {
          name: "props.layout.direction",
          label: "Direction",
          type: "select",
          component: F.SelectField,
          options: ["row", "column"],
        },
        {
          name: "props.layout.justify",
          label: "Justify",
          type: "select",
          component: F.SelectField,
          options: ["start", "center", "end", "between"],
        },
        {
          name: "props.layout.align",
          label: "Align",
          type: "select",
          component: F.SelectField,
          options: ["start", "center", "end"],
        },
      ],
    },
  ],

  effects: [],
};

export default SectionCTASchema;
