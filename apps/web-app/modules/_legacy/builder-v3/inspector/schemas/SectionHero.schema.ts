import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionHeroSchema: InspectorSchema = {
  content: [
    {
      title: "Hero Section",
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
        {
          name: "props.content.description",
          label: "Description",
          type: "text",
          component: F.RichTextField,
        },
      ],
    },
  ],

  style: [
    {
      title: "Appearance",
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
          name: "props.layout.direction",
          label: "Direction",
          type: "select",
          component: F.SelectField,
          options: ["row", "column"],
        },
        {
          name: "props.layout.align",
          label: "Align Items",
          type: "select",
          component: F.SelectField,
          options: ["start", "center", "end"],
        },
        {
          name: "props.layout.justify",
          label: "Justify",
          type: "select",
          component: F.SelectField,
          options: ["start", "center", "end", "between"],
        },
      ],
    },
  ],

  effects: [],
};

export default SectionHeroSchema;
