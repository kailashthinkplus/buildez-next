import type { AIInterviewQuestion } from "./questionTypes";

export const designLanguageQuestion: AIInterviewQuestion = {
  id: "designLanguage",
  type: "single-select",
  title: "What design style do you prefer?",
  required: true,
  options: [
    { label: "Minimal", value: "minimal" },
    { label: "Modern", value: "modern" },
    { label: "Brand-focused", value: "branding" },
    { label: "Marketing-heavy", value: "marketing" },
    { label: "Elegant / Sophisticated", value: "sophisticated" },
  ],
};
