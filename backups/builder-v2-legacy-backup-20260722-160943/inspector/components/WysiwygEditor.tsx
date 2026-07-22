"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Underline,
} from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange(value: string): void;
}

export default function WysiwygEditor({
  value,
  onChange,
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [showLinkField, setShowLinkField] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const run = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-md border border-white/10 bg-black/35 p-1">
        <IconButton label="Bold" icon={Bold} onClick={() => run("bold")} />
        <IconButton label="Italic" icon={Italic} onClick={() => run("italic")} />
        <IconButton label="Underline" icon={Underline} onClick={() => run("underline")} />
        <Divider />
        <IconButton label="Paragraph" icon={Pilcrow} onClick={() => run("formatBlock", "p")} />
        <IconButton label="Heading 1" icon={Heading1} onClick={() => run("formatBlock", "h1")} />
        <IconButton label="Heading 2" icon={Heading2} onClick={() => run("formatBlock", "h2")} />
        <IconButton label="Heading 3" icon={Heading3} onClick={() => run("formatBlock", "h3")} />
        <Divider />
        <IconButton label="Align left" icon={AlignLeft} onClick={() => run("justifyLeft")} />
        <IconButton label="Align center" icon={AlignCenter} onClick={() => run("justifyCenter")} />
        <IconButton label="Align right" icon={AlignRight} onClick={() => run("justifyRight")} />
        <IconButton label="Justify" icon={AlignJustify} onClick={() => run("justifyFull")} />
        <Divider />
        <IconButton label="Bullet list" icon={List} onClick={() => run("insertUnorderedList")} />
        <IconButton label="Numbered list" icon={ListOrdered} onClick={() => run("insertOrderedList")} />
        <IconButton
          label="Link"
          icon={Link}
          onClick={() => setShowLinkField((visible) => !visible)}
        />
      </div>

      {showLinkField && (
        <div className="flex gap-2 rounded-md border border-white/10 bg-black/25 p-2">
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://example.com"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
          />
          <button
            type="button"
            onClick={() => {
              const url = linkUrl.trim();
              if (!url) return;
              run("createLink", url);
              setLinkUrl("");
              setShowLinkField(false);
            }}
            className="rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
          >
            Apply
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="min-h-40 rounded-md border border-white/10 bg-white/[0.05] p-3 text-sm leading-6 text-white outline-none transition focus:border-blue-400/60"
      />
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white"
    >
      <Icon size={14} aria-hidden />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-white/10" />;
}
