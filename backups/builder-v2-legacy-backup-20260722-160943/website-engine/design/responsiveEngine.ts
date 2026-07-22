import type { ResponsiveProfile } from "./designIntent";

export function buildResponsiveProfile(): ResponsiveProfile {
  return Object.freeze({
    mobile: ["primary action reachable", "type remains legible", "media does not obscure content"],
    tablet: ["preserve hierarchy", "avoid cramped card grids"],
    desktop: ["use available width for rhythm, not noise"],
  });
}
