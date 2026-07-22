import type { SemanticRecipe, SemanticRecipeName, SemanticSection } from "./types";
import { HeroRecipe } from "./HeroRecipe";
import { AboutRecipe } from "./AboutRecipe";
import { FeatureGridRecipe } from "./FeatureGridRecipe";
import { ServicesRecipe } from "./ServicesRecipe";
import { PricingRecipe } from "./PricingRecipe";
import { ComparisonRecipe } from "./ComparisonRecipe";
import { GalleryRecipe } from "./GalleryRecipe";
import { PortfolioRecipe } from "./PortfolioRecipe";
import { TimelineRecipe } from "./TimelineRecipe";
import { TestimonialsRecipe } from "./TestimonialsRecipe";
import { FAQRecipe } from "./FAQRecipe";
import { StatsRecipe } from "./StatsRecipe";
import { CTARecipe } from "./CTARecipe";
import { ContactRecipe } from "./ContactRecipe";
import { FooterRecipe } from "./FooterRecipe";

const recipes: Record<SemanticRecipeName, SemanticRecipe> = {
  hero: HeroRecipe, about: AboutRecipe, "feature-grid": FeatureGridRecipe, services: ServicesRecipe,
  pricing: PricingRecipe, comparison: ComparisonRecipe, gallery: GalleryRecipe, portfolio: PortfolioRecipe,
  timeline: TimelineRecipe, testimonials: TestimonialsRecipe, faq: FAQRecipe, stats: StatsRecipe,
  cta: CTARecipe, contact: ContactRecipe, footer: FooterRecipe,
};

const matchers: Array<[SemanticRecipeName, RegExp]> = [
  ["hero", /\b(hero|masthead|banner)\b/], ["about", /\b(about|story|practice|developer|introduction)\b/],
  ["pricing", /\b(pricing|plans?|packages?)\b/], ["comparison", /\b(comparison|compare|versus|table)\b/],
  ["gallery", /\b(gallery|media|amenit|visual)\b/], ["portfolio", /\b(portfolio|project|catalogue|showcase|residence|work)\b/],
  ["timeline", /\b(timeline|process|steps?|journey|history)\b/], ["testimonials", /\b(testimonial|reviews?|stories|social.proof)\b/],
  ["faq", /\b(faq|questions?|answers?)\b/], ["stats", /\b(stats?|metrics?|numbers?|trust.band|proof)\b/],
  ["contact", /\b(contact|appointment|booking|form|enquiry|inquiry|map)\b/], ["footer", /\bfooter\b/],
  ["cta", /\b(cta|conversion|call.to.action|sticky.action)\b/], ["services", /\b(service|offering|product|feature)\b/],
];

export class RecipeRegistry {
  static resolve(section: SemanticSection): { name: SemanticRecipeName; recipe: SemanticRecipe } {
    const corpus = [section.type, section.purpose, section.componentCategory, section.componentVariantId, ...section.patternIds].filter(Boolean).join(" ").toLowerCase();
    const name = matchers.find(([, matcher]) => matcher.test(corpus))?.[0] ?? "feature-grid";
    return { name, recipe: recipes[name] };
  }

  static get(name: SemanticRecipeName) { return recipes[name]; }
  static names() { return Object.keys(recipes) as SemanticRecipeName[]; }
}

export { recipes as semanticRecipeRegistry };
