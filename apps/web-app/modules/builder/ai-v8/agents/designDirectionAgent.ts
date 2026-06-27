import type {
  BrandContextWithName,
  DesignDirectionOutput,
  IntentAgentOutput,
} from "./types";

function readColor(
  brandContext: BrandContextWithName | null,
  key: string,
  fallback: string
) {
  const colors = brandContext?.designTokens?.colors as
    | Record<string, string>
    | undefined;
  return colors?.[key] || fallback;
}

export function runDesignDirectionAgent({
  intent,
  brandContext,
}: {
  intent: IntentAgentOutput;
  brandContext: BrandContextWithName | null;
}): DesignDirectionOutput {
  const styleDirection = Array.from(
    new Set([
      ...intent.plan.recipe.styleDirection,
      ...intent.plan.styleHints,
    ])
  );

  return {
    styleDirection,
    colorGuidance: {
      primary: readColor(brandContext, "primary", "choose a distinctive professional primary color"),
      accent: readColor(brandContext, "accent", "choose one restrained accent color"),
      background: readColor(brandContext, "background", "use a readable neutral background system"),
      textPrimary: readColor(brandContext, "textPrimary", "use high-contrast primary text"),
    },
    layoutPrinciples: [
      "Open with a memorable above-the-fold composition.",
      "Alternate layout density between sections.",
      "Use proof and practical details as visual content, not afterthought body copy.",
      "Keep CTAs visible, specific, and repeated at natural decision points.",
    ],
  };
}
