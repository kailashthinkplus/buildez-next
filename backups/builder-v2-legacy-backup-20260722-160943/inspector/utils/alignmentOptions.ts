export type AlignmentKind = "text" | "horizontal" | "vertical";

export type AlignmentOption = Readonly<{
  value: string;
  label: string;
}>;

export const TEXT_ALIGNMENT_OPTIONS: AlignmentOption[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

export const HORIZONTAL_ALIGNMENT_OPTIONS: AlignmentOption[] = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "stretch", label: "Stretch" },
];

export const VERTICAL_ALIGNMENT_OPTIONS: AlignmentOption[] = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "stretch", label: "Stretch" },
];

export function getAlignmentOptions(kind: AlignmentKind): AlignmentOption[] {
  if (kind === "horizontal") return HORIZONTAL_ALIGNMENT_OPTIONS;
  if (kind === "vertical") return VERTICAL_ALIGNMENT_OPTIONS;
  return TEXT_ALIGNMENT_OPTIONS;
}

export function isValidAlignmentValue(value: unknown, kind: AlignmentKind): boolean {
  return getAlignmentOptions(kind).some((option) => option.value === value);
}
