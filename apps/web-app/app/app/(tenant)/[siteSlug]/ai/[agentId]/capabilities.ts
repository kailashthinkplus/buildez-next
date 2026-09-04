import {
  Activity,
  BrainCircuit,
  Building2,
  Compass,
  Contrast,
  FileSearch,
  FileText,
  Heading,
  ImageIcon,
  Keyboard,
  Lightbulb,
  Link2,
  ListChecks,
  Lock,
  MessageCircle,
  MessageSquareText,
  MousePointerClick,
  Palette,
  Quote,
  Route,
  Braces,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Type,
  UserCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { InsightAgentId } from "@/modules/insights/types";

export type AgentCapability = {
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
  color: string;
};

export const AGENT_CAPABILITIES: Record<InsightAgentId, AgentCapability[]> = {
  "seo-agent": [
    {
      title: "Write meta descriptions",
      description: "Benefit-led descriptions for every page missing one.",
      prompt: "Write and apply benefit-led meta descriptions for every page missing one.",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Fix heading structure",
      description: "One clear H1 and a logical hierarchy on every page.",
      prompt: "Restructure headings across the site so each page has one clear H1 and a logical H2/H3 hierarchy.",
      icon: Heading,
      color: "bg-indigo-500/10 text-indigo-500",
    },
    {
      title: "Improve page titles",
      description: "Descriptive titles between 30 and 60 characters.",
      prompt: "Rewrite page titles to be descriptive and within 30-60 characters.",
      icon: Type,
      color: "bg-cyan-500/10 text-cyan-500",
    },
    {
      title: "Audit crawlability",
      description: "Check canonical tags, indexing rules and sitemap coverage.",
      prompt: "Check robots meta tags, canonical links and sitemap coverage across the site.",
      icon: Compass,
      color: "bg-sky-500/10 text-sky-500",
    },
  ],
  "geo-agent": [
    {
      title: "Add structured data",
      description: "Valid JSON-LD schema markup for pages missing it.",
      prompt: "Add valid JSON-LD schema markup to pages missing it, using facts already on the page.",
      icon: Braces,
      color: "bg-violet-500/10 text-violet-500",
    },
    {
      title: "Improve AI citability",
      description: "Make key facts easy for AI search engines to extract.",
      prompt: "Restructure key pages so AI search engines can easily extract and cite facts about this business.",
      icon: Quote,
      color: "bg-fuchsia-500/10 text-fuchsia-500",
    },
    {
      title: "Strengthen entity signals",
      description: "Clear business name, offerings and location everywhere.",
      prompt: "Add clear business entity details (name, offerings, location) consistently across the site.",
      icon: Building2,
      color: "bg-purple-500/10 text-purple-500",
    },
  ],
  "speed-agent": [
    {
      title: "Optimize images",
      description: "Lazy-load below-the-fold media, keep hero images eager.",
      prompt: "Optimize image loading site-wide: keep hero images eager, lazy-load off-screen images.",
      icon: ImageIcon,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Stabilize layout",
      description: "Reserve space for media to prevent layout shift.",
      prompt: "Add stable dimensions or aspect-ratio containers to media to prevent layout shift.",
      icon: Activity,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Reduce blocking time",
      description: "Find scripts slowing down first interaction.",
      prompt: "Identify and defer non-critical scripts that may be slowing down interaction responsiveness.",
      icon: Timer,
      color: "bg-amber-500/10 text-amber-500",
    },
  ],
  "accessibility-agent": [
    {
      title: "Fix alt text",
      description: "Descriptive alt text on every image that's missing it.",
      prompt: "Add descriptive alt text to all images missing it across the site.",
      icon: ImageIcon,
      color: "bg-cyan-500/10 text-cyan-500",
    },
    {
      title: "Improve keyboard navigation",
      description: "Every interactive element reachable and usable by keyboard.",
      prompt: "Audit and fix keyboard navigation so all interactive elements are reachable and usable.",
      icon: Keyboard,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Check color contrast",
      description: "Text and background contrast that meets WCAG guidance.",
      prompt: "Audit and fix text and background color contrast issues across the site.",
      icon: Contrast,
      color: "bg-cyan-500/10 text-cyan-500",
    },
  ],
  "conversion-agent": [
    {
      title: "Strengthen calls to action",
      description: "Make primary CTAs clearer and more prominent.",
      prompt: "Make the primary calls to action clearer and more prominent across key pages.",
      icon: MousePointerClick,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Add trust signals",
      description: "Testimonials, reviews or trust badges near conversion points.",
      prompt: "Add relevant trust signals such as testimonials or badges near the main conversion points.",
      icon: ShieldCheck,
      color: "bg-teal-500/10 text-teal-500",
    },
    {
      title: "Simplify contact paths",
      description: "Reduce friction in how visitors reach out or buy.",
      prompt: "Simplify and shorten the path a visitor takes to contact us or purchase.",
      icon: Route,
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ],
  "quality-agent": [
    {
      title: "Audit safe links",
      description: "Outbound links use proper rel attributes and open safely.",
      prompt: "Check all outbound links use proper rel attributes and open safely in a new tab where appropriate.",
      icon: Link2,
      color: "bg-rose-500/10 text-rose-500",
    },
    {
      title: "Review privacy compliance",
      description: "Cookie banners and privacy policy links present and correct.",
      prompt: "Check that cookie banners and privacy policy links are present and correctly linked site-wide.",
      icon: Lock,
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Clean up production hygiene",
      description: "Remove placeholder content and broken links.",
      prompt: "Find and remove any placeholder content, lorem ipsum text, or broken links across the site.",
      icon: Sparkles,
      color: "bg-rose-500/10 text-rose-500",
    },
  ],
  "business-agent": [
    {
      title: "Summarize pipeline health",
      description: "A quick read on lead flow and where to focus.",
      prompt: "Summarize current lead pipeline health and suggest the next best action.",
      icon: Activity,
      color: "bg-indigo-500/10 text-indigo-500",
    },
    {
      title: "Identify content gaps",
      description: "What's missing to better support the sales funnel.",
      prompt: "Identify content gaps on the website that could better support the sales funnel.",
      icon: FileSearch,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Prioritize this week's fixes",
      description: "The top 3 highest-impact fixes across the whole site.",
      prompt: "Rank the top 3 highest-impact fixes across the whole site for this week.",
      icon: ListChecks,
      color: "bg-indigo-500/10 text-indigo-500",
    },
  ],
  "marketing-agent": [
    {
      title: "Find quick campaign wins",
      description: "Fastest wins across the site for this week's marketing.",
      prompt: "List the fastest wins across the site that could support this week's marketing push.",
      icon: Rocket,
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Audit messaging clarity",
      description: "Does the homepage clearly state the value proposition?",
      prompt: "Review whether the homepage clearly communicates the value proposition within the first screen.",
      icon: MessageSquareText,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Suggest content ideas",
      description: "Content pieces that could attract qualified traffic.",
      prompt: "Suggest 3 content pieces that could attract more qualified traffic to this business.",
      icon: Lightbulb,
      color: "bg-pink-500/10 text-pink-500",
    },
  ],
  "whatsapp-agent": [
    {
      title: "Draft a welcome flow",
      description: "A welcome message and qualification flow for this business.",
      prompt: "Draft a WhatsApp welcome message and lead-qualification flow for this business.",
      icon: Workflow,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Write a first message",
      description: "A friendly pre-filled first message for the chat button.",
      prompt: "Write a friendly, on-brand pre-filled first message for the WhatsApp button.",
      icon: MessageCircle,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Plan handoff to a human",
      description: "When and how the assistant should hand off.",
      prompt: "Define when and how the WhatsApp assistant should hand a conversation off to a human.",
      icon: UserCheck,
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ],
  "chatbot-agent": [
    {
      title: "Write a welcome message",
      description: "A warm, on-brand greeting for website visitors.",
      prompt: "Write a warm, on-brand welcome message for the website chatbot.",
      icon: MessageCircle,
      color: "bg-sky-500/10 text-sky-500",
    },
    {
      title: "Define chatbot knowledge",
      description: "Key facts about this business the chatbot should know.",
      prompt: "Summarize the key facts about this business the chatbot should know to answer visitors well.",
      icon: BrainCircuit,
      color: "bg-indigo-500/10 text-indigo-500",
    },
    {
      title: "Set the right tone",
      description: "A tone and personality that fits this website.",
      prompt: "Recommend a tone and personality for this website's chatbot, matching the brand.",
      icon: Palette,
      color: "bg-sky-500/10 text-sky-500",
    },
  ],
};
