"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

/**
 * A compact, theme-aware WYSIWYG editor for dashboard content fields (blog
 * posts, etc.) — same TipTap extensions as the builder's SimpleTipTapEditor,
 * but styled with the dashboard's light/dark CSS variables instead of that
 * component's hardcoded dark palette.
 */
export default function DashboardRichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange(value: string): void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "dashboard-rich-text min-h-[220px] rounded-b-xl px-3 py-2.5 text-sm outline-none",
      },
    },
    onUpdate({ editor: instance }) {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border dashboard-border">
      <div className="flex flex-wrap gap-0.5 border-b dashboard-border bg-[var(--dashboard-surface)] p-1.5">
        <ToolbarButton icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold" />
        <ToolbarButton icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic" />
        <ToolbarButton icon={UnderlineIcon} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} label="Underline" />
        <Divider />
        <ToolbarButton icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading" />
        <ToolbarButton icon={Heading3} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="Subheading" />
        <Divider />
        <ToolbarButton icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bulleted list" />
        <ToolbarButton icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list" />
        <ToolbarButton icon={Quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote" />
        <Divider />
        <ToolbarButton
          icon={LinkIcon}
          active={editor.isActive("link")}
          label="Link"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        />
        <Divider />
        <ToolbarButton icon={Undo} onClick={() => editor.chain().focus().undo().run()} label="Undo" />
        <ToolbarButton icon={Redo} onClick={() => editor.chain().focus().redo().run()} label="Redo" />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  onClick,
  active,
  label,
}: {
  icon: typeof Bold;
  onClick(): void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md transition ${
        active ? "bg-blue-600 text-white" : "dashboard-muted dashboard-hover"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px border-l dashboard-border" />;
}
