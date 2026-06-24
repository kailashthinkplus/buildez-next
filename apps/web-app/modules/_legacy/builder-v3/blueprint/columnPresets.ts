// /modules/builder/blueprint/columnPresets.ts

export type ColumnPreset = {
  id: string;
  label: string;
  columns: number;
  template: string; // CSS grid-template-columns
};

export const COLUMN_PRESETS: ColumnPreset[] = [
  {
    id: "1",
    label: "1 Column",
    columns: 1,
    template: "1fr",
  },
  {
    id: "2-50",
    label: "50 / 50",
    columns: 2,
    template: "1fr 1fr",
  },
  {
    id: "2-30-70",
    label: "30 / 70",
    columns: 2,
    template: "3fr 7fr",
  },
  {
    id: "2-70-30",
    label: "70 / 30",
    columns: 2,
    template: "7fr 3fr",
  },
  {
    id: "3-25-50-25",
    label: "25 / 50 / 25",
    columns: 3,
    template: "2fr 4fr 2fr",
  },
  {
    id: "3-equal",
    label: "33 / 33 / 33",
    columns: 3,
    template: "1fr 1fr 1fr",
  },
];
