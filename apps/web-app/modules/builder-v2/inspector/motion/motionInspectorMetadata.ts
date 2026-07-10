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
  metadataOnly: true;
}>;

export type MotionInspectorGroupMetadata = Readonly<{
  id: MotionInspectorGroup;
  label: string;
  fields: readonly MotionInspectorField[];
}>;

const COMMON_FIELDS: readonly MotionInspectorField[] = [
  { id: "preset", label: "Preset", type: "select", metadataOnly: true },
  { id: "duration", label: "Duration", type: "number", metadataOnly: true },
  { id: "delay", label: "Delay", type: "number", metadataOnly: true },
  { id: "ease", label: "Ease", type: "select", metadataOnly: true },
];

export const MOTION_INSPECTOR_GROUPS: readonly MotionInspectorGroupMetadata[] = [
  group("entrance", "Entrance", COMMON_FIELDS),
  group("exit", "Exit", COMMON_FIELDS),
  group("hover", "Hover", [
    ...COMMON_FIELDS,
    { id: "trigger", label: "Trigger", type: "select", metadataOnly: true },
  ]),
  group("scroll", "Scroll", [
    ...COMMON_FIELDS,
    { id: "start", label: "Start", type: "text", metadataOnly: true },
    { id: "end", label: "End", type: "text", metadataOnly: true },
  ]),
  group("parallax", "Parallax", [
    { id: "speed", label: "Speed", type: "number", metadataOnly: true },
    { id: "axis", label: "Axis", type: "select", metadataOnly: true },
  ]),
  group("pin", "Pin", [
    { id: "enabled", label: "Enabled", type: "toggle", metadataOnly: true },
    { id: "duration", label: "Duration", type: "number", metadataOnly: true },
  ]),
  group("reveal", "Reveal", COMMON_FIELDS),
  group("mouse", "Mouse", [
    { id: "follow", label: "Follow", type: "toggle", metadataOnly: true },
    { id: "strength", label: "Strength", type: "number", metadataOnly: true },
  ]),
  group("timeline", "Timeline", [
    { id: "name", label: "Name", type: "text", metadataOnly: true },
    { id: "sequence", label: "Sequence", type: "text", metadataOnly: true },
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
