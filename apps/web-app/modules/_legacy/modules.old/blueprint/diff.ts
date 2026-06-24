// MODULE 12: BLUEPRINT ENGINE — DIFF ENGINE
// This file computes differences between two Blueprint objects.
// Used by:
// - AI Engine (Module 14)
// - Builder Undo/Redo
// - Version History (Module 26)
// - Theme switching
// - Figma import
// - Autopilot improvements

import type {
  Blueprint,
  PageBlueprint,
  SectionBlueprint,
  SiteTokens
} from "./types";

export interface DiffEntry {
  path: string;
  from?: any;
  to?: any;
}

export interface DiffResult {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffEntry[];
}

// -------------------------------------------
// UTILITY: Deep comparison
// -------------------------------------------
function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// -------------------------------------------
// DIFF TOKENS
// -------------------------------------------
export function diffTokens(
  oldTokens: SiteTokens,
  newTokens: SiteTokens
): DiffResult {
  const result: DiffResult = { added: [], removed: [], changed: [] };

  const keys = new Set([
    ...Object.keys(oldTokens),
    ...Object.keys(newTokens)
  ]);

  for (const key of keys) {
    if (!(key in oldTokens)) {
      result.added.push({ path: `tokens.${key}`, to: newTokens[key] });
    } else if (!(key in newTokens)) {
      result.removed.push({ path: `tokens.${key}`, from: oldTokens[key] });
    } else if (!deepEqual(oldTokens[key], newTokens[key])) {
      result.changed.push({
        path: `tokens.${key}`,
        from: oldTokens[key],
        to: newTokens[key]
      });
    }
  }

  return result;
}

// -------------------------------------------
// DIFF SECTIONS
// -------------------------------------------
export function diffSections(
  oldSections: SectionBlueprint[],
  newSections: SectionBlueprint[],
  parentPath = "sections"
): DiffResult {
  const result: DiffResult = { added: [], removed: [], changed: [] };

  const oldMap = new Map(oldSections.map((s) => [s.id, s]));
  const newMap = new Map(newSections.map((s) => [s.id, s]));

  // Detect removed
  for (const [id, section] of oldMap.entries()) {
    if (!newMap.has(id)) {
      result.removed.push({
        path: `${parentPath}.${id}`,
        from: section
      });
    }
  }

  // Detect added & changed
  for (const [id, newSec] of newMap.entries()) {
    const oldSec = oldMap.get(id);
    if (!oldSec) {
      result.added.push({
        path: `${parentPath}.${id}`,
        to: newSec
      });
    } else if (!deepEqual(oldSec, newSec)) {
      result.changed.push({
        path: `${parentPath}.${id}`,
        from: oldSec,
        to: newSec
      });
    }
  }

  return result;
}

// -------------------------------------------
// DIFF PAGES
// -------------------------------------------
export function diffPage(
  oldPage: PageBlueprint,
  newPage: PageBlueprint
): DiffResult {
  const result: DiffResult = { added: [], removed: [], changed: [] };

  // Compare simple fields
  const simpleFields: (keyof PageBlueprint)[] = ["name", "path"];

  for (const key of simpleFields) {
    if (!deepEqual(oldPage[key], newPage[key])) {
      result.changed.push({
        path: `${key}`,
        from: oldPage[key],
        to: newPage[key]
      });
    }
  }

  // Compare SEO
  if (!deepEqual(oldPage.seo, newPage.seo)) {
    result.changed.push({
      path: "seo",
      from: oldPage.seo,
      to: newPage.seo
    });
  }

  // Compare Layout
  if (!deepEqual(oldPage.layout, newPage.layout)) {
    result.changed.push({
      path: "layout",
      from: oldPage.layout,
      to: newPage.layout
    });
  }

  // Compare sections (deep)
  const sectionDiff = diffSections(oldPage.sections, newPage.sections);
  result.added.push(...sectionDiff.added);
  result.removed.push(...sectionDiff.removed);
  result.changed.push(...sectionDiff.changed);

  return result;
}

// -------------------------------------------
// DIFF FULL BLUEPRINT
// -------------------------------------------
export function diffBlueprint(
  oldBp: Blueprint,
  newBp: Blueprint
): DiffResult {
  const result: DiffResult = { added: [], removed: [], changed: [] };

  // Version changed
  if (oldBp.blueprintVersion !== newBp.blueprintVersion) {
    result.changed.push({
      path: "blueprintVersion",
      from: oldBp.blueprintVersion,
      to: newBp.blueprintVersion
    });
  }

  // Site tokens
  const tokenDiff = diffTokens(oldBp.site.tokens, newBp.site.tokens);
  result.added.push(...tokenDiff.added);
  result.removed.push(...tokenDiff.removed);
  result.changed.push(...tokenDiff.changed);

  // Pages
  const oldPages = oldBp.pages;
  const newPages = newBp.pages;

  const pageKeys = new Set([...Object.keys(oldPages), ...Object.keys(newPages)]);

  for (const key of pageKeys) {
    if (!(key in oldPages)) {
      result.added.push({
        path: `pages.${key}`,
        to: newPages[key]
      });
    } else if (!(key in newPages)) {
      result.removed.push({
        path: `pages.${key}`,
        from: oldPages[key]
      });
    } else {
      const diff = diffPage(oldPages[key], newPages[key]);
      result.added.push(...diff.added.map((d) => ({ ...d, path: `pages.${key}.${d.path}` })));
      result.removed.push(...diff.removed.map((d) => ({ ...d, path: `pages.${key}.${d.path}` })));
      result.changed.push(...diff.changed.map((d) => ({ ...d, path: `pages.${key}.${d.path}` })));
    }
  }

  return result;
}
