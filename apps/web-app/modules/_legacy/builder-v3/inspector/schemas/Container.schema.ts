import { InspectorSchema } from "../types";
import * as F from "../fields";

const ContainerSchema: InspectorSchema = {
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
          min: 0,
          max: 200,
        },
        {
          name: "props.style.borderWidth",
          label: "Border Width",
          type: "number",
          component: F.NumberField,
          min: 0,
          max: 20,
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
          label: "Padding / Margin",
          type: "spacing",
          component: F.BoxSpacingField,
        },
      ],
    },
  ],

  layout: [
    {
      title: "Flex Layout",
      fields: [
        {
          name: "props.layout.display",
          label: "Display",
          type: "select",
          component: F.SelectField,
          options: ["flex", "inline-flex", "block"],
        },
        {
          name: "props.layout.direction",
          label: "Direction",
          type: "select",
          component: F.SelectField,
          options: ["row", "column", "row-reverse", "column-reverse"],
        },
        {
          name: "props.layout.justify",
          label: "Justify",
          type: "select",
          component: F.SelectField,
          options: ["start", "center", "end", "between", "around", "evenly"],
        },
        {
          name: "props.layout.align",
          label: "Align",
          type: "select",
          component: F.SelectField,
          options: ["start", "center", "end"],
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

export default ContainerSchema;
