import { componentVariants } from "./componentVariants";
import type { ComponentVariant } from "../types";
import type { WebsiteSectionSpec } from "../../specification";

export function findComponentVariant(section: WebsiteSectionSpec): ComponentVariant {
  const preferred = section.componentPreferences
    .map((id) => componentVariants.find((variant) => variant.id === id))
    .find(Boolean);

  if (preferred) return preferred;

  return (
    componentVariants.find((variant) => variant.role === section.role) ||
    componentVariants[0]
  );
}

export function listComponentVariants() {
  return componentVariants;
}
