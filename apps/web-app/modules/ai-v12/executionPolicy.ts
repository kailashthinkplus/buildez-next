export type V12ModelTier =
  | "FRONTIER"
  | "ECONOMY"
  | "VISION"
  | "IMAGE";

export type V12QaTier =
  | "BASIC"
  | "STANDARD"
  | "ADVANCED";

export type V12ContextTier =
  | "LIMITED"
  | "STANDARD"
  | "EXTENDED";

export type V12ExecutionPolicy = {
  planCode: string;

  frontierGeneration: true;

  models: {
    design: string;
    implementation: string;
    vision: string;
    economy: string;
    image: string;
  };

  maxAutomaticRepairs: number;
  maxConcurrentGenerations: number;

  allowMultiPage: boolean;
  allowGeneratedImages: boolean;
  allowVideo: boolean;
  allow3D: boolean;
  allowFigma: boolean;
  allowDesignReferences: boolean;

  qaTier: V12QaTier;
  contextTier: V12ContextTier;
};

function normalizePlanCode(
  value?: string | null,
): string {
  return String(value || "FREE")
    .trim()
    .toUpperCase();
}

/**
 * Central model aliases.
 *
 * Product plans should NEVER contain concrete OpenAI model IDs.
 * This allows BuildEZ to switch providers/models without changing
 * subscription definitions.
 */
export function resolveV12Models() {
  const frontier =
    process.env.OPENAI_V12_FRONTIER_MODEL ||
    process.env.OPENAI_V12_MODEL ||
    "gpt-5.6-sol";

  const economy =
    process.env.OPENAI_V12_ECONOMY_MODEL ||
    frontier;

  const vision =
    process.env.OPENAI_V12_VISION_MODEL ||
    frontier;

  const image =
    process.env.OPENAI_V12_IMAGE_MODEL ||
    process.env.OPENAI_V10_IMAGE_MODEL ||
    "gpt-image-2";

  return {
    design: frontier,
    implementation: frontier,
    vision,
    economy,
    image,
  };
}

/**
 * Every plan gets frontier-quality initial website generation.
 *
 * Plans differ by:
 * - repair depth
 * - concurrency
 * - context
 * - QA
 * - advanced media/tool access
 *
 * They do NOT differ by deliberately lowering initial output quality.
 */

export type V12PlanFeatureInput = {
  key: string;
  value: string;
  type?: string | null;
};

function featureMap(
  features?: readonly V12PlanFeatureInput[] | null,
) {
  return new Map(
    (features || []).map((feature) => [
      String(feature.key || "").trim().toLowerCase(),
      feature,
    ]),
  );
}

function featureBoolean(
  features: Map<string, V12PlanFeatureInput>,
  key: string,
  fallback: boolean,
) {
  const feature = features.get(key.toLowerCase());

  if (!feature) return fallback;

  const value = String(feature.value || "")
    .trim()
    .toLowerCase();

  if (
    value === "true" ||
    value === "1" ||
    value === "yes" ||
    value === "enabled" ||
    value === "on"
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "0" ||
    value === "no" ||
    value === "disabled" ||
    value === "off"
  ) {
    return false;
  }

  return fallback;
}

function featureInteger(
  features: Map<string, V12PlanFeatureInput>,
  key: string,
  fallback: number,
  minimum = 0,
  maximum = 100,
) {
  const feature = features.get(key.toLowerCase());

  if (!feature) return fallback;

  const value = Number.parseInt(
    String(feature.value || ""),
    10,
  );

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function featureQaTier(
  features: Map<string, V12PlanFeatureInput>,
): V12QaTier {
  const value = String(
    features.get("v12.qa_tier")?.value || "",
  )
    .trim()
    .toUpperCase();

  if (
    value === "BASIC" ||
    value === "STANDARD" ||
    value === "ADVANCED"
  ) {
    return value;
  }

  return "BASIC";
}

function featureContextTier(
  features: Map<string, V12PlanFeatureInput>,
): V12ContextTier {
  const value = String(
    features.get("v12.context_tier")?.value || "",
  )
    .trim()
    .toUpperCase();

  if (
    value === "LIMITED" ||
    value === "STANDARD" ||
    value === "EXTENDED"
  ) {
    return value;
  }

  return "LIMITED";
}

/**
 * Resolve V12 execution capabilities from Superadmin-managed
 * PlanFeature records.
 *
 * IMPORTANT:
 * - Plan names/codes have NO behavioural meaning here.
 * - Concrete provider/model IDs remain infrastructure-controlled.
 * - Missing features use conservative capability defaults.
 * - Initial generation remains frontier quality for all plans.
 */
export function resolveV12ExecutionPolicy(
  planCode?: string | null,
  planFeatures?: readonly V12PlanFeatureInput[] | null,
): V12ExecutionPolicy {
  const normalized =
    normalizePlanCode(planCode);

  const features =
    featureMap(planFeatures);

  const models =
    resolveV12Models();

  return {
    planCode: normalized,

    /*
     * All plans retain frontier-quality initial generation.
     * Commercial differentiation happens through credits,
     * retries, concurrency and advanced capabilities.
     */
    frontierGeneration: true,

    models,

    maxAutomaticRepairs:
      featureInteger(
        features,
        "v12.max_auto_repairs",
        0,
        0,
        10,
      ),

    maxConcurrentGenerations:
      featureInteger(
        features,
        "v12.max_concurrency",
        1,
        1,
        20,
      ),

    /*
     * Multi-page and generated images remain enabled by default
     * so an incomplete Superadmin configuration cannot silently
     * regress the core BuildEZ website-generation experience.
     *
     * Superadmin can explicitly disable either capability.
     */
    allowMultiPage:
      featureBoolean(
        features,
        "v12.allow_multipage",
        true,
      ),

    allowGeneratedImages:
      featureBoolean(
        features,
        "v12.allow_images",
        true,
      ),

    allowVideo:
      featureBoolean(
        features,
        "v12.allow_video",
        false,
      ),

    allow3D:
      featureBoolean(
        features,
        "v12.allow_3d",
        false,
      ),

    allowFigma:
      featureBoolean(
        features,
        "v12.allow_figma",
        false,
      ),

    allowDesignReferences:
      featureBoolean(
        features,
        "v12.allow_design_references",
        true,
      ),

    qaTier:
      featureQaTier(features),

    contextTier:
      featureContextTier(features),
  };
}
