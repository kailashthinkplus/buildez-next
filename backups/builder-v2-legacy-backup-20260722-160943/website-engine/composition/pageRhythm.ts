import type { CompositionFamilyContext, CompositionInput, PageRhythm } from "./compositionPlan";

export function inferPageRhythm(input: CompositionInput, context: CompositionFamilyContext): PageRhythm {
  if (input.artDirectionBrief) return Object.freeze({ rhythm: input.artDirectionBrief.compositionStrategy.rhythm, notes: [`Directed by ${input.artDirectionBrief.id}.`] });
  if (context.family === "healthcare") return Object.freeze({ rhythm: "trust-first", notes: ["trust and clarity before appointment pressure"] });
  if (context.family === "real_estate" || context.family === "hospitality") return Object.freeze({ rhythm: "editorial", notes: ["promise, place, proof, gallery, conversion"] });
  if (context.family === "education") return Object.freeze({ rhythm: "guided", notes: ["program clarity before admissions CTA"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ rhythm: "commerce", notes: ["product value and proof before purchase action"] });
  if (input.experienceStrategy?.scrollNarrative.length) return Object.freeze({ rhythm: "guided", notes: input.experienceStrategy.scrollNarrative });
  return Object.freeze({ rhythm: "direct", notes: ["clear orientation, proof, action"] });
}
