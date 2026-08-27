"use client";
import { useEffect, useRef, useState } from "react";
import { Bold, Code2, ImagePlus, Italic, Link2, Monitor, PanelRightClose, RotateCcw, Smartphone, Sparkles, Tablet, WandSparkles } from "lucide-react";
import type { BuilderSelection } from "./contracts";
import { describeBuilderSelection } from "./selectionDescription";
import type { ConnectedPresentation, ConnectedSource, ElementPatch, StyleProperty } from "./sourcePatches";
import { R2ImageUpload } from "@/components/media/R2ImageUpload";

const tabs = ["Content", "Style", "Advanced"] as const;
export function SourceInspector({ siteId, selection, disabled, onPatch, onOpenSource, onCollapse, onAIRequest }: {
  siteId: string; selection?: BuilderSelection; disabled?: boolean; onPatch(patch: ElementPatch): Promise<void>; onOpenSource(): void; onCollapse(): void; onAIRequest(prompt: string): void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Content");
  const [text, setText] = useState("");
  const [richHtml, setRichHtml] = useState("");
  const richRef = useRef<HTMLTextAreaElement>(null);
  const [className, setClassName] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [source, setSource] = useState<ConnectedSource>("none");
  const [sourceId, setSourceId] = useState("");
  const [presentation, setPresentation] = useState<ConnectedPresentation>("grid");
  const [limit, setLimit] = useState(8);
  const [field, setField] = useState("");
  useEffect(() => {
    setText(selection?.textContent ?? "");
    setRichHtml(selection?.innerHTML ?? selection?.textContent ?? "");
    setClassName(selection?.className ?? "");
    setAttributes({ ...(selection?.attributes ?? {}) });
    setStyles({ ...(selection?.computedStyleSummary ?? {}) });
    setSource((selection?.attributes?.["data-buildez-source"] as ConnectedSource) || "none");
    setSourceId(selection?.attributes?.["data-buildez-source-id"] ?? "");
    setPresentation((selection?.attributes?.["data-buildez-presentation"] as ConnectedPresentation) || "grid");
    setLimit(Number(selection?.attributes?.["data-buildez-limit"] || 8));
    setField(selection?.attributes?.["data-buildez-field"] ?? "");
  }, [selection]);
  function commitAttribute(name: "src" | "alt" | "href" | "id", value: string) {
    if (value !== (selection?.attributes?.[name] ?? "")) void onPatch({ operation: "attribute", name, value });
  }
  function commitStyle(name: StyleProperty, value: string) {
    if (value !== (selection?.computedStyleSummary?.[name] ?? "")) void onPatch({ operation: "style", name, value });
  }
  function wrapRich(tag: "strong" | "em" | "a") {
    const field = richRef.current;
    const start = field?.selectionStart ?? richHtml.length;
    const end = field?.selectionEnd ?? richHtml.length;
    const chosen = richHtml.slice(start, end) || (tag === "a" ? "Link text" : "Formatted text");
    const open = tag === "a" ? '<a href="#">' : `<${tag}>`;
    const next = `${richHtml.slice(0,start)}${open}${chosen}</${tag}>${richHtml.slice(end)}`;
    setRichHtml(next);
  }
  function selectedContext(action: string) {
    const label = description?.title || selection?.tagName || "selected element";
    onAIRequest(`${action} for the selected ${label}. Preserve the surrounding design system, responsive behavior, accessibility, and intent. Apply the result directly to this selected element.`);
  }
  const description = selection ? describeBuilderSelection(selection) : undefined;
  return <aside className="flex h-full w-[360px] flex-col border-l border-white/10 bg-[#121418]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
    <div className="border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-sm capitalize text-white">{description?.title || "Inspector"}</strong>{description && <p className="mt-1 text-[11px] text-white/40">{description.type} · Inspector</p>}</div><button type="button" onClick={onCollapse} aria-label="Collapse inspector" title="Collapse inspector" className="rounded-lg p-1.5 text-white/45 hover:bg-white/10 hover:text-white"><PanelRightClose size={17}/></button></div>
      <div className="mt-3 grid grid-cols-3 rounded-lg border border-white/10 bg-black/25 p-1">{tabs.map(value => <button key={value} onClick={() => setTab(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${tab === value ? "bg-blue-500 text-white shadow" : "text-white/50 hover:text-white"}`}>{value}</button>)}</div>
    </div>
    {!selection ? <div className="p-4 text-sm leading-6 text-white/40">Select an element in Edit mode to inspect source-backed controls.</div> :
    <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4 text-sm">
      {tab === "Content" && <>
        {selection.editableCapabilities.includes("richText") ? <Field label="Rich text"><div className="mb-2 flex gap-1 rounded-lg border border-white/10 bg-black/20 p-1"><ToolButton label="Bold" onClick={()=>wrapRich("strong")}><Bold size={14}/></ToolButton><ToolButton label="Italic" onClick={()=>wrapRich("em")}><Italic size={14}/></ToolButton><ToolButton label="Link" onClick={()=>wrapRich("a")}><Link2 size={14}/></ToolButton></div><textarea ref={richRef} value={richHtml} onChange={event=>setRichHtml(event.target.value)} onBlur={()=>richHtml !== selection.innerHTML && void onPatch({operation:"html",value:richHtml})} disabled={disabled} className="h-36 font-mono text-xs"/><div className="mt-2 rounded-lg border border-white/10 bg-white p-3 text-sm text-slate-800" dangerouslySetInnerHTML={{__html:safeRichPreview(richHtml)}}/></Field> : selection.editableCapabilities.includes("text") && <Field label="Text"><textarea value={text} onChange={event => setText(event.target.value)} onBlur={() => text !== selection.textContent && void onPatch({ operation: "text", value: text })} disabled={disabled} className="h-28"/></Field>}
        {selection.editableCapabilities.includes("image") && <><R2ImageUpload siteId={siteId} label="Image" value={attributes.src} onChange={(src) => { setAttributes(values => ({ ...values, src })); void onPatch({ operation: "attribute", name: "src", value: src }); }} purpose="builder-image" help="Uploads and AI assets are saved in this website's media library."/><Field label="Alt text"><input value={attributes.alt ?? ""} onChange={event => setAttributes(values => ({ ...values, alt: event.target.value }))} onBlur={event => commitAttribute("alt", event.target.value)}/></Field><button type="button" onClick={()=>selectedContext("Generate a high-quality, contextually appropriate image and replace the current image")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium"><ImagePlus size={15}/>Generate image with AI</button></>}
        {selection.editableCapabilities.includes("link") && <Field label="Link"><input value={attributes.href ?? ""} onChange={event => setAttributes(values => ({ ...values, href: event.target.value }))} onBlur={event => commitAttribute("href", event.target.value)}/></Field>}
        <Section title="AI actions"/>
        <div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>selectedContext("Rewrite and improve the text")} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium hover:bg-white/5"><Sparkles size={14}/>Generate text</button><button type="button" onClick={()=>selectedContext("Regenerate this complete section with richer content and a more polished composition")} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium hover:bg-white/5"><WandSparkles size={14}/>Regenerate section</button></div>
      </>}
      {tab === "Content" && <>
        <Section title="Connected component"/>
        <p className="text-xs leading-5 text-white/45">Connect this container to a live feed. Its child elements remain individually styleable.</p>
        <Field label="Source"><select value={source} onChange={event => setSource(event.target.value as ConnectedSource)} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5"><option value="none">Not connected</option><option value="cms">CMS collection</option><option value="blog">Blog feed</option><option value="products">ShopEZ products</option></select></Field>
        {source !== "none" && <>
          <Field label={source === "products" ? "Collection ID (optional)" : "Collection ID"}><input value={sourceId} onChange={event => setSourceId(event.target.value)} placeholder={source === "products" ? "All active products" : "Choose a CMS collection"}/></Field>
          <Field label="Display"><select value={presentation} onChange={event => setPresentation(event.target.value as ConnectedPresentation)} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5"><option value="grid">Grid</option><option value="list">List</option><option value="carousel">Carousel</option><option value="slider">Slider</option></select></Field>
          <Field label="Maximum items"><input type="number" min={1} max={100} value={limit} onChange={event => setLimit(Number(event.target.value))}/></Field>
        </>}
        <button disabled={disabled} onClick={() => void onPatch({ operation: "connection", source, sourceId, presentation, limit })} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium disabled:opacity-40">{source === "none" ? "Disconnect component" : "Save connection"}</button>
        <Section title="Child field mapping"/>
        <p className="text-xs leading-5 text-white/45">Select a title, image, price, excerpt, link, or other child inside the component and map it to a feed field.</p>
        <Field label="Field key"><input value={field} onChange={event => setField(event.target.value)} placeholder="title, image, price, excerpt…"/></Field>
        <button disabled={disabled} onClick={() => void onPatch({ operation: "field", field })} className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm font-medium disabled:opacity-40">{field ? "Save field mapping" : "Clear field mapping"}</button>
      </>}
      {tab === "Style" && <>
        <Section title="Display & position"/>
        <SelectStyle label="Display" name="display" value={styles.display} options={["block","inline","inline-block","flex","grid","none"]} onChange={(name,value) => { setStyles(current => ({...current,[name]:value})); commitStyle(name,value); }}/>
        <SelectStyle label="Position" name="position" value={styles.position} options={["static","relative","absolute","fixed","sticky"]} onChange={(name,value) => { setStyles(current => ({...current,[name]:value})); commitStyle(name,value); }}/>
        <Section title="Dimensions"/>
        <StyleGrid names={[["Width","width"],["Height","height"],["Min width","minWidth"],["Max width","maxWidth"],["Min height","minHeight"],["Max height","maxHeight"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <Section title="Flex & grid"/>
        <StyleGrid names={[["Gap","gap"],["Direction","flexDirection"],["Align","alignItems"],["Justify","justifyContent"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <Section title="Margin"/>
        <StyleGrid names={[["Top","marginTop"],["Right","marginRight"],["Bottom","marginBottom"],["Left","marginLeft"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <Section title="Padding"/>
        <StyleGrid names={[["Top","paddingTop"],["Right","paddingRight"],["Bottom","paddingBottom"],["Left","paddingLeft"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <div className="flex justify-center gap-3 rounded-lg bg-black/20 p-2 text-white/45"><Monitor size={15}/><Tablet size={15}/><Smartphone size={15}/></div>
      </>}
      {tab === "Style" && <>
        <Section title="Typography"/>
        <FontPicker value={styles.fontFamily} onChange={value=>{setStyles(current=>({...current,fontFamily:value}));commitStyle("fontFamily",value)}}/>
        <StyleGrid names={[["Font size","fontSize"],["Weight","fontWeight"],["Line height","lineHeight"],["Letter spacing","letterSpacing"],["Text align","textAlign"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <ColorControl label="Text color" value={styles.color} onChange={value=>{setStyles(current=>({...current,color:value}));commitStyle("color",value)}}/>
        <Section title="Background & border"/>
        <ColorControl label="Background color" value={styles.backgroundColor} onChange={value=>{setStyles(current=>({...current,backgroundColor:value}));commitStyle("backgroundColor",value)}}/>
        <R2ImageUpload siteId={siteId} label="Background image" value={cssImageUrl(styles.backgroundImage)} onChange={url=>{const value=url?`url("${url}")`:"";setStyles(current=>({...current,backgroundImage:value}));commitStyle("backgroundImage",value)}} purpose="builder-background" help="Choose from the site media library or upload a new background."/>
        <div className="grid grid-cols-2 gap-2"><SelectStyle label="Background size" name="backgroundSize" value={styles.backgroundSize} options={["cover","contain","auto","100% 100%"]} onChange={(name,value)=>{setStyles(current=>({...current,[name]:value}));commitStyle(name,value)}}/><SelectStyle label="Position" name="backgroundPosition" value={styles.backgroundPosition} options={["center","top","bottom","left","right"]} onChange={(name,value)=>{setStyles(current=>({...current,[name]:value}));commitStyle(name,value)}}/></div>
        <ColorControl label="Border color" value={styles.borderColor} onChange={value=>{setStyles(current=>({...current,borderColor:value}));commitStyle("borderColor",value)}}/>
        <StyleGrid names={[["Border width","borderWidth"],["Border style","borderStyle"],["Radius","borderRadius"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <Section title="Effects"/>
        <StyleGrid names={[["Shadow","boxShadow"],["Opacity","opacity"],["Overflow","overflow"],["Z-index","zIndex"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
      </>}
      {tab === "Advanced" && <><Field label="DOM ID"><input value={attributes.id ?? ""} onChange={event => setAttributes(values => ({ ...values, id: event.target.value }))} onBlur={event => commitAttribute("id", event.target.value)}/></Field><Field label="Class names"><textarea value={className} onChange={event => setClassName(event.target.value)} onBlur={() => className !== selection.className && void onPatch({ operation: "attribute", name: "className", value: className })} className="h-24"/></Field><div className="rounded-lg border border-white/10 bg-black/15 p-3 text-xs text-white/45"><div>ID: {selection.elementId}</div><div className="mt-1">Parent: {selection.parentElementId ?? "none"}</div><div className="mt-1">Anchor: {selection.sourceAnchor}</div></div><button onClick={onOpenSource} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2"><Code2 size={15}/>Open source</button></>}
    </div>}
    {selection && <button onClick={() => { setText(selection.textContent ?? ""); setRichHtml(selection.innerHTML ?? selection.textContent ?? ""); setClassName(selection.className ?? ""); setAttributes({ ...(selection.attributes ?? {}) }); setStyles({ ...(selection.computedStyleSummary ?? {}) }); }} className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"><RotateCcw size={13}/>Reset drafts</button>}
  </aside>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs text-white/55"><span className="mb-2 block font-medium text-white/75">{label}</span><span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-white/10 [&>input]:bg-black/20 [&>input]:p-2.5 [&>textarea]:w-full [&>textarea]:resize-none [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black/20 [&>textarea]:p-2.5">{children}</span></label>; }
function Section({ title }: { title: string }) { return <h3 className="border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-wider text-white/45">{title}</h3>; }
function StyleGrid({ names, values, setValues, commit }: { names: readonly (readonly [string, StyleProperty])[]; values: Record<string,string>; setValues: React.Dispatch<React.SetStateAction<Record<string,string>>>; commit(name: StyleProperty, value: string): void }) {
  return <div className="grid grid-cols-2 gap-2">{names.map(([label,name]) => <Field key={name} label={label}><input value={values[name] ?? ""} onChange={event => setValues(current => ({...current,[name]:event.target.value}))} onBlur={event => commit(name,event.target.value)}/></Field>)}</div>;
}
function SelectStyle({ label, name, value, options, onChange }: { label: string; name: StyleProperty; value?: string; options: string[]; onChange(name: StyleProperty,value:string): void }) {
  return <Field label={label}><select value={value ?? ""} onChange={event => onChange(name,event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5"><option value="">Default</option>{options.map(option => <option key={option}>{option}</option>)}</select></Field>;
}
const fontOptions = ["Inter","Arial","Helvetica","Georgia","Times New Roman","Garamond","Verdana","Trebuchet MS","Courier New","system-ui"];
function FontPicker({value,onChange}:{value?:string;onChange(value:string):void}) {
  return <Field label="Font family"><select value={value?.replace(/["']/g,"")||""} onChange={event=>onChange(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5"> <option value="">Inherited font</option>{fontOptions.map(font=><option key={font} value={font} style={{fontFamily:font}}>{font} — The quick brown fox</option>)}</select></Field>;
}
function ColorControl({label,value,onChange}:{label:string;value?:string;onChange(value:string):void}) {
  const hex = /^#[0-9a-f]{6}$/i.test(value||"") ? value! : "#000000";
  return <Field label={label}><span className="flex items-center gap-2"><input type="color" value={hex} onChange={event=>onChange(event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"/><input value={value??""} onChange={event=>onChange(event.target.value)} placeholder="#000000 or CSS color" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 p-2.5"/></span></Field>;
}
function ToolButton({label,onClick,children}:{label:string;onClick():void;children:React.ReactNode}) { return <button type="button" title={label} aria-label={label} onMouseDown={event=>event.preventDefault()} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white">{children}</button>; }
function cssImageUrl(value?:string) { return value?.match(/url\(["']?(.*?)["']?\)/)?.[1] || ""; }
function safeRichPreview(value:string) { return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\son\w+\s*=\s*(["']).*?\1/gi,"").replace(/javascript:/gi,""); }
