import type { AIInterviewAnswers } from "./aiAnswers.types";

export function validateAnswers(
  answers: AIInterviewAnswers
) {
  if (!answers.industry) throw new Error("Industry missing");
  if (!answers.designLanguage) throw new Error("Design language missing");
  if (!answers.colorStrategy) throw new Error("Color strategy missing");
  if (!answers.pages || answers.pages.length === 0)
    throw new Error("At least one page required");
}
