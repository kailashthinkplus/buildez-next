import type { RecipeContext } from "../builder-blueprint/recipes";
import type { WidgetBlueprintSeed } from "../builder-blueprint/widgetBlueprint";
import { archetypeId as id, button, column, container, divider, heading, image, sectionFrame, text } from "./archetypePrimitives";
import { evaluateLayoutFeasibility } from "./layoutFeasibility";

export function compileEditorialSplitHero(c: RecipeContext): WidgetBlueprintSeed[] {
  const root=id(c,"container.archetype"), copy=id(c,"column.copy"), media=id(c,"column.media"), actions=id(c,"container.actions");
  return [...sectionFrame(c,[copy,media]), container(c,"container.archetype",c.sectionNodeId,[copy,media],{display:"grid",gridTemplateColumns:{desktop:"1.1fr .9fr",tablet:"1fr 1fr",mobile:"1fr"},gap:{desktop:80,tablet:40,mobile:28},alignItems:"center"}), column(c,"column.copy",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.supporting_copy"),actions],{gap:20}), text(c,copy,"eyebrow",14),heading(c,copy,"headline","h1",68),text(c,copy,"supporting_copy",19),container(c,"container.actions",copy,[id(c,"button.primary_cta"),id(c,"button.secondary_cta")],{display:"flex",flexDirection:{desktop:"row",tablet:"row",mobile:"column"} as never,gap:12}),button(c,actions),button(c,actions,"secondary_cta",true),column(c,"column.media",root,[id(c,"image.hero_media")]),image(c,media,"hero_media","4 / 5")];
}

export function compileCinematicFullBleedHero(c: RecipeContext): WidgetBlueprintSeed[] {
  const root=id(c,"container.archetype"),media=id(c,"column.media"),overlay=id(c,"column.overlay"),actions=id(c,"container.actions");
  return [...sectionFrame(c,[media,overlay],{dark:true,fullBleed:true}),container(c,"container.archetype",c.sectionNodeId,[media,overlay],{display:"grid",minHeight:{desktop:760,tablet:620,mobile:620},position:"relative"}),column(c,"column.media",root,[id(c,"image.cinematic_media")],{gridArea:"1 / 1",opacity:.68}),image(c,media,"cinematic_media","16 / 9"),column(c,"column.overlay",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.supporting_copy"),actions],{gridArea:"1 / 1",position:"relative",zIndex:2,justifyContent:"flex-end",gap:20,padding:{desktop:80,tablet:48,mobile:24},maxWidth:900}),text(c,overlay,"eyebrow",14),heading(c,overlay,"headline","h1",76),text(c,overlay,"supporting_copy",19),container(c,"container.actions",overlay,[id(c,"button.primary_cta")],{display:"flex"}),button(c,actions)];
}

export function compileAsymmetricStory(c: RecipeContext): WidgetBlueprintSeed[] {
  const root=id(c,"container.archetype"),intro=id(c,"column.intro"),body=id(c,"column.story"),media=id(c,"column.media");
  return [...sectionFrame(c,[intro,body,media]),container(c,"container.archetype",c.sectionNodeId,[intro,body,media],{display:"grid",gridTemplateColumns:{desktop:".7fr 1.1fr .8fr",tablet:"1fr 1fr",mobile:"1fr"},gap:{desktop:56,tablet:32,mobile:24},alignItems:"start"}),column(c,"column.intro",root,[id(c,"text.eyebrow"),id(c,"heading.headline")],{gap:16}),text(c,intro,"eyebrow",14),heading(c,intro),column(c,"column.story",root,[id(c,"text.lead"),id(c,"divider.story"),id(c,"text.body")],{gap:24,paddingTop:{desktop:72,tablet:32,mobile:0}}),text(c,body,"lead",21),divider(c,body,"divider.story"),text(c,body,"body"),column(c,"column.media",root,[id(c,"image.story_media")],{paddingTop:{desktop:140,tablet:0,mobile:0}}),image(c,media,"story_media","3 / 4")];
}

export function compileBento(c: RecipeContext): WidgetBlueprintSeed[] {
  const root=id(c,"container.archetype"),intro=id(c,"column.intro"),grid=id(c,"container.bento"),cards=[1,2,3,4].map(n=>id(c,`column.card_${n}`)); const out:WidgetBlueprintSeed[]=[...sectionFrame(c,[intro,grid]),container(c,"container.archetype",c.sectionNodeId,[intro,grid],{display:"flex",flexDirection:"column",gap:48}),column(c,"column.intro",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.description")],{gap:16,maxWidth:760}),text(c,intro,"eyebrow",14),heading(c,intro),text(c,intro,"description"),container(c,"container.bento",root,cards,{display:"grid",gridTemplateColumns:{desktop:"repeat(12, 1fr)",tablet:"repeat(2, 1fr)",mobile:"1fr"},gap:20})]; cards.forEach((card,n)=>{const role=`item_${n+1}`;out.push(column(c,`column.card_${n+1}`,grid,[id(c,`image.${role}_media`),id(c,`heading.${role}_title`),id(c,`text.${role}_description`)],{gridColumn:{desktop:n===0?"span 7":n===1?"span 5":"span 6",tablet:"span 1",mobile:"span 1"},padding:24,gap:14,backgroundColor:"rgba(127,127,127,.08)",borderRadius:20}),image(c,card,`${role}_media`,n===0?"16 / 10":"4 / 3"),heading(c,card,`${role}_title`,"h3",30),text(c,card,`${role}_description`,16));}); return out;
}

export function compileImageStory(c: RecipeContext): WidgetBlueprintSeed[] {
  const root=id(c,"container.archetype"),lead=id(c,"column.lead"),beats=[1,2,3].map(n=>id(c,`container.beat_${n}`));const out:WidgetBlueprintSeed[]=[...sectionFrame(c,[lead,...beats]),container(c,"container.archetype",c.sectionNodeId,[lead,...beats],{display:"flex",flexDirection:"column",gap:{desktop:72,tablet:48,mobile:36}}),column(c,"column.lead",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.description")],{gap:16,maxWidth:760}),text(c,lead,"eyebrow",14),heading(c,lead),text(c,lead,"description")]; beats.forEach((beat,n)=>{const media=id(c,`column.beat_${n+1}_media`),copy=id(c,`column.beat_${n+1}_copy`);out.push(container(c,`container.beat_${n+1}`,root,[media,copy],{display:"grid",gridTemplateColumns:{desktop:n%2?".8fr 1.2fr":"1.2fr .8fr",tablet:"1fr 1fr",mobile:"1fr"},gap:{desktop:48,tablet:28,mobile:20},alignItems:"center"}),column(c,`column.beat_${n+1}_media`,beat,[id(c,`image.beat_${n+1}_media`)]),image(c,media,`beat_${n+1}_media`,n%2?"4 / 5":"16 / 10"),column(c,`column.beat_${n+1}_copy`,beat,[id(c,`heading.beat_${n+1}_title`),id(c,`text.beat_${n+1}_description`)],{gap:14}),heading(c,copy,`beat_${n+1}_title`,"h3",34),text(c,copy,`beat_${n+1}_description`));});return out;
}

function floatingProofWidths(context: RecipeContext) {
  const raw = context.input.designResult?.layoutProfile.maxWidth;
  const match = typeof raw === "string" ? raw.match(/^(\d+(?:\.\d+)?)px$/) : undefined;
  const declaredWidth = match ? Number(match[1]) : 1120;
  const desktop = Math.max(320, declaredWidth - 48);
  return { desktop, tablet: Math.min(786, desktop), mobile: Math.min(342, desktop) };
}

function proofFeasibility(width: number, outerTrackAllocation: readonly number[], outerGap: number) {
  return evaluateLayoutFeasibility({
    estimatedContainerWidth: width,
    outerTrackAllocation,
    outerTrackIndex: outerTrackAllocation.length - 1,
    outerGap,
    innerGap: 12,
    childCount: 3,
    childPadding: 20,
    declaredMinimumCardWidth: 260,
    declaredMinimumTextContentWidth: 220,
  });
}

export function compileFloatingProof(c: RecipeContext): WidgetBlueprintSeed[] {
  const root=id(c,"container.archetype"),quote=id(c,"column.proof"),metrics=id(c,"container.metrics"),cards=[1,2,3].map(n=>id(c,`column.metric_${n}`));
  const widths = floatingProofWidths(c);
  const nestedDesktop = proofFeasibility(widths.desktop, [1.15, 0.85], 48);
  const stackDesktop = !nestedDesktop.feasible;
  const desktop = proofFeasibility(widths.desktop, [1], 0);
  const tablet = proofFeasibility(widths.tablet, [1], 0);
  const mobile = proofFeasibility(widths.mobile, [1], 0);
  const tracks = (count: number) => count === 1 ? "1fr" : `repeat(${count},1fr)`;
  const proofStyle = stackDesktop ? { gap: 18, maxWidth: 760 } : { gap: 18 };
  const out:WidgetBlueprintSeed[]=[...sectionFrame(c,[quote,metrics],{framed:true}),container(c,"container.archetype",c.sectionNodeId,[quote,metrics],{display:"grid",gridTemplateColumns:{desktop:stackDesktop?"1fr":"1.15fr .85fr",tablet:"1fr",mobile:"1fr"},gap:{desktop:stackDesktop?36:48,tablet:32,mobile:24},alignItems:"center"}),column(c,"column.proof",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.proof_detail")],proofStyle),text(c,quote,"eyebrow",14),heading(c,quote),text(c,quote,"proof_detail",18),container(c,"container.metrics",root,cards,{display:"grid",gridTemplateColumns:{desktop:tracks(stackDesktop?desktop.selectedTrackCount:nestedDesktop.selectedTrackCount),tablet:tracks(tablet.selectedTrackCount),mobile:tracks(mobile.selectedTrackCount)},gap:12,position:"relative"})];
  cards.forEach((card,n)=>out.push(column(c,`column.metric_${n+1}`,metrics,[id(c,`heading.metric_${n+1}`),id(c,`text.metric_${n+1}_label`)],{padding:20,gap:8,backgroundColor:"rgba(255,255,255,.72)",borderRadius:16}),heading(c,card,`metric_${n+1}`,"h3",34),text(c,card,`metric_${n+1}_label`,14)));return out;
}

export function compileGalleryJourney(c:RecipeContext):WidgetBlueprintSeed[]{const root=id(c,"container.archetype"),intro=id(c,"column.intro"),rail=id(c,"container.gallery"),items=[1,2,3,4,5].map(n=>id(c,`column.gallery_${n}`));const out:WidgetBlueprintSeed[]=[...sectionFrame(c,[intro,rail]),container(c,"container.archetype",c.sectionNodeId,[intro,rail],{display:"flex",flexDirection:"column",gap:44}),column(c,"column.intro",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.description")],{gap:16,maxWidth:760}),text(c,intro,"eyebrow",14),heading(c,intro),text(c,intro,"description"),container(c,"container.gallery",root,items,{display:"grid",gridTemplateColumns:{desktop:"1.4fr .8fr .8fr",tablet:"repeat(2,1fr)",mobile:"1fr"},gap:18})];items.forEach((item,n)=>out.push(column(c,`column.gallery_${n+1}`,rail,[id(c,`image.gallery_${n+1}`),id(c,`text.gallery_${n+1}_caption`)],{gap:10,gridRow:{desktop:n===0?"span 2":"span 1",tablet:"span 1",mobile:"span 1"}}),image(c,item,`gallery_${n+1}`,n===0?"4 / 5":n%2?"16 / 10":"1 / 1"),text(c,item,`gallery_${n+1}_caption`,14)));return out;}

export function compileQuote(c:RecipeContext):WidgetBlueprintSeed[]{const root=id(c,"container.archetype"),quote=id(c,"column.quote");return[...sectionFrame(c,[quote],{dark:true}),container(c,"container.archetype",c.sectionNodeId,[quote],{display:"flex",justifyContent:"center",textAlign:"center"}),column(c,"column.quote",root,[id(c,"text.quote_mark"),id(c,"heading.quote"),id(c,"text.attribution")],{alignItems:"center",gap:20,maxWidth:980}),text(c,quote,"quote_mark",28),heading(c,quote,"quote","h2",58),text(c,quote,"attribution",15)];}

export function compileFramedCTA(c:RecipeContext):WidgetBlueprintSeed[]{const root=id(c,"container.archetype"),copy=id(c,"column.cta"),actions=id(c,"container.actions");return[...sectionFrame(c,[copy],{framed:true}),container(c,"container.archetype",c.sectionNodeId,[copy],{display:"flex",justifyContent:"center",textAlign:"center"}),column(c,"column.cta",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.description"),actions],{alignItems:"center",gap:18,maxWidth:800}),text(c,copy,"eyebrow",14),heading(c,copy),text(c,copy,"description"),container(c,"container.actions",copy,[id(c,"button.primary_cta"),id(c,"button.secondary_cta")],{display:"flex",flexDirection:{desktop:"row",tablet:"row",mobile:"column"} as never,gap:12}),button(c,actions),button(c,actions,"secondary_cta",true)];}

export function compileArchitectural(c:RecipeContext):WidgetBlueprintSeed[]{const root=id(c,"container.archetype"),intro=id(c,"column.intro"),hero=id(c,"column.project_lead"),details=id(c,"container.project_details"),cards=[1,2,3].map(n=>id(c,`column.project_${n}`));const out:WidgetBlueprintSeed[]=[...sectionFrame(c,[intro,hero,details]),container(c,"container.archetype",c.sectionNodeId,[intro,hero,details],{display:"grid",gridTemplateColumns:{desktop:"repeat(12,1fr)",tablet:"repeat(2,1fr)",mobile:"1fr"},gap:{desktop:24,tablet:20,mobile:18}}),column(c,"column.intro",root,[id(c,"text.eyebrow"),id(c,"heading.headline"),id(c,"text.description")],{gridColumn:{desktop:"span 5",tablet:"span 2",mobile:"span 1"},gap:16,paddingBottom:28}),text(c,intro,"eyebrow",14),heading(c,intro),text(c,intro,"description"),column(c,"column.project_lead",root,[id(c,"image.project_lead_media"),id(c,"heading.project_lead_title")],{gridColumn:{desktop:"span 7",tablet:"span 2",mobile:"span 1"},gap:14}),image(c,hero,"project_lead_media","16 / 10"),heading(c,hero,"project_lead_title","h3",34),container(c,"container.project_details",root,cards,{display:"grid",gridColumn:{desktop:"span 12",tablet:"span 2",mobile:"span 1"},gridTemplateColumns:{desktop:"repeat(3,1fr)",tablet:"repeat(2,1fr)",mobile:"1fr"},gap:18})];cards.forEach((card,n)=>out.push(column(c,`column.project_${n+1}`,details,[id(c,`image.project_${n+1}_media`),id(c,`heading.project_${n+1}_title`),id(c,`text.project_${n+1}_detail`)],{gap:12}),image(c,card,`project_${n+1}_media`,n===1?"4 / 5":"4 / 3"),heading(c,card,`project_${n+1}_title`,"h3",28),text(c,card,`project_${n+1}_detail`,15)));return out;}
