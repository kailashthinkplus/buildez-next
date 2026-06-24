import type { AIInterviewQuestion } from "./questionTypes";

export const colorStrategyQuestion: AIInterviewQuestion = {
  id: "colorStrategy",
  type: "single-select",
  title: "How should we choose your colors?",
  required: true,
  options: [
    { label: "Extract from logo automatically", value: "logo-auto" },
    { label: "I will choose manually", value: "manual" },
    { label: "AI suggested + editable", value: "hybrid" },
  ],
};
