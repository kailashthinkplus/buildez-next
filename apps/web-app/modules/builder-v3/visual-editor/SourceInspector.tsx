"use client";
import { useEffect, useState } from "react";
import { Code2, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import type { BuilderSelection } from "./contracts";
import type { ConnectedPresentation, ConnectedSource, ElementPatch, StyleProperty } from "./sourcePatches";

const tabs = ["Content", "Data", "Layout", "Style", "Advanced"] as const;
export function SourceInspector({ selection, disabled, onPatch, onOpenSource }: {
  selection?: BuilderSelection; disabled?: boolean; onPatch(patch: ElementPatch): Promise<void>; onOpenSource(): void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Content");
  const [text, setText] = useState("");
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
  return <aside className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#15171c]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
    <div className="border-b border-white/10 px-4 py-3"><strong className="text-sm">{selection ? `${selection.tagName} · ${selection.kind}` : "Inspector"}</strong>{selection && <p className="mt-1 truncate text-[11px] text-white/35">{selection.sourceFile}</p>}</div>
    <div className="grid grid-cols-5 border-b border-white/10 text-[10px] text-white/55">{tabs.map(value => <button key={value} onClick={() => setTab(value)} className={`border-b-2 px-1 py-3 ${tab === value ? "border-blue-400 text-white" : "border-transparent hover:text-white"}`}>{value}</button>)}</div>
    {!selection ? <div className="p-4 text-sm leading-6 text-white/40">Select an element in Edit mode to inspect source-backed controls.</div> :
    <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4 text-sm">
      {tab === "Content" && <>
        {selection.editableCapabilities.includes("text") && <Field label="Text"><textarea value={text} onChange={event => setText(event.target.value)} onBlur={() => text !== selection.textContent && void onPatch({ operation: "text", value: text })} disabled={disabled} className="h-28"/></Field>}
        {selection.editableCapabilities.includes("image") && <><Field label="Image URL"><input value={attributes.src ?? ""} onChange={event => setAttributes(values => ({ ...values, src: event.target.value }))} onBlur={event => commitAttribute("src", event.target.value)}/></Field><Field label="Alt text"><input value={attributes.alt ?? ""} onChange={event => setAttributes(values => ({ ...values, alt: event.target.value }))} onBlur={event => commitAttribute("alt", event.target.value)}/></Field><button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium">Generate with AI</button></>}
        {selection.editableCapabilities.includes("link") && <Field label="Link"><input value={attributes.href ?? ""} onChange={event => setAttributes(values => ({ ...values, href: event.target.value }))} onBlur={event => commitAttribute("href", event.target.value)}/></Field>}
      </>}
      {tab === "Data" && <>
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
      {tab === "Layout" && <>
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
        <StyleGrid names={[["Font family","fontFamily"],["Font size","fontSize"],["Weight","fontWeight"],["Line height","lineHeight"],["Letter spacing","letterSpacing"],["Text align","textAlign"],["Color","color"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <Section title="Background & border"/>
        <StyleGrid names={[["Background","backgroundColor"],["Border color","borderColor"],["Border width","borderWidth"],["Border style","borderStyle"],["Radius","borderRadius"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
        <Section title="Effects"/>
        <StyleGrid names={[["Shadow","boxShadow"],["Opacity","opacity"],["Overflow","overflow"],["Z-index","zIndex"]]} values={styles} setValues={setStyles} commit={commitStyle}/>
      </>}
      {tab === "Advanced" && <><Field label="DOM ID"><input value={attributes.id ?? ""} onChange={event => setAttributes(values => ({ ...values, id: event.target.value }))} onBlur={event => commitAttribute("id", event.target.value)}/></Field><Field label="Class names"><textarea value={className} onChange={event => setClassName(event.target.value)} onBlur={() => className !== selection.className && void onPatch({ operation: "attribute", name: "className", value: className })} className="h-24"/></Field><div className="rounded-lg border border-white/10 bg-black/15 p-3 text-xs text-white/45"><div>ID: {selection.elementId}</div><div className="mt-1">Parent: {selection.parentElementId ?? "none"}</div><div className="mt-1">Anchor: {selection.sourceAnchor}</div></div><button onClick={onOpenSource} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2"><Code2 size={15}/>Open source</button></>}
    </div>}
    {selection && <button onClick={() => { setText(selection.textContent ?? ""); setClassName(selection.className ?? ""); setAttributes({ ...(selection.attributes ?? {}) }); setStyles({ ...(selection.computedStyleSummary ?? {}) }); }} className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"><RotateCcw size={13}/>Reset drafts</button>}
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
