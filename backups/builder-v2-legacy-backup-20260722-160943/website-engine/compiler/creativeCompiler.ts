import type { CompilerInput, CompiledCreativeDirection, CompiledMediaIntent, CompiledMotionIntent } from "./compiledPlan";

export function compileMediaIntent(input: CompilerInput): CompiledMediaIntent {
  return Object.freeze({
    requiredImages: input.mediaStrategy?.requiredImages.map((item) => item.label) ?? [],
    requiredVideos: input.mediaStrategy?.requiredVideos.map((item) => item.label) ?? [],
    maps: input.mediaStrategy?.maps.map((item) => item.label) ?? [],
    readiness: input.mediaStrategy?.assetReadiness.score ?? 0,
    truthRules: input.mediaStrategy?.truthPolicy.rules ?? [],
    missingAssets: input.mediaStrategy?.missingAssets ?? [],
  });
}

export function compileMotionIntent(input: CompilerInput): CompiledMotionIntent {
  return Object.freeze({
    language: input.motionStrategy?.motionLanguage ?? "unspecified",
    parallax: input.motionStrategy?.parallaxStrategy.level ?? "unspecified",
    reveal: input.motionStrategy?.revealStrategy.primary ?? "unspecified",
    reducedMotion: input.motionStrategy?.reducedMotion.strategy ?? "required",
    notes: input.motionStrategy?.accessibilityNotes ?? [],
  });
}

export function compileCreativeDirection(input: CompilerInput): CompiledCreativeDirection {
  return Object.freeze({
    inspiration: input.inspirationProfile?.selectedInspirationCategories ?? [],
    visualMood: [
      ...(input.visualMoodProfile ? [input.visualMoodProfile.primaryEmotion, input.visualMoodProfile.lighting.kind, input.visualMoodProfile.imageStyle.primary] : []),
    ],
    media: compileMediaIntent(input),
    motion: compileMotionIntent(input),
    providerNotes: ["Providers remain optional metadata only; no execution during compile."],
  });
}
