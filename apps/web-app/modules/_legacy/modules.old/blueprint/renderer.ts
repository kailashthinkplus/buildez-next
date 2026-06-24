// MODULE 12: BLUEPRINT ENGINE — RENDERER
// Converts Blueprint JSON into React elements.
//
// Used in:
// - React Builder Canvas
// - AI Visual Diff Renderer
// - Runtime Preview (tenant)
// - Published Runtime (public)
// - Theme Marketplace Preview
// - Figma Import Preview

import React from "react";
import { getComponentByType } from "./registry";
import type { Blueprint, PageBlueprint, SectionBlueprint } from "./types";

// -------------------------------------------
// SAFE WRAPPER to prevent component crashes
// -------------------------------------------
function SafeRender({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (e: any) {
    return (
      <div className="p-4 border rounded bg-red-50 text-red-700">
        Render Error: {e.message}
      </div>
    );
  }
}

// -------------------------------------------
// RENDER A SINGLE SECTION
// -------------------------------------------
export function renderSection(section: SectionBlueprint) {
  const Component = getComponentByType(section.type);

  return (
    <SafeRender key={section.id}>
      <Component {...section.props} style={section.style} sectionId={section.id} />
    </SafeRender>
  );
}

// -------------------------------------------
// RENDER A FULL PAGE (Blueprint → React)
// -------------------------------------------
export function renderPage(page: PageBlueprint) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* PAGE HEADER HANDLER */}
      {/* In Module 13, we will connect this to the layout registry */}
      <header>{/* TODO: header renderer */}</header>

      {/* PAGE CONTENT */}
      <main
        className="flex flex-col w-full mx-auto"
        style={{ maxWidth: page.layout.containerWidth }}
      >
        {page.sections.map(renderSection)}
      </main>

      {/* PAGE FOOTER HANDLER */}
      <footer>{/* TODO: footer renderer */}</footer>
    </div>
  );
}

// -------------------------------------------
// RENDER FULL BLUEPRINT (first page only)
// For Builder Canvas + Preview Mode
// -------------------------------------------
export function renderBlueprint(blueprint: Blueprint) {
  const home = blueprint.pages["/"] ?? Object.values(blueprint.pages)[0];
  if (!home) {
    return (
      <div className="p-6 text-red-600">
        Error: Blueprint contains no pages.
      </div>
    );
  }

  return renderPage(home);
}
