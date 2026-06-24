export interface AIChange {
  sectionId: string;
  type: "update" | "replace" | "insertBefore" | "insertAfter";
  data: any;
}

export interface AIResponse {
  changes: AIChange[];
  images?: Array<{ prompt: string; url: string }>;
  warnings?: string[];
}

export interface AIMsg {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AISession {
  id: string;
  pageId: string;
  startedAt: number;
  messages: AIMsg[];
}
