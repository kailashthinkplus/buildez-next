// RFC-004 — Blueprint Deserializer

import { PageBlueprint } from "../types";

export function deserialize(str: string): PageBlueprint {
  return JSON.parse(str);
}
