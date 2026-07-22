import type { SectionCapabilities } from "./builderBlueprint";

/**
 * Builds section-level capabilities for generated section blueprints.
 *
 * @example
 * const capabilities = buildSectionCapabilities();
 */
export function buildSectionCapabilities(): SectionCapabilities {
  return Object.freeze({
    canEdit: true,
    canMove: true,
    canDuplicate: true,
    canDelete: true,
    canSwapLayout: true,
    canSwapPattern: true,
    canSwapComponentVariant: true,
    canRegenerateContent: true,
    canRegenerateMedia: true,
    canRegenerateDesign: true,
    canRegenerateMotion: true,
    canAddWidgets: true,
    canRemoveWidgets: true,
    canChangeBackground: true,
    canChangeSpacing: true,
    canChangeResponsiveLayout: true,
  });
}
