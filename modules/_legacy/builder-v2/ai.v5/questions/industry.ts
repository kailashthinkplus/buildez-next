import type { AIInterviewQuestion } from "./questionTypes";

export const industryQuestion: AIInterviewQuestion = {
  id: "industry",
  type: "single-select",
  title: "Which industry best describes your website?",
  required: true,
  options: [
    { label: "SaaS / Software", value: "saas" },
    { label: "E-commerce", value: "ecommerce" },
    { label: "Agency / Services", value: "agency" },
    { label: "Portfolio / Personal", value: "portfolio" },
    { label: "Education", value: "education" },
    { label: "Other", value: "other" },
  ],
};
