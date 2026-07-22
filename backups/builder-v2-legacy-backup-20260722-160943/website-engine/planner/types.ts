export type WebsiteIndustry =
  | "real-estate"
  | "healthcare"
  | "hospitality"
  | "ecommerce"
  | "saas"
  | "education"
  | "legal"
  | "finance"
  | "portfolio"
  | "professional-services"
  | "unknown";

export type WebsiteGoal =
  | "lead-generation"
  | "appointment-booking"
  | "sales"
  | "reservation"
  | "portfolio-enquiry"
  | "information";

export type WebsiteIntentClassification = {
  industry: WebsiteIndustry;
  subIndustry?: string;
  businessType: string;
  archetype: string;
  primaryGoal: WebsiteGoal;
  secondaryGoals: WebsiteGoal[];
  targetAudience: string;
  buyerJourney: string[];
  conversionFunnel: string[];
  locationAwareness?: string;
  trustSignals: string[];
  brandPersonality: string[];
  tone: string;
  visualDirection: string;
  expectedDeliverable: string;
  confidence: number;
  evidence: string[];
  missingContext: string[];
};

export type IntentClassifierInput = {
  prompt: string;
  pageTitle?: string;
  siteName?: string | null;
  context?: Record<string, unknown> | null;
};
