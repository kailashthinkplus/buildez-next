import { AIResponse, AIChange } from "./aiTypes";

export function mapAIResponseToChanges(res: AIResponse): AIChange[] {
  return res.changes;
}
