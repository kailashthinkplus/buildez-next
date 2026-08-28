"use client";
import { Bot, ChevronUp, Code2, Copy, Eye, Image, MoreHorizontal, Trash2 } from "lucide-react";
import type { BuilderSelection } from "./contracts";

export function NodeToolbar({ selection, onAction }: { selection: BuilderSelection; onAction(action: string): void }) {
  const image = selection.editableCapabilities.includes("image");
  const actions = [
    ["parent", ChevronUp, "Select parent", true], ["duplicate", Copy, "Duplicate (source transform unavailable)", false],
    ["hide", Eye, "Hide or show (source strategy unavailable)", false], ["source", Code2, "Open source", true],
    ["ai", Bot, "AI edit", true], ...(image ? [["image", Image, "Generate or replace image", true] as const] : []),
    ["delete", Trash2, "Delete (source transform unavailable)", false], ["more", MoreHorizontal, "More options", false],
  ] as const;
  const placeBelow = selection.bounds.top < 54;
  const top = placeBelow
    ? selection.bounds.top + selection.bounds.height + 8
    : selection.bounds.top - 46;
  return <div role="toolbar" aria-label={`Actions for ${selection.tagName}`} style={{ left: `clamp(8px, ${selection.bounds.left}px, calc(100% - 428px))`, top, maxWidth: "calc(100% - 16px)" }} className="absolute z-[160] flex w-max items-center overflow-x-auto rounded-lg border border-blue-300/30 bg-[#151923]/95 text-white shadow-2xl backdrop-blur-xl [scrollbar-width:none]">
    <span className="border-r border-white/10 px-3 py-2 text-xs font-semibold text-blue-200">{selection.tagName}</span>
    {actions.map(([id, Icon, label, available]) => <button key={id} disabled={!available} onClick={() => onAction(id)} title={label} aria-label={label} className={`p-2.5 disabled:cursor-not-allowed disabled:opacity-25 ${available ? "hover:bg-white/10" : ""} ${id === "delete" ? "text-red-300" : "text-white/65 hover:text-white"}`}><Icon size={15}/></button>)}
  </div>;
}
