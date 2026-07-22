import type { BuilderBlueprint } from "../../types/blueprint";
import type { BrandResolution } from "./brandResolutionAgent";

export type AgentLog = {
  agent: string;
  stage: string;
  ok: boolean;
  summary: string;
  warnings?: string[];
};

export type V9Workflow = {
  prompt: string;
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  siteId: string;
  siteName?: string | null;
  designTokens?: Record<string, unknown> | null;
  brandContext?: Record<string, unknown> | null;
  brandResolution?: BrandResolution | null;
  research?: Record<string, unknown> | null;
  designBrief?: Record<string, unknown> | null;
  candidateDirective?: Record<string, unknown> | null;
  intent?: {
    industry: string;
    goal: string;
    audience: string;
    imageStyle: string;
  };
  blueprint?: BuilderBlueprint;
  logs: AgentLog[];
};
