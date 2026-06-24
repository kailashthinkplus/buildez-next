import type { AIInterviewQuestion } from "./questionTypes";

export const pagesQuestion: AIInterviewQuestion = {
  id: "pages",
  type: "multi-select",
  title: "Which pages do you want to generate?",
  required: true,
  options: [
    { label: "Home", value: "home" },
    { label: "About", value: "about" },
    { label: "Services", value: "services" },
    { label: "Pricing", value: "pricing" },
    { label: "Contact", value: "contact" },
  ],
};
