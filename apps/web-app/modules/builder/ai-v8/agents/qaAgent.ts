import { scoreGeneratedExperience } from "../lib/experienceIntelligence";
import type { QAAgentOutput } from "./types";

export function runQAAgent({
  code,
  requiredSectionIds,
}: {
  code: string;
  requiredSectionIds: string[];
}): QAAgentOutput {
  return scoreGeneratedExperience(code, requiredSectionIds);
}
