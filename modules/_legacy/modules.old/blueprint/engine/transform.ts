// RFC-004 — Atomic Transform Engine

import { PageBlueprint, SectionBlueprint } from "../types";

export function addSection(
  page: PageBlueprint,
  section: SectionBlueprint
): PageBlueprint {
  // TODO (RFC-004 transform)
  return page;
}

export function updateProps(
  page: PageBlueprint,
  nodeId: string,
  props: Partial<SectionBlueprint["props"]>
): PageBlueprint {
  return page;
}

export function updateStyle(
  page: PageBlueprint,
  nodeId: string,
  style: Partial<SectionBlueprint["style"]>
): PageBlueprint {
  return page;
}

export function moveNode(
  page: PageBlueprint,
  nodeId: string,
  newParentId: string,
  newIndex: number
): PageBlueprint {
  return page;
}
