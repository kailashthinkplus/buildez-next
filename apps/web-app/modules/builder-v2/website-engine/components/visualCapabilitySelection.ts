import type { NodeType } from "../../types/blueprint";
import { ProductionGenerationCapabilityCatalog } from "../native-visual-capabilities";
import type { ContainerMode, NarrativeSectionIntent, VisualCapabilityDiagnostic } from "./componentVariant";

function corpus(section: NarrativeSectionIntent) {
  return [section.id, section.patternId, section.category, section.purpose, section.experienceGoal].filter(Boolean).join(" ").toLowerCase();
}

function requestedTypes(section: NarrativeSectionIntent): NodeType[] {
  const value = corpus(section);
  if (/sticky[_ -]mobile[_ -]cta|sticky-action/.test(value)) return ["floatingWhatsApp"];
  if (/footer[_ -]trust[_ -]closure|footer/.test(value)) return ["smartFooter"];
  if (/editorial[_ -]hero|hero|orientation/.test(value)) return ["hero"];
  if (/lifestyle[_ -]gallery|visual[_ -]exploration/.test(value)) return ["galleryLightbox", "masonryGallery", "carousel", "gallery"];
  if (/project[_ -]showcase|property[_ -]discovery|portfolio/.test(value)) return ["carousel", "masonryGallery", "tabs", "cardGrid"];
  if (/faq|objection/.test(value)) return ["faq", "accordion"];
  if (/contact[_ -]lead[_ -]capture|consultation|lead[_ -]capture/.test(value)) return ["leadForm", "contactForm"];
  if (/locality|journey|timeline|process|narrative/.test(value)) return ["timeline", "tabs"];
  if (/trust[_ -]band|credential|partner|certification/.test(value)) return ["logoCloud", "statsCounter", "testimonials"];
  if (/proof|review|testimonial|metric/.test(value)) return ["testimonials", "statsCounter", "logoCloud"];
  if (/final[_ -]conversion|closing|cta|conversion/.test(value)) return ["cta"];
  if (/comparison/.test(value)) return ["tabs", "cardGrid"];
  if (/feature|amenit|service|offer/.test(value)) return ["cardGrid"];
  return [];
}

function modeFor(section: NarrativeSectionIntent, selected?: NodeType): ContainerMode {
  const value = corpus(section);
  if (selected === "hero") return section.mediaRole === "dominant" ? "fullBleed" : "fullWidth";
  if (selected === "galleryLightbox" || selected === "masonryGallery") return "fullBleed";
  if (selected === "carousel" || selected === "smartFooter") return "fullWidth";
  if (selected === "logoCloud" || selected === "statsCounter" || selected === "timeline") return "wide";
  if (selected === "tabs") return "breakout";
  if (/sticky/.test(value)) return "fullWidth";
  return "boxed";
}

export function selectVisualCapability(section: NarrativeSectionIntent): VisualCapabilityDiagnostic {
  const requested = requestedTypes(section);
  const candidates = requested.filter((type) => ProductionGenerationCapabilityCatalog.has(type));
  const selectedCapability = candidates[0];
  const capability = selectedCapability ? ProductionGenerationCapabilityCatalog.get(selectedCapability) : undefined;
  return Object.freeze({
    sectionId: section.id,
    purpose: section.purpose,
    candidateCapabilities: Object.freeze(candidates),
    selectedCapability,
    selectedWidgetType: selectedCapability,
    compilerCoverage: capability ? "native-adapter" : requested.length ? "role-correct-fallback" : "unavailable",
    containerMode: modeFor(section, selectedCapability),
    fallbackReason: capability ? undefined : requested.length ? `No requested capability passed the production generation gates: ${requested.join(", ")}.` : "No purpose-appropriate native visual capability was requested.",
    interactionLevel: capability?.interactionLevel ?? "static",
    motionEligibility: Boolean(capability && capability.interactionLevel !== "interactive"),
  });
}
