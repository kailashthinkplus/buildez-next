/**
 * Turns raw PlanFeature rows (internal flag keys like "v12.qa_tier" or
 * "storage_gb") into copy an end user can actually read. Shared by the
 * onboarding plan step and the dashboard plans page so both surfaces
 * show the same wording, in the same order.
 */

export type RawPlanFeature = { key: string; value: string; type: string };

export type FormattedPlanFeature = {
  /** Stable id shared across plans for the same underlying capability — used to align rows in a comparison table. */
  groupKey: string;
  /** Row header for a comparison table, e.g. "Storage". */
  groupLabel: string;
  /** This plan's value for that capability, e.g. "100 GB" or "Included". */
  value: string;
  /** Whether this plan actually has the capability (false = show a cross, not a bullet). */
  included: boolean;
  /** Lower sorts first — the handful of genuinely differentiating capabilities lead. */
  priority: number;
};

/**
 * Internal engineering knobs that are either identical across every
 * plan today (no differentiating value to a buyer) or meaningless
 * without implementation context (a raw retry count, an internal QA/
 * context sizing tier). Never shown to customers, in the card or the
 * full comparison table.
 */
const HIDDEN_KEYS = new Set([
  "v12.max_concurrency",
  "v12.context_tier",
  "v12.qa_tier",
  "v12.max_auto_repairs",
]);

type KeyDefinition = {
  groupLabel: string;
  priority: number;
  /** Formats this plan's value into display copy. Defaults to the group label for a plain boolean. */
  format?: (value: string) => string;
};

const KEY_DEFINITIONS: Record<string, KeyDefinition> = {
  ai_builder: { groupLabel: "AI website builder", priority: 0 },
  "v12.allow_multipage": { groupLabel: "Multi-page websites", priority: 1 },
  "v12.allow_images": { groupLabel: "AI-generated images", priority: 2 },
  "v12.allow_video": { groupLabel: "AI-generated video", priority: 3 },
  "v12.allow_3d": { groupLabel: "Immersive 3D & cinematic experiences", priority: 4 },
  "v12.allow_figma": { groupLabel: "Import designs from Figma", priority: 5 },
  "v12.allow_design_references": { groupLabel: "Design reference uploads", priority: 6 },
  custom_domain: { groupLabel: "Connect a custom domain", priority: 7 },
  ssl: { groupLabel: "Free SSL certificate", priority: 8 },
  analytics: { groupLabel: "Built-in analytics", priority: 9 },
  forms: { groupLabel: "Custom forms", priority: 10 },
  blog: { groupLabel: "Blog", priority: 11 },
  team: { groupLabel: "Team collaboration", priority: 12 },
  api: { groupLabel: "API access", priority: 13 },
  white_label: { groupLabel: "White-label branding", priority: 14 },
  agency_workspace: { groupLabel: "Agency workspace", priority: 15 },
  priority_support: { groupLabel: "Priority support", priority: 16 },
  dedicated_support: { groupLabel: "Dedicated account manager", priority: 17 },
  custom_limits: { groupLabel: "Custom usage limits", priority: 18 },
  everything: { groupLabel: "Everything, unlocked", priority: 19 },
  // storage_gb is seeded with type "boolean" even though its value is a
  // number of gigabytes — a data bug in the seed, not something this
  // formatter should have to assume is fixed.
  storage_gb: {
    groupLabel: "Storage",
    priority: 20,
    format: (value) => {
      const gb = Number.parseFloat(value);
      return Number.isFinite(gb) ? `${gb.toLocaleString()} GB storage` : "Storage included";
    },
  },
};

function fallbackDefinition(key: string): KeyDefinition {
  const label = key
    .replace(/^v12\./, "")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { groupLabel: label, priority: 99 };
}

/** Formats one plan's raw features into display-ready rows, sorted so the most differentiating capabilities lead. */
export function formatPlanFeatures(rawFeatures: readonly RawPlanFeature[]): FormattedPlanFeature[] {
  return rawFeatures
    .filter((feature) => !HIDDEN_KEYS.has(feature.key))
    .map((feature) => {
      const definition = KEY_DEFINITIONS[feature.key] ?? fallbackDefinition(feature.key);
      const included = feature.type !== "boolean" || feature.value === "true";
      const value = definition.format
        ? definition.format(feature.value)
        : feature.type === "boolean"
          ? definition.groupLabel
          : `${definition.groupLabel}: ${feature.value}`;
      return {
        groupKey: feature.key,
        groupLabel: definition.groupLabel,
        value,
        included,
        priority: definition.priority,
      };
    })
    .sort((left, right) => left.priority - right.priority);
}
