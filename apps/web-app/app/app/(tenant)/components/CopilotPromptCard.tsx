"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  FileText,
  Globe,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Search,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

import {
  AI_ATTACHMENT_ACCEPT,
  getAgentAttachmentError,
  getAgentAttachmentKind,
} from "@/modules/ai-v12/attachments";

type CopilotPromptCardProps = {
  contextLabel?: string;
  subtitle?: string;
  onSubmit?: (prompt: string, attachments?: File[]) => void;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export default function CopilotPromptCard({
  contextLabel = "All websites",
  subtitle = "Ask BuildEZ to create, edit, or improve anything.",
  onSubmit,
}: CopilotPromptCardProps) {
  const [value, setValue] = useState("");
  const [mode] = useState("Create");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function focusComposer(cursorAtEnd = false) {
    window.requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      if (cursorAtEnd) {
        const length = node.value.length;
        node.setSelectionRange(length, length);
      }
    });
  }

  function insertDirective(snippet: string) {
    setValue((current) => {
      if (!current.trim()) return snippet;
      const separator = current.endsWith(" ") ? "" : " ";
      return `${current}${separator}${snippet}`;
    });
    focusComposer(true);
  }

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    const combined = [...attachments, ...incoming];
    const issue = getAgentAttachmentError(combined);

    if (issue) {
      setAttachmentError(issue);
      return;
    }

    setAttachmentError("");
    setAttachments(combined);
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, item) => item !== index));
    setAttachmentError("");
  }

  function toggleVoiceInput() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceUnsupported(true);
      return;
    }

    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setValue((current) =>
          current.trim() ? `${current.trim()} ${transcript}` : transcript,
        );
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setVoiceUnsupported(false);
    setListening(true);
    recognition.start();
  }

  function submit() {
    const prompt = value.trim();

    if ((!prompt && attachments.length === 0) || !onSubmit) {
      return;
    }

    onSubmit(prompt, attachments.length ? attachments : undefined);
    setValue("");
    setAttachments([]);
    setAttachmentError("");
  }

  const canSubmit = Boolean(value.trim() || attachments.length) && Boolean(onSubmit);

  return (
    <div className="dashboard-card relative mt-0 overflow-hidden rounded-2xl p-5 text-left sm:p-6">
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Sparkles size={18} />
        </span>

        <div>
          <h2 className="font-semibold">AI website assistant</h2>
          <p className="text-xs dashboard-muted">{subtitle}</p>
        </div>

        <span className="ml-auto rounded-full border dashboard-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide dashboard-muted">
          {mode}
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Prompt
          tone="violet"
          icon={WandSparkles}
          title="Create a section"
          text="Generate a polished new section"
          onClick={() =>
            setValue("Create a polished new section for my website")
          }
        />

        <Prompt
          tone="emerald"
          icon={Search}
          title="Improve SEO"
          text="Optimize pages and website copy"
          onClick={() =>
            setValue("Review and improve my website SEO")
          }
        />

        <Prompt
          tone="amber"
          icon={ImageIcon}
          title="Generate visuals"
          text="Create on-brand website images"
          onClick={() =>
            setValue("Create on-brand visuals for my website")
          }
        />
      </div>

      <div className="ai-glow-border relative mt-4 rounded-2xl border dashboard-border bg-[var(--dashboard-surface-hover)] p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={AI_ATTACHMENT_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((file, index) => {
              const isImage = getAgentAttachmentKind(file) === "image";
              return (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center gap-1.5 rounded-lg border dashboard-border bg-[var(--dashboard-surface)] px-2 py-1 text-[11px]"
                >
                  {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                  <span className="max-w-[140px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    aria-label={`Remove ${file.name}`}
                    className="dashboard-faint hover:text-current"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {attachmentError && (
          <p role="alert" className="mb-2 text-[11px] text-red-500">
            {attachmentError}
          </p>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submit();
            }
          }}
          rows={4}
          placeholder="Ask BuildEZ anything about your website..."
          className="w-full resize-none bg-transparent p-2 text-sm outline-none placeholder:text-[var(--dashboard-faint)]"
        />

        <div className="flex flex-wrap items-center gap-1.5 border-t dashboard-border pt-3">
          <Tool
            icon={Paperclip}
            label="Attach"
            onClick={() => fileInputRef.current?.click()}
          />
          <Tool
            icon={ImageIcon}
            label="Create image"
            onClick={() => insertDirective("Create an image of ")}
          />
          <Tool
            icon={Search}
            label="Search web"
            onClick={() => insertDirective("Search the web for ")}
          />

          <button
            type="button"
            onClick={toggleVoiceInput}
            title={
              voiceUnsupported
                ? "Voice input isn't supported in this browser"
                : listening
                  ? "Stop listening"
                  : "Voice input"
            }
            className={`ml-auto flex h-8 w-8 items-center justify-center rounded-lg dashboard-hover ${
              listening ? "text-red-500" : "dashboard-muted"
            }`}
            aria-label={listening ? "Stop voice input" : "Voice input"}
            aria-pressed={listening}
          >
            <Mic size={16} className={listening ? "animate-pulse" : ""} />
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Continue with AI"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-[11px] dashboard-faint">
        <Globe size={12} />
        <span>Working in {contextLabel}</span>
      </div>
    </div>
  );
}

function Tool({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Paperclip;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs dashboard-muted dashboard-hover"
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Prompt({
  icon: Icon,
  title,
  text,
  onClick,
  tone,
}: {
  icon: typeof WandSparkles;
  title: string;
  text: string;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ai-prompt ai-prompt-${tone} rounded-xl border dashboard-border p-3 text-left`}
    >
      <span className="ai-prompt-icon flex h-7 w-7 items-center justify-center rounded-lg">
        <Icon size={15} />
      </span>

      <p className="mt-2 text-xs font-semibold">{title}</p>
      <p className="mt-1 text-[10px] leading-4 dashboard-muted">
        {text}
      </p>
    </button>
  );
}
