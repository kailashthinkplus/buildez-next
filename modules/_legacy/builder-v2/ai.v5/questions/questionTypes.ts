export type QuestionType =
  | "single-select"
  | "multi-select"
  | "text"
  | "color"
  | "file";

export interface AIInterviewQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: {
    label: string;
    value: string;
    meta?: Record<string, any>;
  }[];
}
