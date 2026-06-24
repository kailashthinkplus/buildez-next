// MODULE 12: BLUEPRINT ENGINE — TRANSFORM ENGINE
// Atomic, safe blueprint operations used by:
// - AI Engine (Module 14)
// - React Builder (Module 13)
// - Figma → Blueprint Importer (Module 16)
// - Theme Marketplace (Module 15)
// - Autopilot (Module 27)
// - Collaboration / Versioning

import type {
  Blueprint,
  PageBlueprint,
  SectionBlueprint,
  SiteTokens
} from "./types";
import { v4 as uuid } from "uuid";

// -------------------------------------------
// Utility Helpers
// -------------------------------------------
export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function findPage(bp: Blueprint, path: string): PageBlueprint {
  const page = bp.pages[path];
  if (!page) throw new Error(`Page not found: ${path}`);
  return page;
}

export function findSection(page: PageBlueprint, sectionId: string): SectionBlueprint {
  const section = page.sections.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Section not found: ${sectionId}`);
  return section;
}

// -------------------------------------------
// OPERATION: Add a new section
// -------------------------------------------
export function addSection(
  blueprint: Blueprint,
  pagePath: string,
  newSection: Omit<SectionBlueprint, "id">
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  page.sections.push({
    ...newSection,
    id: uuid()
  });

  return bp;
}

// -------------------------------------------
// OPERATION: Insert section before another
// -------------------------------------------
export function insertSectionBefore(
  blueprint: Blueprint,
  pagePath: string,
  targetSectionId: string,
  newSection: Omit<SectionBlueprint, "id">
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  const index = page.sections.findIndex((s) => s.id === targetSectionId);
  if (index === -1) throw new Error(`Target section not found: ${targetSectionId}`);

  page.sections.splice(index, 0, { ...newSection, id: uuid() });
  return bp;
}

// -------------------------------------------
// OPERATION: Insert section after another
// -------------------------------------------
export function insertSectionAfter(
  blueprint: Blueprint,
  pagePath: string,
  targetSectionId: string,
  newSection: Omit<SectionBlueprint, "id">
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  const index = page.sections.findIndex((s) => s.id === targetSectionId);
  if (index === -1) throw new Error(`Target section not found: ${targetSectionId}`);

  page.sections.splice(index + 1, 0, { ...newSection, id: uuid() });
  return bp;
}

// -------------------------------------------
// OPERATION: Remove a section
// -------------------------------------------
export function removeSection(
  blueprint: Blueprint,
  pagePath: string,
  sectionId: string
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  page.sections = page.sections.filter((s) => s.id !== sectionId);
  return bp;
}

// -------------------------------------------
// OPERATION: Clone a section
// -------------------------------------------
export function cloneSection(
  blueprint: Blueprint,
  pagePath: string,
  sectionId: string
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);
  const section = findSection(page, sectionId);

  const newSection = clone(section);
  newSection.id = uuid();

  const index = page.sections.findIndex((s) => s.id === sectionId);
  page.sections.splice(index + 1, 0, newSection);

  return bp;
}

// -------------------------------------------
// OPERATION: Update section props
// -------------------------------------------
export function updateSectionProps(
  blueprint: Blueprint,
  pagePath: string,
  sectionId: string,
  newProps: Record<string, any>
): Blueprint {
  const bp = clone(blueprint);
  const section = findSection(findPage(bp, pagePath), sectionId);

  section.props = { ...section.props, ...newProps };
  return bp;
}

// -------------------------------------------
// OPERATION: Replace section variant
// (Used by AI: "make this hero split layout instead")
// -------------------------------------------
export function replaceSectionVariant(
  blueprint: Blueprint,
  pagePath: string,
  sectionId: string,
  newVariant: string
): Blueprint {
  const bp = clone(blueprint);
  const section = findSection(findPage(bp, pagePath), sectionId);

  section.variant = newVariant;
  return bp;
}

// -------------------------------------------
// OPERATION: Update theme tokens
// -------------------------------------------
export function updateTokens(
  blueprint: Blueprint,
  newTokens: Partial<SiteTokens>
): Blueprint {
  const bp = clone(blueprint);
  bp.site.tokens = { ...bp.site.tokens, ...newTokens };
  return bp;
}

// -------------------------------------------
// OPERATION: Reorder sections (drag & drop)
// -------------------------------------------
export function reorderSections(
  blueprint: Blueprint,
  pagePath: string,
  fromIndex: number,
  toIndex: number
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  const sections = page.sections;
  const section = sections.splice(fromIndex, 1)[0];
  sections.splice(toIndex, 0, section);

  return bp;
}

// -------------------------------------------
// OPERATION: Update SEO
// -------------------------------------------
export function updateSEO(
  blueprint: Blueprint,
  pagePath: string,
  newSEO: Partial<PageBlueprint["seo"]>
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  page.seo = { ...page.seo, ...newSEO };
  return bp;
}

// -------------------------------------------
// OPERATION: Replace entire section
// (Used by AI progression steps)
// -------------------------------------------
export function replaceSection(
  blueprint: Blueprint,
  pagePath: string,
  sectionId: string,
  newSection: SectionBlueprint
): Blueprint {
  const bp = clone(blueprint);
  const page = findPage(bp, pagePath);

  const idx = page.sections.findIndex((s) => s.id === sectionId);
  if (idx === -1) throw new Error(`Section not found: ${sectionId}`);

  page.sections[idx] = { ...newSection, id: sectionId };
  return bp;
}

// -------------------------------------------
// OPERATION: Regenerate section (AI-level)
// This clears props so AI re-generates them
// -------------------------------------------
export function regenerateSection(
  blueprint: Blueprint,
  pagePath: string,
  sectionId: string
): Blueprint {
  const bp = clone(blueprint);
  const section = findSection(findPage(bp, pagePath), sectionId);

  section.props = {}; // AI will re-populate
  return bp;
}
