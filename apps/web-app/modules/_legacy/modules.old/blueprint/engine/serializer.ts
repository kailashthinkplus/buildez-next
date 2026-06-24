// RFC-004 — Blueprint Serializer

import { PageBlueprint } from "../types";

export function serialize(page: PageBlueprint): string {
  return JSON.stringify(page);
}
