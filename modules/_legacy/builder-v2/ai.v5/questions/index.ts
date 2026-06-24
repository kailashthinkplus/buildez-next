import { siteTypeQuestion } from "./siteType";
import { industryQuestion } from "./industry";
import { designLanguageQuestion } from "./designLanguage";
import { colorStrategyQuestion } from "./colorStrategy";
import { pagesQuestion } from "./pages";

export const AI_INTERVIEW_FLOW = [
  siteTypeQuestion,          // 🔒 STEP 0 — intent
  industryQuestion,
  designLanguageQuestion,
  colorStrategyQuestion,
  pagesQuestion,             // 🔒 used ONLY if multi-page
];
