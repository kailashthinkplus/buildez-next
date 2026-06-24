// MODULE 12: BLUEPRINT ENGINE — COMPONENT REGISTRY
// Central registry mapping blueprint section types to React components.
//
// This file controls:
// - Builder Canvas rendering
// - Preview Runtime
// - Public Runtime
// - Theme Marketplace component overrides
// - Custom theme components
// - Figma-imported components
// - AI preview rendering

import React from "react";

// Default BuildEZ Component Library
// (These components will exist inside the builder components directory)
import HeroSection from "../../app/(tenant)/components/blueprint/HeroSection";
import FeaturesSection from "../../app/(tenant)/components/blueprint/FeaturesSection";
import GallerySection from "../../app/(tenant)/components/blueprint/GallerySection";
import TestimonialsSection from "../../app/(tenant)/components/blueprint/TestimonialsSection";
import FAQSection from "../../app/(tenant)/components/blueprint/FAQSection";

// Fallback component for unknown types
function UnknownSection({ type }: { type: string }) {
  return (
    <div className="p-6 border rounded bg-red-50 text-red-700">
      Unknown section type: <strong>{type}</strong>
    </div>
  );
}

// -------------------------------------------
// REGISTRY MAP
// -------------------------------------------
const registry: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  features: FeaturesSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  faq: FAQSection
};

// -------------------------------------------
// GET COMPONENT BY TYPE
// -------------------------------------------
export function getComponentByType(type: string): React.ComponentType<any> {
  return registry[type] ?? UnknownSection;
}

// -------------------------------------------
// REGISTER CUSTOM COMPONENT (Themes, Plugins)
// -------------------------------------------
export function registerComponent(
  type: string,
  component: React.ComponentType<any>
) {
  registry[type] = component;
}

// -------------------------------------------
// LIST ALL REGISTERED COMPONENT TYPES
// For marketplace, debugging, admin UI
// -------------------------------------------
export function listRegisteredComponents(): string[] {
  return Object.keys(registry);
}

export default registry;
