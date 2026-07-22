import { ComponentVariantCompilerRegistry } from "../builder-blueprint/component-recipes";
import { LayoutArchetypeRegistry, type LayoutArchetypeId } from "../layout-archetypes";
import { buildComponentCatalog } from "./componentCatalog";
import { buildComponentRequirements } from "./componentRequirements";
import type { ComponentCandidate, ComponentFamilyContext, ComponentInput, ComponentSelection, ComponentVariant, CompilerCoverage, NarrativeSectionIntent, SectionAnatomyDiagnostic, SectionComponentCandidate, SectionComponentScore, SectionComponentSelection, VisualCapabilityDiagnostic } from "./componentVariant";
import { scoreComponentCandidates } from "./componentScoring";
import { selectVisualCapability } from "./visualCapabilitySelection";

function bounded(value:number){return Math.max(0,Math.min(1,Number(value.toFixed(3))));}
function corpus(...values:unknown[]){return values.flat().filter(Boolean).join(" ").toLowerCase();}
function words(value:string){return new Set(value.split(/[^a-z0-9]+/).filter((item)=>item.length>2));}
function similarity(left:string,right:string){const a=words(left),b=words(right);if(!a.size||!b.size)return 0;return [...a].filter((item)=>b.has(item)).length/Math.max(1,Math.min(a.size,b.size));}
function hash(value:string){let result=2166136261;for(let index=0;index<value.length;index++){result^=value.charCodeAt(index);result=Math.imul(result,16777619);}return result>>>0;}
function exploration(seed:string,sectionId:string,variantId:string){return ((hash(`${seed}:${sectionId}:${variantId}`)%1001)/1000-.5)*.05;}

export function componentSilhouette(variant:ComponentVariant){
  const value=corpus(variant.id,variant.category,variant.patternIds,variant.metadata.tags);
  if(/hero/.test(value))return /booking|appointment/.test(value)?"action-hero":"split-hero";
  if(/gallery|masonry|portfolio|showcase/.test(value))return /rail/.test(value)?"media-rail":"media-mosaic";
  if(/timeline|process|story|founder/.test(value))return "narrative-flow";
  if(/proof|review|testimonial|trust/.test(value))return "proof-interlude";
  if(/cta|conversion|contact|form|sticky/.test(value))return "conversion-frame";
  if(/card|matrix|catalogue|menu|feature|pricing|comparison|service|product/.test(value))return "card-grid";
  return "editorial-block";
}

function inferredCategory(patternId:string){
  const value=patternId.toLowerCase();
  if(/hero/.test(value))return "hero";if(/gallery|lifestyle|portfolio|showcase/.test(value))return "gallery";if(/proof|trust|review|testimonial/.test(value))return "proof";if(/cta|conversion|contact|lead/.test(value))return "conversion-block";if(/process|timeline|journey/.test(value))return "process";if(/service|matrix/.test(value))return "service";if(/product/.test(value))return "product";if(/menu/.test(value))return "menu";if(/course|catalogue/.test(value))return "catalogue";if(/faq/.test(value))return "FAQ";return "content";
}

function roleFor(section:NarrativeSectionIntent){const value=corpus(section.id,section.patternId,section.category,section.purpose);if(/sticky[_ -]mobile[_ -]cta|sticky-action/.test(value))return"sticky-action";if(/footer[_ -]trust[_ -]closure|footer/.test(value))return"footer-closure";if(/trust[_ -]band/.test(value))return"trust-band";if(/editorial[_ -]hero|hero/.test(value))return"opening-hero";if(/final[_ -]conversion|closure/.test(value))return"closing-action";if(/contact|lead|form/.test(value))return"lead-capture";return section.category??"body";}
function placementFor(role:string){return role==="opening-hero"?"opening":role==="sticky-action"?"sticky":role==="footer-closure"||role==="closing-action"?"closure":"body";}
function roleCompatible(section:NarrativeSectionIntent,variant:ComponentVariant){const role=roleFor(section),value=corpus(variant.id,variant.category,variant.family,variant.patternIds);if(role==="sticky-action")return /sticky/.test(value)&&!/hero/.test(value);if(role==="footer-closure")return /footer|closure/.test(value)&&!/hero/.test(value);if(role==="trust-band")return /trust[_ -]?band|inline[_ -]?trust/.test(value)&&!/footer|hero/.test(value);if(role==="opening-hero")return /hero/.test(value)&&!/sticky/.test(value);if(role==="lead-capture")return /contact|lead|form/.test(value)&&!/hero/.test(value);if(role==="closing-action")return /final|conversion|cta/.test(value)&&!/hero|sticky/.test(value);return true;}
function roleArchetype(section:NarrativeSectionIntent):LayoutArchetypeId|undefined{const role=roleFor(section);return role==="sticky-action"||role==="footer-closure"||role==="lead-capture"||role==="closing-action"?"framedCTA":role==="trust-band"?"quoteInterlude":undefined;}
export function semanticAnatomyFingerprint(section:NarrativeSectionIntent,variant:ComponentVariant,archetype:LayoutArchetypeId|undefined){const role=roleFor(section),placement=placementFor(role),conversion=/sticky|contact|lead|conversion|cta/.test(corpus(section.patternId,section.category))?role:"none",interaction=role==="sticky-action"?"sticky":role==="lead-capture"?"form":"static";return [semanticPurpose(section.purpose),role,conversion,variant.category,archetype??"legacy",section.mediaRole??"none",interaction,placement,componentSilhouette(variant)].join("|");}
function semanticPurpose(value:string){const text=value.toLowerCase();if(/trust|proof|closure/.test(text))return"proof";if(/conversion|contact|lead|cta/.test(text))return"conversion";if(/hero|orientation/.test(text))return"orientation";if(/gallery|exploration/.test(text))return"discovery";return text.replace(/[^a-z0-9]+/g,"-").slice(0,48);}
function defectiveAnatomyKey(section:NarrativeSectionIntent,variant:ComponentVariant,archetype?:LayoutArchetypeId){return [semanticPurpose(section.purpose),roleFor(section),placementFor(roleFor(section)),archetype??"legacy",componentSilhouette(variant)].join("|");}

export function resolveNarrativeSections(input:ComponentInput):NarrativeSectionIntent[]{
  if(input.narrativeSections?.length)return input.narrativeSections.map((section)=>Object.freeze({...section}));
  return (input.patternIntelligence?.selectedPatterns??[]).map((pattern,index)=>Object.freeze({id:`section.${pattern.patternId}.${index+1}`,purpose:pattern.reason||pattern.patternId,category:inferredCategory(pattern.patternId),patternId:pattern.patternId,experienceGoal:input.experienceStrategy?.scrollNarrative[index],mediaRole:/gallery|portfolio|hero|showcase|product/.test(pattern.patternId)?"dominant" as const:"supporting" as const}));
}

function archetypeFor(section:NarrativeSectionIntent,variant:ComponentVariant,input:ComponentInput,context:ComponentFamilyContext):LayoutArchetypeId|undefined{
  if(section.layoutArchetypeId)return section.layoutArchetypeId;
  const directed=roleArchetype(section);if(directed)return directed;
  return LayoutArchetypeRegistry.resolve({id:section.id,type:section.category??variant.category,purpose:section.purpose,componentVariantId:variant.id,componentCategory:variant.category,patternIds:section.patternId?[section.patternId]:variant.patternIds,order:0},input.artDirectionBrief,context.family)?.id;
}

function coverage(variant:ComponentVariant,archetype?:LayoutArchetypeId):{compilerCoverage:CompilerCoverage;fallbackReason?:string}{
  if(ComponentVariantCompilerRegistry.ids().includes(variant.id as never))return{compilerCoverage:"dedicated"};
  if(archetype)return{compilerCoverage:"archetype-fallback",fallbackReason:`${variant.id} has no dedicated compiler; ${archetype} will compile its section intent.`};
  return{compilerCoverage:"legacy-recipe-fallback",fallbackReason:`${variant.id} has no dedicated compiler or compatible layout archetype; legacy semantic recipe required.`};
}

function mediaCompatibility(section:NarrativeSectionIntent,variant:ComponentVariant,input:ComponentInput){
  const needsMedia=variant.requiredAssets.length>0;const ready=Boolean(input.mediaStrategy)&&!(input.mediaStrategy?.assetReadiness.missingRequiredCount);
  if(section.mediaRole==="dominant")return needsMedia?(ready?1:.72):.38;
  if(section.mediaRole==="none")return needsMedia?.35:.95;
  return needsMedia?(ready?.88:.62):.78;
}

function scoreFor(section:NarrativeSectionIntent,candidate:ComponentCandidate,input:ComponentInput,context:ComponentFamilyContext,previous:readonly SectionComponentSelection[],seed:string):SectionComponentCandidate{
  const variant=candidate.variant;const silhouette=componentSilhouette(variant);const archetype=archetypeFor(section,variant,input,context);const previousIds=previous.map((item)=>item.selection.variant.id),previousSilhouettes=previous.map((item)=>item.silhouette);
  const purposeFit=bounded(Math.max(similarity(corpus(section.purpose,section.category,section.patternId,section.experienceGoal),corpus(variant.label,variant.category,variant.family,variant.patternIds,variant.metadata.tags)),section.category===variant.category?.72:0));
  const geometryCompatibility=bounded(archetype?(archetype.includes("Hero")&&silhouette.includes("hero")||archetype.includes("Gallery")&&silhouette.includes("media")||archetype==="bentoShowcase"&&silhouette==="card-grid"||archetype==="imageStoryNarrative"&&silhouette==="narrative-flow"||archetype==="floatingProofSection"&&silhouette==="proof-interlude"||archetype==="quoteInterlude"&&silhouette==="proof-interlude"||archetype==="framedCTA"&&silhouette==="conversion-frame"||archetype==="architecturalProjectShowcase"&&silhouette==="media-mosaic"?.98:.68):.58);
  const archetypeCompatibility=archetype?1:.48;
  const preferred=input.artDirectionBrief?.componentStrategy;const brandFit=bounded(.5+(preferred?.preferredTags.some((tag)=>variant.metadata.tags.includes(tag))?.28:0)+(preferred?.preferredFamilies.includes(variant.family)?.18:0));
  const repetitionCount=previousIds.filter((id)=>id===variant.id).length;const silhouetteCount=previousSilhouettes.filter((item)=>item===silhouette).length;
  const repetitionPenalty=bounded(repetitionCount*.55+Math.max(0,silhouetteCount-1)*.22);
  const visualVariety=bounded(previousSilhouettes.length&&!previousSilhouettes.includes(silhouette)?1:previousSilhouettes.length?.5:.8);
  const silhouetteDiversity=bounded(previousSilhouettes.slice(-2).includes(silhouette)?.3:1);
  const explore=exploration(seed,section.id,variant.id);
  const score:SectionComponentScore=Object.freeze({purposeFit,geometryCompatibility,archetypeCompatibility,visualVariety,brandFit,mediaRoleCompatibility:bounded(mediaCompatibility(section,variant,input)),repetitionPenalty,silhouetteDiversity,exploration:Number(explore.toFixed(3)),overall:bounded(purposeFit*.2+geometryCompatibility*.15+archetypeCompatibility*.14+visualVariety*.12+brandFit*.12+mediaCompatibility(section,variant,input)*.12+silhouetteDiversity*.1+candidate.score.overall*.1-repetitionPenalty*.18+explore)});
  return Object.freeze({section,candidate,score,silhouette,layoutArchetypeId:archetype,...coverage(variant,archetype)});
}

export function buildSectionScopedSelection(input:ComponentInput,context:ComponentFamilyContext):{seed:string;sectionCandidates:ReadonlyArray<Readonly<{section:NarrativeSectionIntent;candidates:readonly SectionComponentCandidate[]}>>;sectionSelections:SectionComponentSelection[];anatomyDiagnostics:SectionAnatomyDiagnostic[];visualCapabilityDiagnostics:VisualCapabilityDiagnostic[]}{
  const sections=resolveNarrativeSections(input);const seed=String(input.explorationSeed??input.artDirectionBrief?.id??input.patternIntelligence?.id??input.businessProfile?.id??"component-default");const global=scoreComponentCandidates(buildComponentCatalog(),input,context);const selected:SectionComponentSelection[]=[];const grouped:Array<Readonly<{section:NarrativeSectionIntent;candidates:readonly SectionComponentCandidate[]}>>=[];const anatomyDiagnostics:SectionAnatomyDiagnostic[]=[];const visualCapabilityDiagnostics:VisualCapabilityDiagnostic[]=[];const anatomyKeys=new Set<string>();
  for(const section of sections){const ranked=global.map((candidate)=>scoreFor(section,candidate,input,context,selected,seed)).sort((a,b)=>b.score.overall-a.score.overall||a.candidate.variant.id.localeCompare(b.candidate.variant.id));const roleValid=ranked.filter((item)=>roleCompatible(section,item.candidate.variant));const viable=roleValid.filter((item)=>item.score.overall>=.35).slice(0,6);grouped.push(Object.freeze({section,candidates:Object.freeze(viable)}));const rejectedDuplicateCandidates:string[]=[];let chosen:SectionComponentCandidate|undefined;for(const candidate of viable.length?viable:roleValid){const key=defectiveAnatomyKey(section,candidate.candidate.variant,candidate.layoutArchetypeId);if(anatomyKeys.has(key)){rejectedDuplicateCandidates.push(candidate.candidate.variant.id);continue;}chosen=candidate;break;}const forceLegacyRecipe=!chosen&&Boolean(viable[0]??roleValid[0]);chosen??=viable[0]??roleValid[0];if(!chosen){anatomyDiagnostics.push(Object.freeze({sectionId:section.id,requestedRole:roleFor(section),anatomyFingerprint:"unresolved",rejectedDuplicateCandidates,finalSelectionReason:"No semantically valid catalog candidate.",warning:"COMPILER_COVERAGE_ROLE_FALLBACK"}));continue;}const variant=chosen.candidate.variant,key=defectiveAnatomyKey(section,variant,forceLegacyRecipe?undefined:chosen.layoutArchetypeId);anatomyKeys.add(key);const selection:ComponentSelection=Object.freeze({variant,rationale:[...chosen.candidate.reasons,`section=${section.id}`,`silhouette=${chosen.silhouette}`,`archetype=${forceLegacyRecipe?"legacy":chosen.layoutArchetypeId??"none"}`,`compilerCoverage=${forceLegacyRecipe?"legacy-recipe-fallback":chosen.compilerCoverage}`],requirements:buildComponentRequirements(variant,input),editableMappingIntent:variant.editableMappingIntent});selected.push(Object.freeze({section,selection,score:chosen.score,silhouette:chosen.silhouette,layoutArchetypeId:forceLegacyRecipe?undefined:chosen.layoutArchetypeId,compilerCoverage:forceLegacyRecipe?"legacy-recipe-fallback":chosen.compilerCoverage,fallbackReason:forceLegacyRecipe?"All role-compatible premium candidates duplicated existing anatomy; explicit role-correct legacy fallback selected.":chosen.fallbackReason,forceLegacyRecipe}));anatomyDiagnostics.push(Object.freeze({sectionId:section.id,requestedRole:roleFor(section),selectedComponent:variant.id,selectedArchetype:forceLegacyRecipe?undefined:chosen.layoutArchetypeId,anatomyFingerprint:semanticAnatomyFingerprint(section,variant,forceLegacyRecipe?undefined:chosen.layoutArchetypeId),rejectedDuplicateCandidates,finalSelectionReason:forceLegacyRecipe?"All compatible premium anatomy collided; explicit legacy fallback retained the section.":rejectedDuplicateCandidates.length?"Reranked to prevent defective duplicate anatomy.":"Highest-ranked role-compatible anatomy.",...(forceLegacyRecipe?{warning:"COMPILER_COVERAGE_ROLE_FALLBACK"}: {})}));}
  for(const section of sections)visualCapabilityDiagnostics.push(selectVisualCapability(section));
  const capabilityBySection=new Map(visualCapabilityDiagnostics.map((item)=>[item.sectionId,item]));
  const selectionsWithCapabilities=selected.map((item)=>{const diagnostic=capabilityBySection.get(item.section.id);return Object.freeze({...item,selectedCapability:diagnostic?.selectedCapability,capabilityCandidates:diagnostic?.candidateCapabilities,containerMode:diagnostic?.containerMode});});
  return{seed,sectionCandidates:Object.freeze(grouped),sectionSelections:selectionsWithCapabilities,anatomyDiagnostics,visualCapabilityDiagnostics};
}
