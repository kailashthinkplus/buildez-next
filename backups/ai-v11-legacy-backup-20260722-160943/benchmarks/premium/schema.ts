export const PREMIUM_CATEGORIES = [
  "luxury-real-estate",
  "architecture-studio",
  "ai-saas",
  "fintech",
  "hospitality-resort",
  "automotive",
  "fashion-editorial",
  "creative-agency",
  "healthcare-clinic",
  "luxury-ecommerce",
] as const;
export type PremiumCategory = (typeof PREMIUM_CATEGORIES)[number];
export type ApprovalState =
  "authored-candidate" | "approved-gold-standard" | "rejected-design";
export type PremiumApproval = Readonly<{
  state: ApprovalState;
  approvedAsGoldStandard: boolean;
  approvedBy: string | null;
  approvalDate: string | null;
  notes: string;
  knownCompromises: readonly string[];
}>;
export type PremiumFixture = Readonly<{
  fixtureId: string;
  industry: string;
  category: PremiumCategory;
  designGrammar: string;
  sourceFile: string;
  asset: string;
  approval: PremiumApproval;
}>;
