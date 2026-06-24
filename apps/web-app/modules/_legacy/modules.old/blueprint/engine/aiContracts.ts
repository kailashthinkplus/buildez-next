// RFC-004 — AI Contract Definitions

export interface AIChange {
  sectionId: string;
  type: "update" | "replace" | "insertBefore" | "insertAfter";
  data: any;
}

export interface AIResponse {
  changes: AIChange[];
  images?: any[];
  warnings?: string[];
}
