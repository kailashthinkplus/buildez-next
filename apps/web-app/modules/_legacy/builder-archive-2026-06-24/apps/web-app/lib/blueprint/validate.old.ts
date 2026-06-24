import { blueprintSchema } from "@/modules/blueprint/schema";

/**
 * Validates incoming blueprint using the
 * central Zod blueprintSchema (V3 engine).
 */
export function validateBlueprint(input: any) {
  const result = blueprintSchema.safeParse(input);

  if (!result.success) {
    console.error("❌ Blueprint validation error:", result.error.flatten());
    throw new Error("INVALID_BLUEPRINT");
  }

  return result.data;
}
