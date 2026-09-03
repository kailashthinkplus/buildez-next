"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, ChevronDown, Code2, ImagePlus, Italic, Link2, Monitor, PanelRightClose, RotateCcw, Smartphone, Sparkles, Tablet, Type, WandSparkles } from "lucide-react";
import type { BuilderSelection } from "./contracts";
import { describeBuilderSelection } from "./selectionDescription";
import type { ConnectedPresentation, ConnectedSource, ElementPatch, StyleProperty, TypographyProperty } from "./sourcePatches";
import { R2ImageUpload } from "@/components/media/R2ImageUpload";
import {
  FONT_OPTIONS,
  SYSTEM_FONT_OPTIONS,
  isSystemFont,
  normalizeGoogleFontFamily,
  type GoogleFontItem,
} from "@/lib/googleFonts";

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
  function commitTypography(name: TypographyProperty, value: string) {
    if (!selection) return;
    const range = selection.textSelection;
    if (range && range.end > range.start && range.text) {
      void onPatch({ operation: "textStyle", name, value, selection: range });
      return;
    }
    commitStyle(name, value);
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
  return <aside className="flex h-full w-[360px] flex-col border-l border-white/10 bg-[#101216]/98 shadow-2xl shadow-black/50 backdrop-blur-2xl">
    <div className="border-b border-white/10 bg-[#0b0d11]/95 px-4 py-3 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-1 flex items-center gap-2"><span className="rounded border border-blue-400/25 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-blue-300">{selection?.tagName || "page"}</span><span className="truncate text-[10px] text-white/30">{selection?.className?.split(" ").filter(Boolean)[0] || "Canvas element"}</span></div><strong className="block truncate text-sm capitalize text-white">{description?.title || "Inspector"}</strong>{description && <p className="mt-1 text-[11px] text-white/40">{description.type} · Visual settings</p>}</div><button type="button" onClick={onCollapse} aria-label="Collapse inspector" title="Collapse inspector" className="rounded-lg p-1.5 text-white/45 hover:bg-white/10 hover:text-white"><PanelRightClose size={17}/></button></div>
      <div className="mt-3 grid grid-cols-3 rounded-lg border border-white/10 bg-black/25 p-1">{tabs.map(value => <button key={value} onClick={() => setTab(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${tab === value ? "bg-blue-500 text-white shadow" : "text-white/50 hover:text-white"}`}>{value}</button>)}</div>
    </div>
    {!selection ? <div className="p-4 text-sm leading-6 text-white/40">Select an element in Edit mode to inspect source-backed controls.</div> :
    <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3 text-sm [scrollbar-color:#343841_transparent]">
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
        {selection.editableCapabilities.includes("text") && (
          <div className={`rounded-xl border px-3 py-2.5 ${selection.textSelection?.text ? "border-violet-400/30 bg-violet-500/10" : "border-white/10 bg-white/[0.025]"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80"><Type size={14} className={selection.textSelection?.text ? "text-violet-300" : "text-white/40"}/>{selection.textSelection?.text ? "Formatting highlighted text" : "Formatting entire text element"}</div>
            {selection.textSelection?.text && <p className="mt-1 truncate text-[11px] text-violet-200/65">“{selection.textSelection.text}”</p>}
          </div>
        )}

        {selection.editableCapabilities.includes("text") && (
          <InspectorGroup title="Typography" defaultOpen>
            <FontPicker value={styles.fontFamily} onChange={value => { setStyles(current => ({ ...current, fontFamily: value })); commitTypography("fontFamily", value); }}/>
            <div className="grid grid-cols-2 gap-2">
              <FontSizeField value={styles.fontSize} onDraft={next => setStyles(current => ({ ...current, fontSize: next }))} commit={next => commitTypography("fontSize", next)}/>
              <FontWeightField value={styles.fontWeight} onDraft={next => setStyles(current => ({ ...current, fontWeight: next }))} commit={next => commitTypography("fontWeight", next)}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <UnitField label="Line height" value={styles.lineHeight} units={LINE_HEIGHT_UNITS} onDraft={next => setStyles(current => ({ ...current, lineHeight: next }))} commit={next => commitTypography("lineHeight", next)}/>
              <UnitField label="Letter spacing" value={styles.letterSpacing} units={LETTER_SPACING_UNITS} onDraft={next => setStyles(current => ({ ...current, letterSpacing: next }))} commit={next => commitTypography("letterSpacing", next)}/>
            </div>
            <Field label="Formatting">
              <span className="grid grid-cols-4 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                <FormatButton label="Bold" active={Number(styles.fontWeight) >= 600} onClick={() => { const value = Number(styles.fontWeight) >= 600 ? "400" : "700"; setStyles(current => ({ ...current, fontWeight: value })); commitTypography("fontWeight", value); }}><Bold size={15}/></FormatButton>
                <FormatButton label="Italic" active={styles.fontStyle === "italic"} onClick={() => { const value = styles.fontStyle === "italic" ? "normal" : "italic"; setStyles(current => ({ ...current, fontStyle: value })); commitTypography("fontStyle", value); }}><Italic size={15}/></FormatButton>
                <FormatButton label="Underline" active={styles.textDecoration?.includes("underline")} onClick={() => { const value = styles.textDecoration?.includes("underline") ? "none" : "underline"; setStyles(current => ({ ...current, textDecoration: value })); commitTypography("textDecoration", value); }}><span className="text-sm underline">U</span></FormatButton>
                <FormatButton label="Strike through" active={styles.textDecoration?.includes("line-through")} onClick={() => { const value = styles.textDecoration?.includes("line-through") ? "none" : "line-through"; setStyles(current => ({ ...current, textDecoration: value })); commitTypography("textDecoration", value); }}><span className="text-sm line-through">S</span></FormatButton>
              </span>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <SelectStyle label="Style" name="fontStyle" value={styles.fontStyle} options={["normal", "italic", "oblique"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitTypography(name as TypographyProperty, value); }}/>
              <SelectStyle label="Transform" name="textTransform" value={styles.textTransform} options={["none", "uppercase", "lowercase", "capitalize"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitTypography(name as TypographyProperty, value); }}/>
            </div>
            <Field label="Alignment">
              <span className="grid grid-cols-4 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                {[["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]].map(([value, Icon]) => (
                  <button key={value as string} type="button" onClick={() => { setStyles(current => ({ ...current, textAlign: value as string })); commitTypography("textAlign", value as string); }} className={`grid h-9 place-items-center border-r border-white/10 last:border-r-0 ${styles.textAlign === value ? "bg-blue-500 text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}><Icon size={15}/></button>
                ))}
              </span>
            </Field>
            <ColorControl label="Text color" value={styles.color} onChange={value => { setStyles(current => ({ ...current, color: value })); commitTypography("color", value); }}/>
          </InspectorGroup>
        )}

        <InspectorGroup title="Layout" defaultOpen={!selection.editableCapabilities.includes("text")}>
          <div className="grid grid-cols-2 gap-2">
            <SelectStyle label="Display" name="display" value={styles.display} options={["block", "inline", "inline-block", "flex", "grid", "none"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Position" name="position" value={styles.position} options={["static", "relative", "absolute", "fixed", "sticky"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <UnitField label="Width" value={styles.width} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, width: next }))} commit={next => commitStyle("width", next)}/>
            <UnitField label="Height" value={styles.height} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, height: next }))} commit={next => commitStyle("height", next)}/>
            <UnitField label="Min width" value={styles.minWidth} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, minWidth: next }))} commit={next => commitStyle("minWidth", next)}/>
            <UnitField label="Max width" value={styles.maxWidth} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, maxWidth: next }))} commit={next => commitStyle("maxWidth", next)}/>
            <UnitField label="Min height" value={styles.minHeight} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, minHeight: next }))} commit={next => commitStyle("minHeight", next)}/>
            <UnitField label="Max height" value={styles.maxHeight} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, maxHeight: next }))} commit={next => commitStyle("maxHeight", next)}/>
            <UnitField label="Gap" value={styles.gap} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, gap: next }))} commit={next => commitStyle("gap", next)}/>
            <SelectStyle label="Direction" name="flexDirection" value={styles.flexDirection} options={["row", "row-reverse", "column", "column-reverse"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Wrap" name="flexWrap" value={styles.flexWrap} options={["nowrap", "wrap", "wrap-reverse"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Align" name="alignItems" value={styles.alignItems} options={["stretch", "flex-start", "center", "flex-end", "baseline"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Self" name="alignSelf" value={styles.alignSelf} options={["auto", "stretch", "flex-start", "center", "flex-end", "baseline"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Justify" name="justifyContent" value={styles.justifyContent} options={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
          </div>
          <Field label="Grid columns"><input value={styles.gridTemplateColumns ?? ""} onChange={event => setStyles(current => ({ ...current, gridTemplateColumns: event.target.value }))} onBlur={event => commitStyle("gridTemplateColumns", event.target.value)} placeholder="e.g. 1fr 1fr 1fr"/></Field>
          <div className="flex justify-center gap-3 rounded-lg bg-black/20 p-2 text-white/45"><Monitor size={15}/><Tablet size={15}/><Smartphone size={15}/></div>
        </InspectorGroup>

        <InspectorGroup title="Spacing">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Margin</div>
          <div className="grid grid-cols-2 gap-2">
            <UnitField label="Top" value={styles.marginTop} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, marginTop: next }))} commit={next => commitStyle("marginTop", next)}/>
            <UnitField label="Right" value={styles.marginRight} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, marginRight: next }))} commit={next => commitStyle("marginRight", next)}/>
            <UnitField label="Bottom" value={styles.marginBottom} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, marginBottom: next }))} commit={next => commitStyle("marginBottom", next)}/>
            <UnitField label="Left" value={styles.marginLeft} units={LENGTH_UNITS_AUTO} onDraft={next => setStyles(current => ({ ...current, marginLeft: next }))} commit={next => commitStyle("marginLeft", next)}/>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Padding</div>
          <div className="grid grid-cols-2 gap-2">
            <UnitField label="Top" value={styles.paddingTop} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, paddingTop: next }))} commit={next => commitStyle("paddingTop", next)}/>
            <UnitField label="Right" value={styles.paddingRight} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, paddingRight: next }))} commit={next => commitStyle("paddingRight", next)}/>
            <UnitField label="Bottom" value={styles.paddingBottom} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, paddingBottom: next }))} commit={next => commitStyle("paddingBottom", next)}/>
            <UnitField label="Left" value={styles.paddingLeft} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, paddingLeft: next }))} commit={next => commitStyle("paddingLeft", next)}/>
          </div>
        </InspectorGroup>

        <InspectorGroup title="Background & border">
          <ColorControl label="Background color" value={styles.backgroundColor} onChange={value => { setStyles(current => ({ ...current, backgroundColor: value })); commitStyle("backgroundColor", value); }}/>
          <R2ImageUpload siteId={siteId} label="Background image" value={cssImageUrl(styles.backgroundImage)} onChange={url => { const value = url ? `url("${url}")` : ""; setStyles(current => ({ ...current, backgroundImage: value })); commitStyle("backgroundImage", value); }} purpose="builder-background" help="Choose from the site media library or upload a new background."/>
          <div className="grid grid-cols-2 gap-2">
            <SelectStyle label="Size" name="backgroundSize" value={styles.backgroundSize} options={["cover", "contain", "auto", "100% 100%"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Position" name="backgroundPosition" value={styles.backgroundPosition} options={["center", "top", "bottom", "left", "right"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
          </div>
          <ColorControl label="Border color" value={styles.borderColor} onChange={value => { setStyles(current => ({ ...current, borderColor: value })); commitStyle("borderColor", value); }}/>
          <div className="grid grid-cols-2 gap-2">
            <UnitField label="Width" value={styles.borderWidth} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, borderWidth: next }))} commit={next => commitStyle("borderWidth", next)}/>
            <SelectStyle label="Style" name="borderStyle" value={styles.borderStyle} options={["none", "solid", "dashed", "dotted", "double", "groove", "ridge"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <UnitField label="Radius" value={styles.borderRadius} units={LENGTH_UNITS} onDraft={next => setStyles(current => ({ ...current, borderRadius: next }))} commit={next => commitStyle("borderRadius", next)}/>
          </div>
        </InspectorGroup>

        <InspectorGroup title="Effects">
          <Field label="Shadow"><input value={styles.boxShadow ?? ""} onChange={event => setStyles(current => ({ ...current, boxShadow: event.target.value }))} onBlur={event => commitStyle("boxShadow", event.target.value)} placeholder="e.g. 0 4px 12px rgba(0,0,0,.25)"/></Field>
          <div className="grid grid-cols-2 gap-2">
            <OpacityField value={styles.opacity} onDraft={next => setStyles(current => ({ ...current, opacity: next }))} commit={next => commitStyle("opacity", next)}/>
            <IntegerField label="Z-index" value={styles.zIndex} onDraft={next => setStyles(current => ({ ...current, zIndex: next }))} commit={next => commitStyle("zIndex", next)}/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SelectStyle label="Overflow" name="overflow" value={styles.overflow} options={["visible", "hidden", "scroll", "auto"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
            <SelectStyle label="Cursor" name="cursor" value={styles.cursor} options={["default", "pointer", "text", "move", "grab", "not-allowed", "help", "wait", "crosshair", "zoom-in"]} onChange={(name, value) => { setStyles(current => ({ ...current, [name]: value })); commitStyle(name, value); }}/>
          </div>
          <Field label="Transform"><input value={styles.transform ?? ""} onChange={event => setStyles(current => ({ ...current, transform: event.target.value }))} onBlur={event => commitStyle("transform", event.target.value)} placeholder="e.g. rotate(4deg)"/></Field>
          <Field label="Filter"><input value={styles.filter ?? ""} onChange={event => setStyles(current => ({ ...current, filter: event.target.value }))} onBlur={event => commitStyle("filter", event.target.value)} placeholder="e.g. blur(4px)"/></Field>
        </InspectorGroup>
      </>}
      {tab === "Advanced" && <><Field label="DOM ID"><input value={attributes.id ?? ""} onChange={event => setAttributes(values => ({ ...values, id: event.target.value }))} onBlur={event => commitAttribute("id", event.target.value)}/></Field><Field label="Class names"><textarea value={className} onChange={event => setClassName(event.target.value)} onBlur={() => className !== selection.className && void onPatch({ operation: "attribute", name: "className", value: className })} className="h-24"/></Field><div className="rounded-lg border border-white/10 bg-black/15 p-3 text-xs text-white/45"><div>ID: {selection.elementId}</div><div className="mt-1">Parent: {selection.parentElementId ?? "none"}</div><div className="mt-1">Anchor: {selection.sourceAnchor}</div></div><button onClick={onOpenSource} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2"><Code2 size={15}/>Open source</button></>}
    </div>}
    {selection && <button onClick={() => { setText(selection.textContent ?? ""); setRichHtml(selection.innerHTML ?? selection.textContent ?? ""); setClassName(selection.className ?? ""); setAttributes({ ...(selection.attributes ?? {}) }); setStyles({ ...(selection.computedStyleSummary ?? {}) }); }} className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"><RotateCcw size={13}/>Reset drafts</button>}
  </aside>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs text-white/55"><span className="mb-2 block font-medium text-white/75">{label}</span><span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-white/10 [&>input]:bg-black/20 [&>input]:p-2.5 [&>textarea]:w-full [&>textarea]:resize-none [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black/20 [&>textarea]:p-2.5">{children}</span></label>; }
function Section({ title }: { title: string }) { return <h3 className="border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-wider text-white/45">{title}</h3>; }
function InspectorGroup({title,defaultOpen=false,children}:{title:string;defaultOpen?:boolean;children:React.ReactNode}) { return <details open={defaultOpen} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]"><summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-white/75 transition hover:bg-white/[0.035] [&::-webkit-details-marker]:hidden"><span className="flex items-center justify-between">{title}<span className="text-white/30 transition group-open:rotate-180">⌄</span></span></summary><div className="space-y-3 border-t border-white/10 p-3">{children}</div></details>; }
function SelectStyle({ label, name, value, options, onChange }: { label: string; name: StyleProperty; value?: string; options: string[]; onChange(name: StyleProperty,value:string): void }) {
  return <Field label={label}><select value={value ?? ""} onChange={event => onChange(name,event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5"><option value="">Default</option>{options.map(option => <option key={option}>{option}</option>)}</select></Field>;
}

/* ============================================================
   UNIT-AWARE LENGTH FIELDS
   Elementor/Webflow-style value + fixed-unit combo: only the
   number changes freely, the unit is always a constrained dropdown.
============================================================ */
const LENGTH_UNITS = ["px", "%", "em", "rem", "vh", "vw"] as const;
const LENGTH_UNITS_AUTO = [...LENGTH_UNITS, "auto"] as const;
const LINE_HEIGHT_UNITS = ["", "px", "em", "%"] as const;
const LETTER_SPACING_UNITS = ["px", "em", "rem"] as const;

function splitLengthValue(raw: string | undefined, units: readonly string[]) {
  const value = (raw ?? "").trim();
  const fallbackUnit = units.includes("px") ? "px" : (units[0] ?? "px");
  if (!value) return { number: "", unit: fallbackUnit, ok: true };
  if (units.includes("auto") && value === "auto") return { number: "", unit: "auto", ok: true };
  const match = value.match(/^(-?\d*\.?\d+)([a-zA-Z%]*)$/);
  if (!match) return { number: "", unit: "", ok: false };
  const [, number, suffix] = match;
  if (!units.includes(suffix)) return { number, unit: "", ok: false };
  return { number, unit: suffix, ok: true };
}

function UnitField({ label, value, units, onDraft, commit }: { label: string; value?: string; units: readonly string[]; onDraft(value: string): void; commit(value: string): void }) {
  const parsed = splitLengthValue(value, units);
  if (!parsed.ok) {
    // Complex values (calc(), var(), gradients, etc.) fall back to free text
    // rather than risk corrupting something this control can't represent.
    return <Field label={label}><input defaultValue={value ?? ""} onBlur={event => commit(event.target.value)}/></Field>;
  }
  const isAuto = parsed.unit === "auto";
  return <Field label={label}>
    <span className="flex overflow-hidden rounded-lg border border-white/10 bg-black/20 focus-within:border-blue-400">
      <input
        type="number"
        inputMode="decimal"
        disabled={isAuto}
        value={parsed.number}
        placeholder={isAuto ? "auto" : "0"}
        onChange={event => onDraft(isAuto ? "auto" : (event.target.value === "" ? "" : `${event.target.value}${parsed.unit}`))}
        onBlur={event => commit(isAuto ? "auto" : (event.target.value === "" ? "" : `${event.target.value}${parsed.unit}`))}
        className="w-0 min-w-0 flex-1 border-0 bg-transparent p-2.5 text-sm text-white outline-none disabled:text-white/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <select
        value={parsed.unit}
        onChange={event => {
          const nextUnit = event.target.value;
          const nextValue = nextUnit === "auto" ? "auto" : `${parsed.number || "0"}${nextUnit}`;
          onDraft(nextValue);
          commit(nextValue);
        }}
        className="shrink-0 border-l border-white/10 bg-white/[0.03] px-1.5 text-[11px] text-white/60 outline-none"
      >
        {units.map(unit => <option key={unit || "unitless"} value={unit}>{unit === "" ? "—" : unit}</option>)}
      </select>
    </span>
  </Field>;
}

function IntegerField({ label, value, onDraft, commit }: { label: string; value?: string; onDraft(value: string): void; commit(value: string): void }) {
  return <Field label={label}><input type="number" step={1} inputMode="numeric" value={value ?? ""} placeholder="auto" onChange={event => onDraft(event.target.value)} onBlur={event => commit(event.target.value)}/></Field>;
}

function opacityToPercent(raw?: string) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  const isPercent = value.endsWith("%");
  const num = Number(isPercent ? value.slice(0, -1) : value);
  if (Number.isNaN(num)) return "";
  const percent = isPercent ? num : (num <= 1 ? num * 100 : num);
  return String(Math.round(Math.min(100, Math.max(0, percent))));
}
function percentToOpacity(percent: string) {
  const num = Number(percent);
  if (Number.isNaN(num)) return "";
  return String(Math.round((Math.min(100, Math.max(0, num)) / 100) * 100) / 100);
}

function OpacityField({ value, onDraft, commit }: { value?: string; onDraft(value: string): void; commit(value: string): void }) {
  const percent = opacityToPercent(value);
  return <Field label="Opacity">
    <span className="flex items-center gap-2">
      <input type="range" min={0} max={100} value={percent || "100"} onChange={event => onDraft(percentToOpacity(event.target.value))} onMouseUp={event => commit(percentToOpacity((event.target as HTMLInputElement).value))} onTouchEnd={event => commit(percentToOpacity((event.target as HTMLInputElement).value))} className="h-1.5 flex-1 accent-blue-500"/>
      <span className="flex w-16 shrink-0 items-center overflow-hidden rounded-lg border border-white/10 bg-black/20">
        <input type="number" min={0} max={100} value={percent} onChange={event => onDraft(percentToOpacity(event.target.value))} onBlur={event => commit(percentToOpacity(event.target.value))} className="w-0 min-w-0 flex-1 border-0 bg-transparent p-2 text-sm text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"/>
        <span className="pr-1.5 text-[11px] text-white/40">%</span>
      </span>
    </span>
  </Field>;
}

/* ============================================================
   FONT SIZE / WEIGHT — fixed dropdown options, no free text
============================================================ */
const FONT_SIZE_PRESETS = ["10px","12px","14px","16px","18px","20px","24px","28px","32px","36px","40px","48px","56px","64px","72px","96px","128px"];
function FontSizeField({ value, onDraft, commit }: { value?: string; onDraft(value: string): void; commit(value: string): void }) {
  const current = (value ?? "").trim();
  const options = current && !FONT_SIZE_PRESETS.includes(current) ? [current, ...FONT_SIZE_PRESETS] : FONT_SIZE_PRESETS;
  return <Field label="Font size">
    <select value={current} onChange={event => { onDraft(event.target.value); commit(event.target.value); }} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5">
      <option value="">Default</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </Field>;
}

const FONT_WEIGHT_OPTIONS = [["100","Thin"],["200","Extra light"],["300","Light"],["400","Regular"],["500","Medium"],["600","Semibold"],["700","Bold"],["800","Extra bold"],["900","Black"]] as const;
function FontWeightField({ value, onDraft, commit }: { value?: string; onDraft(value: string): void; commit(value: string): void }) {
  return <Field label="Weight">
    <select value={value ?? ""} onChange={event => { onDraft(event.target.value); commit(event.target.value); }} className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5">
      <option value="">Default</option>
      {FONT_WEIGHT_OPTIONS.map(([weight, label]) => <option key={weight} value={weight}>{label} ({weight})</option>)}
    </select>
  </Field>;
}

/* ============================================================
   FONT PICKER — searchable dropdown with live font-rendered
   preview per option, backed by Google Fonts.
============================================================ */
const FONT_PREVIEW_WEIGHTS = ["400", "500", "600", "700"];
function buildGoogleFontsUrl(families: string[]) {
  const params = families.map(family => `family=${normalizeGoogleFontFamily(family).replace(/\s+/g, "+")}:wght@${FONT_PREVIEW_WEIGHTS.join(";")}`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
function loadGoogleFont(family: string) {
  const normalized = normalizeGoogleFontFamily(family);
  if (!normalized || isSystemFont(normalized)) return;
  const id = `buildez-inspector-font-${normalized.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = buildGoogleFontsUrl([normalized]);
  document.head.appendChild(link);
}
function loadGoogleFontPreviewBatch(families: string[]) {
  const list = Array.from(new Set(families.filter(family => family && !isSystemFont(family)))).slice(0, 40);
  if (!list.length) return;
  const id = "buildez-inspector-font-preview-batch";
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = buildGoogleFontsUrl(list);
}

function FontPicker({ value, onChange }: { value?: string; onChange(value: string): void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState<GoogleFontItem[]>(FONT_OPTIONS);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = normalizeGoogleFontFamily(value || "");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fonts/google").then(response => response.json()).then(data => {
      if (cancelled || !Array.isArray(data?.fonts)) return;
      setFonts([...SYSTEM_FONT_OPTIONS, ...data.fonts]);
    }).catch(() => { if (!cancelled) setFonts(FONT_OPTIONS); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (current) loadGoogleFont(current); }, [current]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const seen = new Set<string>();
    return fonts.filter(font => {
      const family = normalizeGoogleFontFamily(font.family);
      const key = family.toLowerCase();
      if (!family || seen.has(key)) return false;
      seen.add(key);
      return !query || key.includes(query);
    });
  }, [fonts, search]);

  useEffect(() => {
    if (!open) return;
    loadGoogleFontPreviewBatch(filtered.map(font => normalizeGoogleFontFamily(font.family)));
  }, [open, filtered]);

  function select(family: string) {
    const normalized = normalizeGoogleFontFamily(family);
    if (normalized) loadGoogleFont(normalized);
    onChange(normalized);
    setOpen(false);
    setSearch("");
  }

  return <Field label="Font family">
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/20 p-2.5 text-left text-sm text-white" style={{ fontFamily: current && !isSystemFont(current) ? current : undefined }}>
        <span className="truncate">{current || "Inherited font"}</span>
        <ChevronDown size={14} className="shrink-0 text-white/40"/>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0b0d11] shadow-2xl shadow-black/50">
          <div className="border-b border-white/10 p-2">
            <input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search fonts…" className="w-full rounded-md border border-white/10 bg-black/25 px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-400"/>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            <button type="button" onClick={() => select("")} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs ${!current ? "bg-blue-500/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>Inherited font</button>
            {filtered.map(font => {
              const family = normalizeGoogleFontFamily(font.family);
              const selected = family === current;
              return <button key={family} type="button" onClick={() => select(family)} className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm ${selected ? "bg-blue-500/20 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`} style={{ fontFamily: isSystemFont(family) ? undefined : family }}>
                <span className="truncate">{family}</span>
                {font.category && <span className="shrink-0 text-[10px] capitalize text-white/30">{font.category}</span>}
              </button>;
            })}
            {filtered.length === 0 && <div className="px-2.5 py-6 text-center text-xs text-white/35">No fonts found</div>}
          </div>
        </div>
      )}
    </div>
  </Field>;
}
function ColorControl({label,value,onChange}:{label:string;value?:string;onChange(value:string):void}) {
  const hex = /^#[0-9a-f]{6}$/i.test(value||"") ? value! : "#000000";
  return <Field label={label}><span className="flex items-center gap-2"><input type="color" value={hex} onChange={event=>onChange(event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"/><input value={value??""} onChange={event=>onChange(event.target.value)} placeholder="#000000 or CSS color" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 p-2.5"/></span></Field>;
}
function ToolButton({label,onClick,children}:{label:string;onClick():void;children:React.ReactNode}) { return <button type="button" title={label} aria-label={label} onMouseDown={event=>event.preventDefault()} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white">{children}</button>; }
function FormatButton({label,active,onClick,children}:{label:string;active?:boolean;onClick():void;children:React.ReactNode}) { return <button type="button" title={label} aria-label={label} onClick={onClick} className={`grid h-9 place-items-center border-r border-white/10 last:border-r-0 ${active?"bg-blue-500 text-white":"text-white/45 hover:bg-white/5 hover:text-white"}`}>{children}</button>; }
function cssImageUrl(value?:string) { return value?.match(/url\(["']?(.*?)["']?\)/)?.[1] || ""; }
function safeRichPreview(value:string) { return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\son\w+\s*=\s*(["']).*?\1/gi,"").replace(/javascript:/gi,""); }
