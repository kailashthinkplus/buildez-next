// modules/builder/utils/createId.ts

import { randomUUID } from "crypto";

/**
 * Canonical ID generator for Builder & AI engines
 * - Collision-safe
 * - Node / Edge compatible
 * - Stable string format
 */
export function createId(prefix = "node"): string {
  return `${prefix}_${randomUUID()}`;
}
