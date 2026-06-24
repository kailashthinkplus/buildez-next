import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionGallerySchema: InspectorSchema = {
  content: [
    {
      title: "Gallery",
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
      title: "Grid",
      fields: [
        {
          name: "props.layout.gridTemplateColumns",
          label: "Columns",
          type: "grid-columns",
          component: F.GridColumnsField,
        },
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

export default SectionGallerySchema;
