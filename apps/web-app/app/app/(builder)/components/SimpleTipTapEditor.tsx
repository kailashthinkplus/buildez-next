"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  SquareCode,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Eraser,
} from "lucide-react";

interface SimpleTipTapEditorProps {
  value: string;
  onChange(value: string): void;
}

export default function SimpleTipTapEditor({
  value,
  onChange,
}: SimpleTipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // ✅ SSR SAFE
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] rounded-md border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-white/30",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  /* ----------------------------------------------------------
     KEEP CONTENT IN SYNC (AI / UNDO / EXTERNAL)
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {/* ================= TOOLBAR ================= */}
      <div className="flex flex-wrap gap-1 rounded-md border border-white/10 bg-black/40 p-1">
        {/* MARKS */}
        <IconBtn icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <IconBtn icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <IconBtn icon={UnderlineIcon} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <IconBtn icon={Strikethrough} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />

        <Divider />

        {/* HEADINGS */}
        <IconBtn icon={Heading1} active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <IconBtn icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <IconBtn icon={Heading3} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <IconBtn icon={Heading4} active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} />
        <IconBtn icon={Heading5} active={editor.isActive("heading", { level: 5 })} onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} />
        <IconBtn icon={Heading6} active={editor.isActive("heading", { level: 6 })} onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} />
        <IconBtn icon={Pilcrow} active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} />

        <Divider />

        {/* ALIGN */}
        <IconBtn icon={AlignLeft} active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <IconBtn icon={AlignCenter} active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <IconBtn icon={AlignRight} active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
        <IconBtn icon={AlignJustify} active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} />

        <Divider />

        {/* LISTS */}
        <IconBtn icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <IconBtn icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />

        <Divider />

        {/* BLOCKS */}
        <IconBtn icon={Quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <IconBtn icon={Code} active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
        <IconBtn icon={SquareCode} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <IconBtn icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} />

        <Divider />

        {/* LINK */}
        <IconBtn
          icon={LinkIcon}
          active={editor.isActive("link")}
          onClick={() => {
            const url = prompt("Enter URL");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        />
        <IconBtn icon={Unlink} onClick={() => editor.chain().focus().unsetLink().run()} />

        <Divider />

        {/* HISTORY */}
        <IconBtn icon={Undo} onClick={() => editor.chain().focus().undo().run()} />
        <IconBtn icon={Redo} onClick={() => editor.chain().focus().redo().run()} />

        <Divider />

        {/* CLEAR */}
        <IconBtn icon={Eraser} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
      </div>

      {/* ================= EDITOR ================= */}
      <EditorContent editor={editor} />
    </div>
  );
}

/* ============================================================
   UI PRIMITIVES
============================================================ */

function IconBtn({
  icon: Icon,
  onClick,
  active,
}: {
  icon: any;
  onClick(): void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-8 w-8              /* ⬅ smaller button */
        flex items-center justify-center
        rounded
        transition
        ${
          active
            ? "bg-blue-600 text-white"
            : "text-white/70 hover:bg-white/10"
        }
      `}
    >
      <Icon size={13} />     {/* ⬅ smaller icon */}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-white/10" />;
}
