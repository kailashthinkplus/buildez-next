import { inferIconNeeds } from "./iconNeeds";
import { inferImageNeeds } from "./imageNeeds";
import { inferMapNeeds } from "./mapNeeds";
import type { MediaFamilyContext, MediaInput, MediaNeed } from "./mediaStrategy";
import { inferThreeDNeeds } from "./threeDNeeds";
import { inferVideoNeeds } from "./videoNeeds";

/**
 * Infers all media needs.
 *
 * @example
 * const needs = inferMediaNeeds(input, context);
 */
export function inferMediaNeeds(input: MediaInput, context: MediaFamilyContext): MediaNeed[] {
  return Object.freeze([
    ...inferImageNeeds(input, context),
    ...inferVideoNeeds(input, context),
    ...inferIconNeeds(input, context),
    ...inferMapNeeds(input, context),
    ...inferThreeDNeeds(input, context),
  ]);
}
