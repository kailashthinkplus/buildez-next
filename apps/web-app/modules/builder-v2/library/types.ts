import type {
  BuilderBlueprint,
  BuilderNode,
  BuilderTheme,
  NodeType,
} from "../types/blueprint";
import type { ThemeTokenPatch } from "../theme/theme.types";

export type SectionCategory =
  | "hero"
  | "content"
  | "conversion"
  | "proof"
  | "navigation"
  | "footer";

export interface NodeSpec {
  type: NodeType;
  name?: string;
  props?: Record<string, unknown>;
  style?: BuilderNode["style"];
  children?: NodeSpec[];
}

export interface SectionInput {
  eyebrow?: string;
  headline?: string;
  body?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imagePrompt?: string;
  items?: Array<{
    title: string;
    body: string;
    icon?: string;
  }>;
}

export interface SectionDefinition {
  id: string;
  name: string;
  category: SectionCategory;
  description: string;
  tags: string[];
  allowedParents: NodeType[];
  aiContract: {
    purpose: string;
    requiredContent: Array<keyof SectionInput>;
    optionalContent: Array<keyof SectionInput>;
  };
  create(input?: SectionInput): NodeSpec;
}

export interface TemplateSectionRef {
  sectionId: string;
  input?: SectionInput;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  pageType: "home" | "about" | "services" | "landing" | "contact";
  description: string;
  sections: TemplateSectionRef[];
  themePatch?: ThemeTokenPatch;
}

export interface CreateTemplateBlueprintOptions {
  title?: string;
  templateId: string;
  theme: BuilderTheme;
}

export interface TemplateBlueprintResult {
  blueprint: BuilderBlueprint;
  template: TemplateDefinition;
}
