import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

/* ============================================================
   SITE LAYOUT — V4 CANONICAL SCHEMA
============================================================ */

/**
 * Header & Footer are global blueprints
 * Shared across all pages of a site
 */
export interface SiteLayout {
  header: BlueprintNode | null;
  footer: BlueprintNode | null;
}
