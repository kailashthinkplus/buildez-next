"use client";
import { useEffect, useState } from "react";
import { Code2, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import type { BuilderSelection } from "./contracts";
import type { ElementPatch } from "./sourcePatches";

const tabs = ["Content", "Layout", "Style", "Advanced"] as const;
export function SourceInspector({ selection, disabled, onPatch, onOpenSource }: {
  selection?: BuilderSelection; disabled?: boolean; onPatch(patch: ElementPatch): Promise<void>; onOpenSource(): void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Content");
  const [text, setText] = useState("");
  const [className, setClassName] = useState("");
  useEffect(() => { setText(selection?.textContent ?? ""); setClassName(selection?.className ?? ""); }, [selection]);
  return <aside className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#15171c]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
    <div className="border-b border-white/10 px-4 py-3"><strong className="text-sm">{selection ? `${selection.tagName} · ${selection.kind}` : "Inspector"}</strong>{selection && <p className="mt-1 truncate text-[11px] text-white/35">{selection.sourceFile}</p>}</div>
    <div className="grid grid-cols-4 border-b border-white/10 text-[11px] text-white/55">{tabs.map(value => <button key={value} onClick={() => setTab(value)} className={`border-b-2 px-1 py-3 ${tab === value ? "border-blue-400 text-white" : "border-transparent hover:text-white"}`}>{value}</button>)}</div>
    {!selection ? <div className="p-4 text-sm leading-6 text-white/40">Select an element in Edit mode to inspect source-backed controls.</div> :
    <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4 text-sm">
      {tab === "Content" && <>
        {selection.editableCapabilities.includes("text") && <Field label="Text"><textarea value={text} onChange={event => setText(event.target.value)} onBlur={() => text !== selection.textContent && void onPatch({ operation: "text", value: text })} disabled={disabled} className="h-28"/></Field>}
        {selection.editableCapabilities.includes("image") && <><Field label="Image URL"><input defaultValue="" onBlur={event => event.target.value && void onPatch({ operation: "attribute", name: "src", value: event.target.value })}/></Field><Field label="Alt text"><input onBlur={event => void onPatch({ operation: "attribute", name: "alt", value: event.target.value })}/></Field><button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium">Generate with AI</button></>}
        {selection.editableCapabilities.includes("link") && <Field label="Link"><input onBlur={event => void onPatch({ operation: "attribute", name: "href", value: event.target.value })}/></Field>}
      </>}
      {tab === "Layout" && <><Section title="Display & dimensions"/><DisabledControl label="Display" value="Source-defined"/><DisabledControl label="Width" value="Auto"/><Section title="Spacing"/><DisabledControl label="Margin" value="Project classes"/><DisabledControl label="Padding" value="Project classes"/><div className="flex justify-center gap-1 rounded-lg bg-black/20 p-1"><Monitor size={15}/><Tablet size={15}/><Smartphone size={15}/></div></>}
      {tab === "Style" && <><Section title="Typography"/><DisabledControl label="Font & color" value="Edit class names"/><Section title="Background & border"/><DisabledControl label="Background" value="Project classes"/><DisabledControl label="Border" value="Project classes"/></>}
      {tab === "Advanced" && <><Field label="DOM ID"><input onBlur={event => void onPatch({ operation: "attribute", name: "id", value: event.target.value })}/></Field><Field label="Class names"><textarea value={className} onChange={event => setClassName(event.target.value)} onBlur={() => className !== selection.className && void onPatch({ operation: "attribute", name: "className", value: className })} className="h-24"/></Field><div className="rounded-lg border border-white/10 bg-black/15 p-3 text-xs text-white/45"><div>ID: {selection.elementId}</div><div className="mt-1">Anchor: {selection.sourceAnchor}</div></div><button onClick={onOpenSource} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2"><Code2 size={15}/>Open source</button></>}
    </div>}
    {selection && <button onClick={() => { setText(selection.textContent ?? ""); setClassName(selection.className ?? ""); }} className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"><RotateCcw size={13}/>Reset drafts</button>}
  </aside>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs text-white/55"><span className="mb-2 block font-medium text-white/75">{label}</span><span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-white/10 [&>input]:bg-black/20 [&>input]:p-2.5 [&>textarea]:w-full [&>textarea]:resize-none [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black/20 [&>textarea]:p-2.5">{children}</span></label>; }
function Section({ title }: { title: string }) { return <h3 className="border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-wider text-white/45">{title}</h3>; }
function DisabledControl({ label, value }: { label: string; value: string }) { return <div title="This control is unavailable until its source strategy is detected" className="flex justify-between rounded-lg border border-white/5 bg-white/[0.025] p-2.5 text-xs text-white/35"><span>{label}</span><span>{value}</span></div>; }
