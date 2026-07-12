export type MotionInspectorGroup =
  | "entrance"
  | "exit"
  | "hover"
  | "scroll"
  | "parallax"
  | "pin"
  | "reveal"
  | "mouse"
  | "timeline";

export type MotionInspectorField = Readonly<{
  id: string;
  label: string;
  type: "select" | "number" | "text" | "toggle";
  metadataOnly: false;
}>;

export type MotionInspectorGroupMetadata = Readonly<{
  id: MotionInspectorGroup;
  label: string;
  fields: readonly MotionInspectorField[];
}>;

const COMMON_FIELDS: readonly MotionInspectorField[] = [
  { id: "preset", label: "Preset", type: "select", metadataOnly: false },
  { id: "duration", label: "Duration", type: "number", metadataOnly: false },
  { id: "delay", label: "Delay", type: "number", metadataOnly: false },
  { id: "ease", label: "Ease", type: "select", metadataOnly: false },
];

export const MOTION_INSPECTOR_GROUPS: readonly MotionInspectorGroupMetadata[] = [
  group("entrance", "Entrance", COMMON_FIELDS),
  group("exit", "Exit", COMMON_FIELDS),
  group("hover", "Hover", [
    ...COMMON_FIELDS,
    { id: "trigger", label: "Trigger", type: "select", metadataOnly: false },
  ]),
  group("scroll", "Scroll", [
    ...COMMON_FIELDS,
    { id: "start", label: "Start", type: "text", metadataOnly: false },
    { id: "end", label: "End", type: "text", metadataOnly: false },
  ]),
  group("parallax", "Parallax", [
    { id: "parallaxHorizontalDirection", label: "Horizontal direction", type: "select", metadataOnly: false },
    { id: "parallaxHorizontalDistance", label: "Horizontal distance", type: "number", metadataOnly: false },
    { id: "parallaxVerticalDirection", label: "Vertical direction", type: "select", metadataOnly: false },
    { id: "parallaxVerticalDistance", label: "Vertical distance", type: "number", metadataOnly: false },
  ]),
  group("pin", "Pin", [
    { id: "enabled", label: "Enabled", type: "toggle", metadataOnly: false },
    { id: "duration", label: "Duration", type: "number", metadataOnly: false },
  ]),
  group("reveal", "Reveal", COMMON_FIELDS),
  group("mouse", "Mouse", [
    { id: "follow", label: "Follow", type: "toggle", metadataOnly: false },
    { id: "strength", label: "Strength", type: "number", metadataOnly: false },
  ]),
  group("timeline", "Timeline", [
    { id: "name", label: "Name", type: "text", metadataOnly: false },
    { id: "sequence", label: "Sequence", type: "text", metadataOnly: false },
  ]),
] as const;

export function buildDefaultMotionMetadata() {
  return {
    runtimeExecution: true,
    metadataOnly: false,
    engine: "css",
    groups: MOTION_INSPECTOR_GROUPS.map((group) => group.id),
  };
}

function group(
  id: MotionInspectorGroup,
  label: string,
  fields: readonly MotionInspectorField[]
): MotionInspectorGroupMetadata {
  return { id, label, fields };
}
