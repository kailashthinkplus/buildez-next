// apps/web-app/modules/builder/blueprint/presets.ts
"use client";

import { BuilderNode } from "@/modules/builder/state/useBlueprintStore";
import { nanoid } from "nanoid";

/* -----------------------------------------------------------
   Helper: Create minimal node
----------------------------------------------------------- */
function node(type: string, props = {}, children: BuilderNode[] = []): BuilderNode {
  return {
    id: nanoid(),
    type,
    props,
    style: {},
    layout: {},
    effects: {},
    parentId: undefined,
    children,
  };
}

/* -----------------------------------------------------------
   HERO PRESET
----------------------------------------------------------- */
export const heroPreset: BuilderNode = node("hero", {
  eyebrow: "Introducing",
  heading: "BuildEZ — AI Website Builder",
  subheading: "Create stunning, responsive websites in minutes with AI-powered tools.",
  cta: "Get Started",
});

/* -----------------------------------------------------------
   ACCORDION PRESET
----------------------------------------------------------- */
export const accordionPreset: BuilderNode = node("accordion", {
  items: [
    { title: "What is BuildEZ?", body: "AI website builder for entrepreneurs and teams." },
    { title: "Do I need coding?", body: "No. Everything is drag-and-drop." },
  ],
});

/* -----------------------------------------------------------
   VIDEO PRESET
----------------------------------------------------------- */
export const videoPreset: BuilderNode = node("video", {
  src: "https://www.w3schools.com/html/mov_bbb.mp4",
  poster: "/placeholder-video.jpg",
});

/* -----------------------------------------------------------
   BLOG CARD PRESET
----------------------------------------------------------- */
export const blogCardPreset: BuilderNode = node("blog-card", {
  image: "/placeholder-blog.jpg",
  title: "How AI is Changing Web Design",
  excerpt: "A deep dive into the future of automated website creation.",
  cta: "Read More",
});

/* -----------------------------------------------------------
   BLOG LIST PRESET
----------------------------------------------------------- */
export const blogListPreset: BuilderNode = node("blog-list", {
  posts: [
    {
      image: "/placeholder-blog.jpg",
      title: "5 Tips for Better Landing Pages",
      excerpt: "Boost conversions with these simple improvements.",
    },
    {
      image: "/placeholder-blog.jpg",
      title: "AI Tools for Creators",
      excerpt: "Discover the top platforms empowering creators.",
    },
  ],
});

/* -----------------------------------------------------------
   CONTACT FORM PRESET
----------------------------------------------------------- */
export const contactFormPreset: BuilderNode = node("contact-form", {
  fields: [
    { label: "Name", type: "text", placeholder: "Enter your name" },
    { label: "Email", type: "email", placeholder: "Enter your email" },
    { label: "Message", type: "textarea", placeholder: "Write your message" },
  ],
  cta: "Submit",
});

/* -----------------------------------------------------------
   CTA BANNER PRESET
----------------------------------------------------------- */
export const ctaBannerPreset: BuilderNode = node("cta-banner", {
  heading: "Start Building Your Website Today",
  subheading: "No credit card required. No coding.",
  cta: "Create My Site",
});

/* -----------------------------------------------------------
   ICON GRID PRESET
----------------------------------------------------------- */
export const iconGridPreset: BuilderNode = node("icon-grid", {
  items: [
    { icon: "/icons/check.svg", label: "Fast" },
    { icon: "/icons/code.svg", label: "No Code" },
    { icon: "/icons/smart.svg", label: "AI Powered" },
    { icon: "/icons/responsive.svg", label: "Responsive" },
  ],
});

/* -----------------------------------------------------------
   EXPORT MASTER MAP (Block Menu Uses This)
----------------------------------------------------------- */
export const BLOCK_PRESETS: Record<string, BuilderNode> = {
  hero: heroPreset,
  accordion: accordionPreset,
  video: videoPreset,
  "blog-card": blogCardPreset,
  "blog-list": blogListPreset,
  "contact-form": contactFormPreset,
  "cta-banner": ctaBannerPreset,
  "icon-grid": iconGridPreset,
};
