import type { AIInterviewQuestion } from "./questionTypes";

export const siteTypeQuestion: AIInterviewQuestion = {
  id: "siteType",
  type: "single-select",
  title: "What kind of website do you want to build?",
  required: true,
  options: [
    {
      label: "Single page (one scrolling page)",
      value: "single-page",
    },
    {
      label: "Multi-page website",
      value: "multi-page",
    },
  ],
};
