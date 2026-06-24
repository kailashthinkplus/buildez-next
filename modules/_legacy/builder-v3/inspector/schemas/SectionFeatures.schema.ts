import { InspectorSchema } from "../types";
import * as F from "../fields";

const SectionFeaturesSchema: InspectorSchema = {
  content: [
    {
      title: "Section Content",
      fields: [
        {
          name: "props.content.heading",
          label: "Heading",
          type: "text",
          component: F.TextField,
        },
        {
          name: "props.content.subheading",
          label: "Subheading",
          type: "text",
          component: F.TextField,
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
      title: "Grid Layout",
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
          min: 0,
          max: 200,
        },
      ],
    },
  ],

  effects: [],
};

export default SectionFeaturesSchema;
