// /modules/builder/inspector/schema/WIDGET_CONFIG.ts

// -----------------------------------------------------
// Field Types
// -----------------------------------------------------
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "toggle"
  | "color"
  | "image"
  | "slider"
  | "spacing"
  | "repeater";

// -----------------------------------------------------
// Field Schema
// -----------------------------------------------------
export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  fields?: FieldSchema[]; // for repeater
}

// -----------------------------------------------------
// Section inside a tab
// -----------------------------------------------------
export interface TabSectionSchema {
  label: string;
  fields: FieldSchema[];
}

// -----------------------------------------------------
// Tabs inside a widget
// -----------------------------------------------------
export interface WidgetTabsSchema {
  content?: TabSectionSchema[];
  styles?: TabSectionSchema[];
  layout?: TabSectionSchema[];
  effects?: TabSectionSchema[];
}

// -----------------------------------------------------
// Widget Schema
// -----------------------------------------------------
export interface WidgetSchema {
  type: string;
  label: string;
  icon?: string;
  tabs: WidgetTabsSchema;
}

// -----------------------------------------------------
// Helper: Options
// -----------------------------------------------------
const justifyOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Space Between", value: "space-between" },
];

const alignOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Stretch", value: "stretch" },
];

const directionOptions = [
  { label: "Column", value: "column" },
  { label: "Row", value: "row" },
];

// -----------------------------------------------------
// Widget Registry
// -----------------------------------------------------
const WIDGET_CONFIG: Record<string, WidgetSchema> = {
  // -----------------------------------------------------
  // TEXT
  // -----------------------------------------------------
  text: {
    type: "text",
    label: "Text",
    tabs: {
      content: [
        {
          label: "Content",
          fields: [
            { key: "text", label: "Text", type: "textarea", default: "Your text here" },
          ],
        },
      ],

      styles: [
        {
          label: "Typography",
          fields: [
            { key: "color", label: "Color", type: "color" },
            { key: "size", label: "Font Size", type: "slider", min: 10, max: 80, default: 16 },
            { key: "weight", label: "Font Weight", type: "select", options: [
              { label: "Regular", value: 400 },
              { label: "Medium", value: 500 },
              { label: "Bold", value: 700 },
            ]},
            { key: "lineHeight", label: "Line Height", type: "slider", min: 1, max: 2, step: 0.05, default: 1.4 },
          ],
        },
        {
          label: "Spacing",
          fields: [
            { key: "margin", label: "Margin", type: "spacing" },
            { key: "padding", label: "Padding", type: "spacing" },
          ],
        },
      ],

      layout: [
        {
          label: "Flex",
          fields: [
            { key: "justify", label: "Justify Content", type: "select", options: justifyOptions },
            { key: "align", label: "Align Items", type: "select", options: alignOptions },
          ],
        },
      ],
    },
  },

  // -----------------------------------------------------
  // HEADING
  // -----------------------------------------------------
  heading: {
    type: "heading",
    label: "Heading",
    tabs: {
      content: [
        {
          label: "Heading",
          fields: [
            { key: "text", label: "Text", type: "text", default: "Heading Text" },
            { key: "tag", label: "Tag", type: "select", options: [
              { label: "H1", value: "h1" },
              { label: "H2", value: "h2" },
              { label: "H3", value: "h3" },
            ]}
          ],
        },
      ],
      styles: [
        {
          label: "Typography",
          fields: [
            { key: "color", label: "Color", type: "color" },
            { key: "size", label: "Font Size", type: "slider", min: 20, max: 100, default: 40 },
            { key: "weight", label: "Font Weight", type: "select", options: [
              { label: "Regular", value: 400 },
              { label: "Bold", value: 700 },
            ]},
          ],
        }
      ],
      layout: [
        {
          label: "Flex",
          fields: [
            { key: "justify", label: "Justify", type: "select", options: justifyOptions },
            { key: "align", label: "Align", type: "select", options: alignOptions },
          ],
        },
      ]
    },
  },

  // -----------------------------------------------------
  // IMAGE
  // -----------------------------------------------------
  image: {
    type: "image",
    label: "Image",
    tabs: {
      content: [
        {
          label: "Source",
          fields: [
            { key: "src", label: "Image", type: "image" },
            { key: "alt", label: "Alt Text", type: "text" },
          ],
        },
      ],
      styles: [
        {
          label: "Size",
          fields: [
            { key: "width", label: "Width", type: "slider", min: 50, max: 1200, default: 600 },
            { key: "radius", label: "Border Radius", type: "slider", min: 0, max: 60, default: 12 },
          ],
        },
      ],
      layout: [
        {
          label: "Layout",
          fields: [
            { key: "justify", label: "Justify", type: "select", options: justifyOptions },
            { key: "align", label: "Align", type: "select", options: alignOptions },
          ],
        },
      ],
    },
  },

  // -----------------------------------------------------
  // BUTTON
  // -----------------------------------------------------
  button: {
    type: "button",
    label: "Button",
    tabs: {
      content: [
        {
          label: "Button",
          fields: [
            { key: "label", label: "Text", type: "text", default: "Click Me" },
            { key: "href", label: "Link", type: "text", default: "#" },
          ],
        },
      ],
      styles: [
        {
          label: "Appearance",
          fields: [
            { key: "background", label: "Background", type: "color" },
            { key: "color", label: "Text Color", type: "color" },
            { key: "padding", label: "Padding", type: "spacing" },
            { key: "radius", label: "Corner Radius", type: "slider", min: 0, max: 30, default: 8 },
          ],
        },
      ],
      layout: [
        {
          label: "Flex",
          fields: [
            { key: "justify", label: "Justify", type: "select", options: justifyOptions },
            { key: "align", label: "Align", type: "select", options: alignOptions },
          ],
        },
      ],
    },
  },

  // -----------------------------------------------------
  // FEATURES (Repeater)
  // -----------------------------------------------------
  features: {
    type: "features",
    label: "Features",
    tabs: {
      content: [
        {
          label: "Feature Items",
          fields: [
            {
              key: "items",
              label: "Items",
              type: "repeater",
              fields: [
                { key: "icon", label: "Icon", type: "text" },
                { key: "title", label: "Title", type: "text" },
                { key: "description", label: "Description", type: "textarea" },
              ],
            },
          ],
        },
      ],
      styles: [
        {
          label: "Spacing",
          fields: [
            { key: "gap", label: "Gap", type: "slider", min: 0, max: 80, default: 20 },
            { key: "padding", label: "Padding", type: "spacing" },
          ],
        },
      ],
      layout: [
        {
          label: "Grid",
          fields: [
            { key: "cols", label: "Columns", type: "number", min: 1, max: 6, default: 3 },
            { key: "gap", label: "Grid Gap", type: "slider", min: 0, max: 60, default: 20 },
          ],
        },
      ],
    },
  },

  // -----------------------------------------------------
  // TESTIMONIALS (Repeater)
  // -----------------------------------------------------
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    tabs: {
      content: [
        {
          label: "Testimonials",
          fields: [
            {
              key: "items",
              label: "Items",
              type: "repeater",
              fields: [
                { key: "name", label: "Name", type: "text" },
                { key: "quote", label: "Quote", type: "textarea" },
                { key: "avatar", label: "Avatar", type: "image" },
              ],
            },
          ],
        },
      ],
      styles: [
        {
          label: "Card",
          fields: [
            { key: "background", label: "Background", type: "color" },
            { key: "padding", label: "Padding", type: "spacing" },
            { key: "radius", label: "Radius", type: "slider", min: 0, max: 40, default: 12 },
          ],
        },
      ],
      layout: [
        {
          label: "Grid",
          fields: [
            { key: "cols", label: "Columns", type: "number", min: 1, max: 3, default: 2 },
            { key: "gap", label: "Gap", type: "slider", min: 0, max: 60, default: 24 },
          ],
        },
      ],
    },
  },
};

export default WIDGET_CONFIG;
