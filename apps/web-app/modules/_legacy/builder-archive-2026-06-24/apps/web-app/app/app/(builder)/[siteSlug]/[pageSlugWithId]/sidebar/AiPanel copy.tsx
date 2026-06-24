"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  Loader2,
  Bot,
  Paperclip,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface AiMessage {
  role: "user" | "assistant";
  text: string;
}

type AIDesignPhase = "discovery" | "confirm" | "compile" | "done";

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "figma" | "other";
  file?: File;
  url?: string;
}

interface AIDesignState {
  phase: AIDesignPhase;
  answers: {
    websiteCategory?: string;
    industry?: string;
    visualStyle?: string;
    imageStyle?: string;
    pages?: string[];
  };
  attachments: Attachment[];
}

interface AiPanelProps {
  page: any;
  onRunAI: (prompt: string, context?: any) => Promise<void>;
  pageId: string;
}

/* ============================================================
   AI CHAT SESSIONS (MULTI-CHAT SUPPORT)
============================================================ */

interface AIChatSession {
  id: string;
  messages: AiMessage[];
  designState: AIDesignState;
  createdAt: number;
}

interface AIChatStore {
  activeChatId: string;
  chats: Record<string, AIChatSession>;
}


/* ============================================================
   CONSTANTS (STATIC WEBSITES ONLY)
============================================================ */

const WEBSITE_CATEGORIES = [
  "Business Website",
  "Landing Page",
  "Portfolio",
  "Agency Website",
  "Personal Website",
  "Brochure Website",
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Real Estate",
  "Education",
  "Finance",
  "Retail",
  "Hospitality",
  "Manufacturing",
  "Creative / Design",
  "Consulting",
  "Fitness & Wellness",
  "Legal",
  "Non-Profit",
  "Travel",
  "Food & Restaurant",
];

const VISUAL_STYLES = ["Minimal", "Modern", "Bold", "Luxury"];

const IMAGE_STYLES = [
  "Real Photography",
  "Illustrations",
  "3D / Abstract",
  "Mixed",
];

const PAGES = ["Home", "About", "Services", "Pricing", "Contact"];

/* ============================================================
   STORAGE
============================================================ */

const aiStorageKey = (pageId: string) =>
  `buildez-ai-chats:${pageId}`;

function defaultWelcome(): AiMessage[] {
  return [
    {
      role: "assistant",
      text:
        "I’ll help you design a modern, high-quality static website. You can also upload Figma files, brand docs, or screenshots to guide the design.",
    },
  ];
}

/* ============================================================
   CHAT SESSION HELPERS (MULTI-CHAT)
============================================================ */

function createNewChatSession(): AIChatSession {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    messages: defaultWelcome(),
    designState: {
      phase: "discovery",
      answers: {},
      attachments: [],
    },
  };
}

function createInitialChatStore(): AIChatStore {
  const session = createNewChatSession();

  return {
    activeChatId: session.id,
    chats: {
      [session.id]: session,
    },
  };
}

function loadChatStore(pageId: string): AIChatStore {
  const raw = localStorage.getItem(aiStorageKey(pageId));

  // ----------------------------------------------------------
  // No storage → fresh store
  // ----------------------------------------------------------
  if (!raw) {
    return createInitialChatStore();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AIChatStore>;

    // ----------------------------------------------------------
    // SHAPE VALIDATION (CRITICAL)
    // ----------------------------------------------------------
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.activeChatId ||
      typeof parsed.activeChatId !== "string" ||
      !parsed.chats ||
      typeof parsed.chats !== "object"
    ) {
      return createInitialChatStore();
    }

    // ----------------------------------------------------------
    // ACTIVE CHAT MUST EXIST
    // ----------------------------------------------------------
    const activeChat = parsed.chats[parsed.activeChatId];

    if (
      !activeChat ||
      typeof activeChat !== "object" ||
      !Array.isArray(activeChat.messages) ||
      !activeChat.designState ||
      typeof activeChat.designState !== "object"
    ) {
      return createInitialChatStore();
    }

    // ----------------------------------------------------------
    // DESIGN STATE INVARIANTS (FORWARD SAFE)
    // ----------------------------------------------------------
    const normalizedChats: Record<string, AIChatSession> = {};

    for (const [id, chat] of Object.entries(parsed.chats)) {
      if (
        !chat ||
        typeof chat !== "object" ||
        !Array.isArray(chat.messages)
      ) {
        continue;
      }

      normalizedChats[id] = {
        id,
        createdAt:
          typeof (chat as any).createdAt === "number"
            ? (chat as any).createdAt
            : Date.now(),

        messages: chat.messages,

        designState: {
          phase:
            (chat as any).designState?.phase ??
            "discovery",

          answers:
            (chat as any).designState?.answers ??
            {},

          attachments:
            Array.isArray(
              (chat as any).designState?.attachments
            )
              ? (chat as any).designState.attachments
              : [],
        },
      };
    }

    // ----------------------------------------------------------
    // FINAL SAFETY: ensure active chat still exists
    // ----------------------------------------------------------
    if (!normalizedChats[parsed.activeChatId]) {
      return createInitialChatStore();
    }

    return {
      activeChatId: parsed.activeChatId,
      chats: normalizedChats,
    };
  } catch (err) {
    console.warn(
      "[AI PANEL] Failed to restore chat store, resetting",
      err
    );
    return createInitialChatStore();
  }
}

function persistChatStore(
  pageId: string,
  store: AIChatStore
) {
  localStorage.setItem(
    aiStorageKey(pageId),
    JSON.stringify(store)
  );
}

/* ============================================================
   UI HELPERS
============================================================ */

function PillOptions({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: string[];
  selected?: string | string[];
  onSelect: (value: any) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((opt) => {
        const isActive = multi
          ? Array.isArray(selected) && selected.includes(opt)
          : selected === opt;

        return (
          <button
            key={opt}
            onClick={() => {
              if (multi) {
                const current = Array.isArray(selected)
                  ? selected
                  : [];
                onSelect(
                  isActive
                    ? current.filter((v) => v !== opt)
                    : [...current, opt]
                );
              } else {
                onSelect(opt);
              }
            }}
            className={`px-4 py-1.5 rounded-full text-xs border transition
              ${
                isActive
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function AutocompleteInput({
  options,
  value,
  onSelect,
  placeholder,
}: {
  options: string[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState(value || "");

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative mt-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-white/40"
      />

      {query && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-black border border-white/10 rounded-lg max-h-40 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setQuery(opt);
                onSelect(opt);
              }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   AI PANEL
============================================================ */

export default function AiPanel({
  page,
  onRunAI,
  pageId,
}: AiPanelProps) {
  const [chatStore, setChatStore] = useState<AIChatStore>(() =>
    createInitialChatStore()
  );

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

    /* ============================================================
     DEFENSIVE RENDER GUARD (CRITICAL SAFETY)
  ============================================================ */

  if (
    !chatStore ||
    !chatStore.activeChatId ||
    !chatStore.chats
  ) {
    return null;
  }

  const activeChat =
  chatStore.chats[chatStore.activeChatId] ??
  createNewChatSession();

const messages = activeChat.messages;
const designState = activeChat.designState;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ============================================================
   AUTO PHASE → CONFIRM (ENABLE SUBMIT)
============================================================ */

useEffect(() => {
  if (!chatStore) return;

  const chat = chatStore.chats[chatStore.activeChatId];
  if (!chat) return;

  const hasInput =
    input.trim().length > 0 ||
    chat.designState.attachments.length > 0;

  if (
    hasInput &&
    chat.designState.phase === "discovery"
  ) {
    setChatStore((prev) => {
      if (!prev) return prev;

      const c = prev.chats[prev.activeChatId];

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [prev.activeChatId]: {
            ...c,
            designState: {
              ...c.designState,
              phase: "confirm",
            },
          },
        },
      };
    });
  }
}, [input, chatStore]);

  /* ============================================================
   NEW CHAT HANDLER
============================================================ */

function handleNewChat() {
  setChatStore((prev) => {
    const session = createNewChatSession();

    return {
      activeChatId: session.id,
      chats: {
        ...prev.chats,
        [session.id]: session,
      },
    };
  });
}

/* ============================================================
   RESTORE CHAT STORE (PER PAGE)
============================================================ */

useEffect(() => {
  const restored = loadChatStore(pageId);
  setChatStore(restored);
}, [pageId]);

/* ============================================================
   PERSIST CHAT (MESSAGES + DESIGN STATE)
============================================================ */

useEffect(() => {
  persistChatStore(pageId, chatStore);
}, [chatStore, pageId]);


function handleFileUpload(files: FileList | null) {
  if (!files || !chatStore) return;

  const activeChatId = chatStore.activeChatId;
  const activeChat = chatStore.chats[activeChatId];
  if (!activeChat) return;

  const newAttachments: Attachment[] = Array.from(files).map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    file,
    type: detectAttachmentType(file),
  }));

  setChatStore((prev) => {
    if (!prev) return prev;

    const chat = prev.chats[activeChatId];

    return {
      ...prev,
      chats: {
        ...prev.chats,
        [activeChatId]: {
          ...chat,
          designState: {
            ...chat.designState,
            attachments: [
              ...(chat.designState.attachments || []),
              ...newAttachments,
            ],
          },
          messages: [
            ...chat.messages,
            {
              role: "user",
              text: `Uploaded ${newAttachments.length} file(s) for design reference.`,
            },
          ],
        },
      },
    };
  });
}

  /* ============================================================
     PROMPT BUILDING
  ============================================================ */

  function buildFinalPrompt() {
    const a = designState.answers;

    return `
Create a HIGH-QUALITY, MODERN STATIC MARKETING WEBSITE.

STRICT CONSTRAINTS:
- Static front-end only
- No dashboards
- No applications
- No admin panels
- No authentication
- No data tables

WEBSITE TYPE:
${a.websiteCategory}

INDUSTRY:
${a.industry}

VISUAL STYLE:
${a.visualStyle}

IMAGE STYLE:
${a.imageStyle}

PAGES:
${a.pages?.join(", ")}

DESIGN GUIDELINES:
- Large hero sections
- Grid-based layouts
- Clean spacing
- Strong typography hierarchy
- Professional marketing aesthetic
`;
  }

/* ============================================================
   BUILD (CANONICAL — FIXED)
============================================================ */

async function handleRegenerate() {
  if (!page || !chatStore || isTyping) return;

  const activeChatId = chatStore.activeChatId;
  const chat = chatStore.chats[activeChatId];
  if (!chat) return;

  console.log("[AI PANEL] Regenerate triggered");

  // ✅ SNAPSHOT FIRST (CRITICAL)
  const attachmentsSnapshot = chat.designState.attachments.map((a) => ({
    name: a.name,
    type: a.type,
  }));

  setIsTyping(true);

  // 1️⃣ MOVE TO COMPILE + SYSTEM MESSAGE
  setChatStore((prev) => {
    if (!prev) return prev;
    const c = prev.chats[activeChatId];

    return {
      ...prev,
      chats: {
        ...prev.chats,
        [activeChatId]: {
          ...c,
          designState: { ...c.designState, phase: "compile" },
          messages: [
            ...c.messages,
            { role: "assistant", text: "Regenerating design…" },
          ],
        },
      },
    };
  });

  try {
    await onRunAI(buildFinalPrompt(), {
      regenerate: true,
      attachments: attachmentsSnapshot,
    });

    // 2️⃣ SUCCESS → DONE
    setChatStore((prev) => {
      if (!prev) return prev;
      const c = prev.chats[activeChatId];

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [activeChatId]: {
            ...c,
            designState: { ...c.designState, phase: "done" },
            messages: [
              ...c.messages,
              {
                role: "assistant",
                text: "Here’s an improved version. Want another variation?",
              },
            ],
          },
        },
      };
    });
  } catch (err) {
    console.error("[AI PANEL] Regenerate failed", err);

    // 3️⃣ FAILURE → CONFIRM
    setChatStore((prev) => {
      if (!prev) return prev;
      const c = prev.chats[activeChatId];

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [activeChatId]: {
            ...c,
            designState: { ...c.designState, phase: "confirm" },
            messages: [
              ...c.messages,
              {
                role: "assistant",
                text: "Regeneration failed. Try again.",
              },
            ],
          },
        },
      };
    });
  } finally {
    setIsTyping(false);
  }
}

async function handleBuild() {
  if (!page || !chatStore || isTyping) return;

  const activeChatId = chatStore.activeChatId;
  const chat = chatStore.chats[activeChatId];
  if (!chat) return;

  // ✅ SNAPSHOT EVERYTHING UPFRONT (CRITICAL FIX)
  const message = input.trim();
  const attachmentsSnapshot = chat.designState.attachments.map((a) => ({
    name: a.name,
    type: a.type,
  }));

  if (!message && attachmentsSnapshot.length === 0) {
    console.warn("[AI PANEL] Nothing to build");
    return;
  }

  console.log("[AI PANEL] Build triggered", { message });

  setIsTyping(true);
  setInput("");

  // 1️⃣ USER MESSAGE + COMPILE STATE
  setChatStore((prev) => {
    if (!prev) return prev;
    const c = prev.chats[activeChatId];

    return {
      ...prev,
      chats: {
        ...prev.chats,
        [activeChatId]: {
          ...c,
          designState: { ...c.designState, phase: "compile" },
          messages: [
            ...c.messages,
            ...(message ? [{ role: "user", text: message }] : []),
            { role: "assistant", text: "Designing your website…" },
          ],
        },
      },
    };
  });

  try {
    await onRunAI(buildFinalPrompt(), {
      message,
      attachments: attachmentsSnapshot,
    });

    // 2️⃣ SUCCESS → DONE
    setChatStore((prev) => {
      if (!prev) return prev;
      const c = prev.chats[activeChatId];

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [activeChatId]: {
            ...c,
            designState: { ...c.designState, phase: "done" },
            messages: [
              ...c.messages,
              {
                role: "assistant",
                text: "Your website layout is ready. You can refine it further.",
              },
            ],
          },
        },
      };
    });
  } catch (err) {
    console.error("[AI PANEL] Build failed", err);

    // 3️⃣ FAILURE → CONFIRM
    setChatStore((prev) => {
      if (!prev) return prev;
      const c = prev.chats[activeChatId];

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [activeChatId]: {
            ...c,
            designState: { ...c.designState, phase: "confirm" },
            messages: [
              ...c.messages,
              {
                role: "assistant",
                text: "Something went wrong. Please try again.",
              },
            ],
          },
        },
      };
    });
  } finally {
    setIsTyping(false);
  }
}

    /* ============================================================
     BUILD ENABLE LOGIC (CANONICAL)
  ============================================================ */

  const canBuild =
    !isTyping &&
    (input.trim().length > 0 ||
      designState.attachments.length > 0);


  /* ============================================================
     UI
  ============================================================ */


  return (
    <div className="h-full w-full flex flex-col px-2 pt-2 pb-2 text-white/90">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/10 border border-white/10">
            <Bot className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-medium">AI Website Designer</h2>
        </div>

<button
  onClick={handleNewChat}
  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs flex items-center gap-1"
>
  <Plus size={14} /> New
</button>

      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "assistant"
                ? "justify-start"
                : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 text-sm rounded-2xl border ${
                msg.role === "assistant"
                  ? "bg-white/[0.08] border-white/10"
                  : "bg-blue-600 border-blue-400/20"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT + ATTACHMENTS */}
      <div className="mt-3 p-2 rounded-2xl bg-black/40 border border-white/10">
        {/* Attachments */}
        {designState.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {designState.attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs"
              >
                {a.type === "image" && (
                  <ImageIcon size={12} />
                )}
                {(a.type === "document" ||
                  a.type === "figma") && (
                  <FileText size={12} />
                )}
                <span className="truncate max-w-[120px]">
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <Paperclip size={16} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt,.fig"
            className="hidden"
            onChange={(e) =>
              handleFileUpload(e.target.files)
            }
          />

<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      console.log("[AI PANEL] Enter pressed");

      if (canBuild) {
        handleBuild();
      }
    }
  }}
  placeholder="Add notes, links, or paste a Figma URL…"
  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40 pointer-events-auto"
/>


{designState.phase === "done" && (
  <button
    onClick={handleRegenerate}
    className="px-3 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1"
  >
    <Loader2 size={14} />
    Regenerate
  </button>
)}

<button
  disabled={!canBuild}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("[AI PANEL] Submit button clicked", {
      canBuild,
      phase: designState.phase,
      input,
      attachments: designState.attachments.length,
    });

    handleBuild();
  }}
  className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center disabled:opacity-40 pointer-events-auto"
>
  {isTyping ? (
    <Loader2 size={16} className="animate-spin" />
  ) : (
    <Send size={16} />
  )}
</button>

        </div>
      </div>
    </div>
  );
}
