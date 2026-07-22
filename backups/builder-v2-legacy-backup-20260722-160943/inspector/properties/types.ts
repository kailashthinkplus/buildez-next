import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";

export interface PropertyComponentProps {
  node: BuilderNode;
  definition: WidgetProperty;
}