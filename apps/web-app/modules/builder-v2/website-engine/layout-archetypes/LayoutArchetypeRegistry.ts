import type { ArtDirectionBrief } from "../creative-director";
import type { SemanticSection } from "../builder-blueprint/recipes";
import { ARCHETYPE_DEFINITIONS } from "./archetypeDefinitions";
import type { LayoutArchetypeDefinition, LayoutArchetypeId } from "./LayoutArchetype";

function corpus(section: SemanticSection) { return [section.type,section.purpose,section.componentCategory,section.componentVariantId,...section.patternIds].filter(Boolean).join(" ").toLowerCase(); }
function supported(definition: LayoutArchetypeDefinition, industry?: string) { return !industry || industry === "unknown" || definition.supportedIndustries.includes(industry as never) || definition.supportedIndustries.includes("unknown"); }

export function selectLayoutArchetype(section: SemanticSection, brief?: ArtDirectionBrief, industry?: string): LayoutArchetypeDefinition | undefined {
  if (!brief) return undefined;
  const value=corpus(section); let id:LayoutArchetypeId|undefined;
  if (/hero|masthead|banner/.test(value)) id=brief.compositionStyle==="cinematic"||brief.blueprintStrategy.mediaTreatment==="immersive"?"cinematicFullBleedHero":"editorialSplitHero";
  else if (/architect|project|residence|property|portfolio/.test(value) && ["real_estate","architecture_interiors","construction"].includes(industry??"")) id="architecturalProjectShowcase";
  else if (/gallery|masonry|lifestyle|visual|media/.test(value)) id="galleryJourney";
  else if (/testimonial|quote|review/.test(value)) id="quoteInterlude";
  else if (/trust|proof|credential|stats|metric|outcome/.test(value)) id="floatingProofSection";
  else if (/cta|conversion|contact|booking|appointment|enquiry|form/.test(value)) id="framedCTA";
  else if (/about|founder|team|practice|studio|story/.test(value)) id=brief.compositionStrategy.emphasizeImagery?"asymmetricStorySection":"imageStoryNarrative";
  else if (/process|timeline|journey|steps|narrative/.test(value)) id="imageStoryNarrative";
  else if (/showcase|service|feature|product|catalogue|menu|pricing|comparison|offer/.test(value)) id="bentoShowcase";
  if (!id) return undefined;
  const definition=ARCHETYPE_DEFINITIONS[id];
  return supported(definition,industry)?definition:undefined;
}

export class LayoutArchetypeRegistry {
  static resolve(section: SemanticSection, brief?: ArtDirectionBrief, industry?: string) { return selectLayoutArchetype(section,brief,industry); }
  static get(id:LayoutArchetypeId){return ARCHETYPE_DEFINITIONS[id];}
  static all(){return Object.freeze(Object.values(ARCHETYPE_DEFINITIONS));}
  static ids(){return Object.freeze(Object.keys(ARCHETYPE_DEFINITIONS) as LayoutArchetypeId[]);}
}

