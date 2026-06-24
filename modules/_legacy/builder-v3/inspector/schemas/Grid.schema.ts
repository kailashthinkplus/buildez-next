import { InspectorSchema } from "../types";
import * as F from "../fields";

const GridSchema: InspectorSchema = {
  content: [],

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
        {
          name: "props.style.borderRadius",
          label: "Radius",
          type: "number",
          component: F.NumberField,
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
      title: "Grid",
      fields: [
        {
          name: "props.layout.gridTemplateColumns",
          label: "Columns",
          type: "grid-columns",
          component: F.GridColumnsField,
        },
        {
          name: "props.layout.rowGap",
          label: "Row Gap",
          type: "number",
          component: F.NumberField,
        },
        {
          name: "props.layout.columnGap",
          label: "Column Gap",
          type: "number",
          component: F.NumberField,
        },
      ],
    },
  ],

  effects: [],
};

export default GridSchema;
