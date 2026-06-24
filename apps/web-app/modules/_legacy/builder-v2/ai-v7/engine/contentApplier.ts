// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/contentApplier.ts

import type { BlueprintNode } from "@/modules/builder/types";

/* ============================================================
   CONTENT APPLIER — V7 (JSON FORMAT)
   
   Applies rich JSON content from AI to blueprint nodes.
   Supports structured content with primary/secondary headings,
   main/supporting text, CTAs, social proof, and features.
============================================================ */

interface SectionContent {
  heading?: {
    primary?: string;
    secondary?: string;
  };
  content?: {
    main?: string;
    supporting?: string;
  };
  ctas?: {
    primary?: string;
    secondary?: string;
  };
  socialProof?: {
    stat?: string;
    trust?: string;
  };
  features?: Array<{
    title?: string;
    description?: string;
    icon?: string;
  }>;
  testimonials?: Array<{
    quote?: string;
    author?: string;
    role?: string;
    company?: string;
  }>;
  tiers?: Array<{
    name?: string;
    price?: string;
    description?: string;
    features?: string[];
    cta?: string;
    highlighted?: boolean;
    badge?: string;
  }>;
}

interface WalkContext {
  sectionId?: string;
  sectionContent?: SectionContent;
  headingIndex: number;
  textIndex: number;
  buttonIndex: number;
  featureIndex: number;
  testimonialIndex: number;
  tierIndex: number;
  columnIndex: number; // ✅ NEW: Track column
  isInsideColumn: boolean; // ✅ NEW: Track if we're in column
}

/* ============================================================
   CONTEXTUAL DEFAULTS (FALLBACKS)
============================================================ */

function getDefaultHeading(intent?: string, columnIndex?: number): string {
  const headings: Record<string, string> = {
    hero: "Transform Your Business Today",
    features: "Powerful Features That Drive Results",
    services: "Comprehensive Solutions for Your Needs",
    pricing: "Simple, Transparent Pricing",
    testimonials: "What Our Clients Say",
    about: "Building Excellence Since Day One",
    team: "Meet Our Expert Team",
    stats: "Results That Speak for Themselves",
    gallery: "Our Portfolio of Excellence",
    faq: "Frequently Asked Questions",
    contact: "Get in Touch Today",
    cta: "Ready to Get Started?",
  };
  return headings[intent ?? ""] ?? "Discover What's Possible";
}

function getDefaultText(intent?: string, columnIndex?: number): string {
  const texts: Record<string, string> = {
    hero: "Unlock your potential with our innovative solutions designed to accelerate growth and drive measurable results.",
    features: "Our platform delivers everything you need to succeed, with powerful tools crafted for modern teams and businesses.",
    services: "We provide end-to-end solutions tailored to your unique goals, backed by proven expertise and dedicated support.",
    pricing: "Choose the plan that fits your needs. All plans include core features with transparent pricing and no hidden fees.",
    testimonials: "Join thousands of satisfied customers who have transformed their businesses with our solutions.",
    about: "We're passionate about innovation and committed to delivering exceptional value through quality and service.",
    cta: "Take the next step toward achieving your goals. Join thousands who trust us to deliver results.",
  };
  return texts[intent ?? ""] ?? "Experience the difference of working with industry experts committed to your success.";
}

function getDefaultButton(intent?: string, isPrimary: boolean = true): string {
  if (isPrimary) {
    const primary: Record<string, string> = {
      hero: "Get Started Free",
      features: "Explore Features",
      services: "View Services",
      pricing: "Start Free Trial",
      testimonials: "Read More Reviews",
      about: "Learn Our Story",
      contact: "Contact Us Today",
      cta: "Start Now",
    };
    return primary[intent ?? ""] ?? "Get Started";
  } else {
    const secondary: Record<string, string> = {
      hero: "Watch Demo",
      features: "See Demo",
      services: "Request Quote",
      pricing: "Contact Sales",
      testimonials: "View All",
      about: "Meet the Team",
      contact: "Schedule Call",
      cta: "Learn More",
    };
    return secondary[intent ?? ""] ?? "Learn More";
  }
}

/* ============================================================
   MAIN APPLIER
============================================================ */

export function applyContent(
  page: BlueprintNode,
  contentData: Record<string, SectionContent>
): BlueprintNode {

  function walk(node: BlueprintNode, ctx: WalkContext): BlueprintNode {
    let nextCtx = { ...ctx };

    /* ----------------------------------------------------------
       SECTION — LOAD CONTENT
    ---------------------------------------------------------- */
    if (node.type === "section" && node.props?.role !== "header" && node.props?.role !== "footer") {
      const sectionId = node.props?.sectionName || node.props?.intent || node.id;
      const sectionContent = contentData[sectionId];
      
      console.log(`[ContentApplier] Processing section: ${sectionId}`);
      if (sectionContent) {
        console.log(`[ContentApplier] Content found:`, {
          hasHeading: !!sectionContent.heading,
          hasContent: !!sectionContent.content,
          hasCTAs: !!sectionContent.ctas,
          hasFeatures: !!sectionContent.features,
          featuresCount: sectionContent.features?.length || 0,
        });
      } else {
        console.log(`[ContentApplier] No content for section ${sectionId}, using defaults`);
      }
      
      nextCtx = {
        sectionId,
        sectionContent,
        headingIndex: 0,
        textIndex: 0,
        buttonIndex: 0,
        featureIndex: 0,
        testimonialIndex: 0,
        tierIndex: 0,
        columnIndex: -1, // ✅ Reset column counter
        isInsideColumn: false,
      };
    }

    /* ----------------------------------------------------------
       COLUMN — TRACK INDEX
    ---------------------------------------------------------- */
    if (node.type === "column" && nextCtx.sectionId) {
      // ✅ NEW: Increment column index when entering a column
      nextCtx = {
        ...nextCtx,
        columnIndex: nextCtx.columnIndex + 1,
        isInsideColumn: true,
        // Reset heading/text counters for each column
        headingIndex: 0,
        textIndex: 0,
      };

      console.log(`[ContentApplier] Entering column ${nextCtx.columnIndex}`);

      // Process children
      const processedChildren = node.children?.map(child => walk(child, nextCtx)) ?? [];

      // Exit column context
      return {
        ...node,
        children: processedChildren,
      };
    }

    /* ----------------------------------------------------------
       HEADING
    ---------------------------------------------------------- */
    if (node.type === "heading" && nextCtx.sectionId) {
      const content = nextCtx.sectionContent;
      const intent = nextCtx.sectionId;
      let newText: string | undefined;

      // ✅ FIXED: Use columnIndex to get unique feature
      if (content?.features && content.features.length > 0) {
        const feature = content.features[nextCtx.columnIndex];
        if (feature?.title) {
          newText = feature.title;
          console.log(`[ContentApplier] Column ${nextCtx.columnIndex} heading: ${newText}`);
        }
      }

      // Try main/secondary headings (for non-grid sections)
      if (!newText) {
        if (nextCtx.headingIndex === 0) {
          newText = content?.heading?.primary;
        } else if (nextCtx.headingIndex === 1) {
          newText = content?.heading?.secondary;
        }
      }

      // Check for testimonials
      if (!newText && content?.testimonials && content.testimonials.length > 0) {
        const testimonial = content.testimonials[nextCtx.columnIndex];
        if (testimonial?.author) {
          newText = testimonial.author;
        }
      }

      // Fallback to default
      if (!newText) {
        newText = getDefaultHeading(intent, nextCtx.columnIndex);
      }

      nextCtx.headingIndex++;

      return {
        ...node,
        props: {
          ...node.props,
          text: newText,
        },
        children: node.children?.map(child => walk(child, nextCtx)) ?? [],
      };
    }

    /* ----------------------------------------------------------
       TEXT
    ---------------------------------------------------------- */
    if (node.type === "text" && nextCtx.sectionId) {
      const content = nextCtx.sectionContent;
      const intent = nextCtx.sectionId;
      let newText: string | undefined;

      // ✅ FIXED: Use columnIndex to get unique feature description
      if (content?.features && content.features.length > 0) {
        const feature = content.features[nextCtx.columnIndex];
        if (feature?.description) {
          newText = feature.description;
          console.log(`[ContentApplier] Column ${nextCtx.columnIndex} text: ${newText.substring(0, 50)}...`);
        }
      }

      // Try main/supporting text (for non-grid sections)
      if (!newText) {
        if (nextCtx.textIndex === 0) {
          newText = content?.content?.main;
        } else if (nextCtx.textIndex === 1) {
          newText = content?.content?.supporting;
        }
      }

      // Check for testimonials
      if (!newText && content?.testimonials && content.testimonials.length > 0) {
        const testimonial = content.testimonials[nextCtx.columnIndex];
        if (testimonial?.quote) {
          newText = testimonial.quote;
        }
      }

      // Social proof stats
      if (!newText && content?.socialProof) {
        if (nextCtx.textIndex === 0 && content.socialProof.stat) {
          newText = content.socialProof.stat;
        } else if (nextCtx.textIndex === 1 && content.socialProof.trust) {
          newText = content.socialProof.trust;
        }
      }

      // Fallback to default
      if (!newText) {
        newText = getDefaultText(intent, nextCtx.columnIndex);
      }

      nextCtx.textIndex++;

      return {
        ...node,
        props: {
          ...node.props,
          text: newText,
        },
        children: node.children?.map(child => walk(child, nextCtx)) ?? [],
      };
    }

    /* ----------------------------------------------------------
       BUTTON
    ---------------------------------------------------------- */
    if (node.type === "button" && nextCtx.sectionId) {
      const content = nextCtx.sectionContent;
      const intent = nextCtx.sectionId;
      let newLabel: string | undefined;

      // Try to get CTA from JSON content
      if (nextCtx.buttonIndex === 0) {
        newLabel = content?.ctas?.primary;
      } else if (nextCtx.buttonIndex === 1) {
        newLabel = content?.ctas?.secondary;
      }

      // Fallback to default
      if (!newLabel) {
        newLabel = getDefaultButton(intent, nextCtx.buttonIndex === 0);
      }

      nextCtx.buttonIndex++;

      // Determine variant
      let variant = node.props?.variant || "primary";
      if (nextCtx.buttonIndex === 2) {
        variant = "secondary";
      }

      return {
        ...node,
        props: {
          ...node.props,
          label: newLabel,
          variant,
        },
        children: node.children?.map(child => walk(child, nextCtx)) ?? [],
      };
    }

    /* ----------------------------------------------------------
       ICON
    ---------------------------------------------------------- */
    if (node.type === "icon" && nextCtx.sectionId) {
      const content = nextCtx.sectionContent;
      
      // ✅ FIXED: Use columnIndex to get unique icon
      if (content?.features && content.features.length > 0) {
        const feature = content.features[nextCtx.columnIndex];
        if (feature?.icon) {
          return {
            ...node,
            props: {
              ...node.props,
              icon: feature.icon,
            },
            children: node.children?.map(child => walk(child, nextCtx)) ?? [],
          };
        }
      }
    }

    /* ----------------------------------------------------------
       RECURSE
    ---------------------------------------------------------- */
    if (!node.children?.length) return node;

    return {
      ...node,
      children: node.children.map(child => walk(child, nextCtx)),
    };
  }

  return walk(structuredClone(page), {
    headingIndex: 0,
    textIndex: 0,
    buttonIndex: 0,
    featureIndex: 0,
    testimonialIndex: 0,
    tierIndex: 0,
    columnIndex: -1,
    isInsideColumn: false,
  });
}
