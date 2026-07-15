"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Sparkles,
  Square,
} from "lucide-react";

import { useAiRuntime } from "../hooks/useAiRuntime";
import { useAiStore, type AiAgentActivity } from "../store/useAiStore";

interface AiPanelProps {
  pageId: string;
  siteId: string;
  onRunAI: (prompt: string, context?: Record<string, unknown> | null) => Promise<void> | void;
  onAbortAI: () => void;
  aiChatRuntime: {
    status: "idle" | "running" | "success" | "error";
    message?: string;
  };
  onRequestLogoUpload(): void;
  onRefine?: (request: string, targetSection?: string) => void;
  hasGeneratedCode?: boolean;
}

const TONES = ["Professional", "Premium", "Friendly", "Bold"];

const SUGGESTIONS = [
  "Review this page and fix weak copy",
  "Show 3 stronger homepage directions",
  "Make the hero feel premium",
];

const RUNNING_THOUGHTS = [
  {
    title: "Strategy",
    body: "Reading the brief, audience, business goal, and page context.",
  },
  {
    title: "Layout",
    body: "Choosing sections, hierarchy, conversion path, and editable structure.",
  },
  {
    title: "Design",
    body: "Setting visual direction, spacing, typography, and interaction polish.",
  },
  {
    title: "Content",
    body: "Writing page-ready copy with clear CTAs and no placeholder language.",
  },
  {
    title: "Assets",
    body: "Selecting practical image guidance and brand asset usage.",
  },
  {
    title: "QA",
    body: "Checking responsiveness, missing content, accessibility, and quality.",
  },
];

const AGENT_LABELS: Record<string, string> = {
  IntentAgent: "Strategy",
  SitePlannerAgent: "Layout",
  DesignDirectionAgent: "Design",
  ContentAgent: "Copy",
  SectionRecipeAgent: "Sections",
  AssetAgent: "Assets",
  BlueprintAgent: "Build",
  ValidatorAgent: "Validation",
  QAAgent: "QA",
  RepairAgent: "Polish",
  BriefArchitectAgent: "Brief architect",
  DecisionInterviewAgent: "Decision interview",
  BusinessIntelligenceAgent: "Business strategy",
  BrandIntelligenceAgent: "Brand direction",
  ContentStrategyAgent: "Content strategy",
  ExperienceAgent: "Experience strategy",
  PatternAgent: "Pattern intelligence",
  DesignSystemAgent: "Design system",
  ComponentSelectionAgent: "Components",
  CompositionAgent: "Composition",
  BlueprintCompilerAgent: "Blueprint compiler",
  CreativeEnrichmentAgent: "Creative enrichment",
  ImageGenerationAgent: "Image generation",
  CriticAgent: "Quality critic",
  ParityAgent: "Renderer parity",
};

interface ThoughtLine {
  title: string;
  body: string;
  warnings?: string[];
}

interface AgentHistoryItem extends ThoughtLine {
  id: string;
  ok: boolean;
  stage: string;
}

interface PersistedChatItem {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

interface ContextForm {
  companyName: string;
  websiteName: string;
  pageName: string;
  industry: string;
  useCase: string;
  websiteUrl: string;
  logoUrl: string;
  referenceImageUrl: string;
  referenceImageIntent: string;
  designIntent: string;
  audience: string;
  offer: string;
  researchEnabled: boolean;
}

type ContextQuestion = {
  key: keyof ContextForm;
  label: string;
  options: string[];
};

type V10PreflightOption = {
  id: string;
  label: string;
  description: string;
  promptAddition: string;
  contextPatch?: Partial<Record<Exclude<keyof ContextForm, "researchEnabled">, string>>;
};

type V10PreflightQuestion = {
  id: string;
  label: string;
  whyItMatters: string;
  options: V10PreflightOption[];
};

type V10Preflight = {
  summary: string;
  interpretedUseCase: string;
  engineeredPrompt: string;
  questions: V10PreflightQuestion[];
  agentTrace: AiAgentActivity[];
  timing?: { fallbackUsed?: boolean };
  providerStatus?: { ok: boolean; category: string; message?: string };
};

const EMPTY_CONTEXT: ContextForm = {
  companyName: "",
  websiteName: "",
  pageName: "",
  industry: "",
  useCase: "",
  websiteUrl: "",
  logoUrl: "",
  referenceImageUrl: "",
  referenceImageIntent: "",
  designIntent: "",
  audience: "",
  offer: "",
  researchEnabled: true,
};

function agentLabel(agent: string) {
  return AGENT_LABELS[agent] || agent.replace(/Agent$/, "");
}

function formatAgent(agent: AiAgentActivity): ThoughtLine {
  const warnings = agent.warnings?.filter(Boolean) || [];
  return {
    title: agentLabel(agent.agent),
    body:
      agent.summary ||
      (agent.ok ? "Completed this step." : "Needs one more quality pass."),
    warnings,
  };
}

function buildRunningThoughts(elapsed: number): ThoughtLine[] {
  const activeIndex = Math.min(
    RUNNING_THOUGHTS.length - 1,
    Math.max(0, Math.floor(elapsed / 4))
  );

  return RUNNING_THOUGHTS.slice(0, activeIndex + 1);
}

function formatElapsed(elapsed: number) {
  if (elapsed < 60) return `${elapsed}s`;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function promptNeedsContext(prompt: string) {
  const lower = prompt.toLowerCase();
  const hasSpecificBusiness =
    /\b(?:for|called|named|brand|company|business)\s+["']?[a-z0-9][a-z0-9 &.-]{2,}/i.test(prompt) ||
    /https?:\/\//i.test(prompt);
  const hasIndustry =
    /(real estate|restaurant|saas|software|clinic|healthcare|school|academy|portfolio|ecommerce|store|retail|fitness|travel|legal|agency|consulting|construction|interior|salon|hotel|finance|nonprofit|manufacturing|logistics|events|creator|education|professional services|local business)/i.test(prompt);
  const hasUseCase =
    /(lead|booking|appointment|reservation|sell|shop|portfolio|contact|demo|trial|enquiry|inquiry|pricing|about|services)/i.test(prompt);
  const isGeneric =
    prompt.trim().length < 90 ||
    /(make|create|generate|build)\s+(a\s+)?(website|page|site)$/i.test(lower);

  return isGeneric || !hasSpecificBusiness || !hasIndustry || !hasUseCase;
}

function optionSetFor(key: keyof ContextForm, context: Partial<ContextForm>) {
  const industry = String(context.industry || "").toLowerCase();

  if (key === "industry") {
    return ["Professional services", "Local business", "Software", "Ecommerce"];
  }

  if (key === "audience") {
    if (/real estate|construction|property|builder/.test(industry)) {
      return ["Home buyers", "Property investors", "Families relocating", "Commercial buyers"];
    }

    if (/clinic|health|doctor|medical/.test(industry)) {
      return ["New patients", "Families", "Corporate clients", "Local residents"];
    }

    if (/saas|software|technology/.test(industry)) {
      return ["Founders", "Operations teams", "Enterprise buyers", "Product teams"];
    }

    return ["Local customers", "Premium buyers", "Business owners", "First-time visitors"];
  }

  if (key === "offer") {
    if (/real estate|construction|property|builder/.test(industry)) {
      return ["Book a site visit", "Explore projects", "Request a callback", "View availability"];
    }

    if (/clinic|health|doctor|medical/.test(industry)) {
      return ["Book an appointment", "Call the clinic", "View services", "Request consultation"];
    }

    if (/saas|software|technology/.test(industry)) {
      return ["Book a demo", "Start a trial", "Request pricing", "Talk to sales"];
    }

    return ["Request a quote", "Book a consultation", "Call now", "Send an enquiry"];
  }

  if (key === "useCase") {
    return ["Company website", "Lead generation", "Landing page", "Online sales"];
  }

  if (key === "designIntent") {
    if (/real estate|construction|property|builder/.test(industry)) {
      return [
        "Cinematic architectural editorial",
        "Premium brochure with dense proof",
        "Minimal luxury with strong imagery",
        "Bold conversion-led property page",
      ];
    }
    if (/restaurant|hospitality|cafe|hotel/.test(industry)) {
      return ["Atmospheric editorial", "Warm premium", "Bold nightlife", "Clean local"];
    }
    if (/saas|software|technology/.test(industry)) {
      return ["Product-led clean", "Enterprise trust", "Bold startup", "Minimal technical"];
    }
    if (/clinic|health|doctor|medical/.test(industry)) {
      return ["Calm clinical", "Warm human", "Premium specialist", "Clean modern"];
    }
    if (/shop|store|ecommerce|retail/.test(industry)) {
      return ["Premium catalog", "Lifestyle editorial", "Bold launch", "Minimal product"];
    }
    return ["Premium editorial", "Clean professional", "Bold conversion", "Warm local"];
  }

  return [];
}

function contextQuestions(prompt: string, context: Partial<ContextForm>): ContextQuestion[] {
  const questions: ContextQuestion[] = [];

  if (!context.industry) {
    questions.push({
      key: "industry",
      label: "What industry should I optimize for?",
      options: optionSetFor("industry", context),
    });
  }

  if (!hasSpecificDesignIntent(context.designIntent)) {
    questions.push({
      key: "designIntent",
      label: "What design type and layout direction should it follow?",
      options: optionSetFor("designIntent", context),
    });
  }

  if (!context.audience) {
    questions.push({
      key: "audience",
      label: "Who is the main audience?",
      options: optionSetFor("audience", context),
    });
  }

  if (!context.offer) {
    questions.push({
      key: "offer",
      label: "What action should visitors take?",
      options: optionSetFor("offer", context),
    });
  }

  if (!context.useCase) {
    questions.push({
      key: "useCase",
      label: "What kind of page is this?",
      options: optionSetFor("useCase", context),
    });
  }

  if (!context.websiteUrl && /brand|company|existing|match|research/i.test(prompt)) {
    questions.push({
      key: "websiteUrl",
      label: "Use an existing website for research?",
      options: ["I will add it later", "Skip website research"],
    });
  }

  return questions.slice(0, 4);
}

function hasSpecificDesignIntent(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;
  return !/^(clean professional|professional|premium|friendly|bold|clean modern)$/i.test(
    value.trim()
  );
}

function inferContextFromPrompt(prompt: string): Partial<ContextForm> {
  const companyMatch =
    prompt.match(/\b(?:called|named|brand|company|business)\s+["']?([a-z0-9][a-z0-9 &.'-]{2,60})/i) ||
    prompt.match(/\bfor\s+["']?([A-Z][A-Za-z0-9 &.'-]{2,80}?)(?:\s+(?:in|at|from|website|company|business|studio|clinic|store|agency|platform)\b|$)/i) ||
    prompt.match(/\b([A-Z][A-Za-z0-9 &.'-]{2,80}?\s+(?:Group|Builders|Developers|Construction|Realty|Homes|Estates|Studio|Clinic|Labs|Agency|School|Cafe|Hotel|Store|Shop|Technologies|Solutions))\b/i);
  const websiteMatch = prompt.match(/https?:\/\/[^\s)]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/i);
  const next: Partial<ContextForm> = {};

  if (companyMatch?.[1]) {
    next.companyName = companyMatch[1]
      .replace(/\b(?:bangalore|bengaluru|real estate|construction|company|home|website)\b.*$/i, "")
      .replace(/\b(?:website|company|business|studio|clinic|store|agency|platform)\b.*$/i, "")
      .replace(/[.,;:!?]+$/, "")
      .trim();
  }
  if (websiteMatch?.[0]) {
    const raw = websiteMatch[0].replace(/[.,;:!?]+$/, "");
    next.websiteUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }

  if (!next.industry) {
    if (/\b(real estate|property|properties|developer|builders?|realty|homes?|apartments?)\b/i.test(prompt)) {
      next.industry = "Real Estate";
    } else if (/\b(construction|contractor|interior|architecture)\b/i.test(prompt)) {
      next.industry = "Construction";
    } else if (/\b(clinic|doctor|medical|healthcare|hospital|dental)\b/i.test(prompt)) {
      next.industry = "Healthcare";
    } else if (/\b(saas|software|app|platform|technology)\b/i.test(prompt)) {
      next.industry = "Software";
    } else if (/\b(restaurant|cafe|food|hotel|hospitality)\b/i.test(prompt)) {
      next.industry = "Hospitality";
    } else if (/\b(shop|store|ecommerce|retail|product)\b/i.test(prompt)) {
      next.industry = "Ecommerce";
    } else if (/\b(law|legal|attorney|advocate)\b/i.test(prompt)) {
      next.industry = "Legal";
    } else if (/\b(finance|accounting|wealth|insurance|bank)\b/i.test(prompt)) {
      next.industry = "Finance";
    } else if (/\b(fitness|gym|yoga|wellness)\b/i.test(prompt)) {
      next.industry = "Fitness";
    } else if (/\b(travel|tour|tourism)\b/i.test(prompt)) {
      next.industry = "Travel";
    } else if (/\b(agency|consulting|services|professional)\b/i.test(prompt)) {
      next.industry = "Professional services";
    }
  }

  const fieldPatterns: Array<[keyof ContextForm, RegExp]> = [
    ["industry", /\bindustry\s+(?:is|=|:)\s+([^.\n,;]{2,80})/i],
    ["audience", /\b(?:audience|customers|users)\s+(?:is|are|=|:)\s+([^.\n;]{2,120})/i],
    ["offer", /\b(?:offer|service|product|cta|goal)\s+(?:is|=|:)\s+([^.\n;]{2,120})/i],
    ["useCase", /\b(?:use case|purpose)\s+(?:is|=|:)\s+([^.\n;]{2,100})/i],
    ["designIntent", /\b(?:design intent|visual direction|style)\s+(?:is|=|:)\s+([^.\n;]{2,100})/i],
  ];

  fieldPatterns.forEach(([key, pattern]) => {
    const match = prompt.match(pattern);
    if (match?.[1]) {
      (next as Record<string, string>)[key] = match[1].trim();
    }
  });

  return next;
}

function contextSummary(context: Partial<ContextForm>) {
  return [
    context.companyName && `company: ${context.companyName}`,
    context.industry && `industry: ${context.industry}`,
    context.audience && `audience: ${context.audience}`,
    context.offer && `offer: ${context.offer}`,
    context.designIntent && `design: ${context.designIntent}`,
    context.websiteUrl && `website: ${context.websiteUrl}`,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default function AiPanel({
  pageId,
  siteId,
  onRunAI,
  onAbortAI,
  aiChatRuntime,
  onRequestLogoUpload,
  onRefine,
  hasGeneratedCode = false,
}: AiPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const decisionRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<HTMLDivElement>(null);
  const followingLiveUpdatesRef = useRef(true);
  const preflightRequestRef = useRef<string | null>(null);
  const seenAgentEventsRef = useRef(new Set<string>());
  const { elapsed } = useAiRuntime();
  const agents = useAiStore((s) => s.agents);
  const runtimeMessages = useAiStore((s) => s.messages);
  const setAiStatus = useAiStore((s) => s.setStatus);
  const setAiErrorMessage = useAiStore((s) => s.setErrorMessage);
  const setAiAgents = useAiStore((s) => s.setAgents);
  const addRuntimeMessage = useAiStore((s) => s.addMessage);
  const clearRuntimeMessages = useAiStore((s) => s.clearMessages);

  const [prompt, setPrompt] = useState("");
  const [generationVersion, setGenerationVersion] = useState<"v9" | "v10">("v10");
  const [tone, setTone] = useState("Professional");
  const [lastUserPrompt, setLastUserPrompt] = useState("");
  const [agentHistory, setAgentHistory] = useState<AgentHistoryItem[]>([]);
  const [contextForm, setContextForm] = useState<ContextForm>(EMPTY_CONTEXT);
  const [savedContextSummary, setSavedContextSummary] = useState("");
  const [persistedHistory, setPersistedHistory] = useState<PersistedChatItem[]>([]);
  const [contextPrompts, setContextPrompts] = useState<ContextQuestion[]>([]);
  const [pendingGenerationPrompt, setPendingGenerationPrompt] = useState("");
  const [v10Preflight, setV10Preflight] = useState<V10Preflight | null>(null);
  const [v10Selections, setV10Selections] = useState<Record<string, string>>({});
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const [referenceUploadStatus, setReferenceUploadStatus] = useState("");
  const [designReviewStatus, setDesignReviewStatus] = useState<
    "idle" | "pending" | "accepted"
  >("idle");
  const [acceptingDesign, setAcceptingDesign] = useState(false);
  const [mode, setMode] = useState<"generate" | "refine">(
    hasGeneratedCode ? "refine" : "generate"
  );

  const isRunning = aiChatRuntime.status === "running";
  const isError = aiChatRuntime.status === "error";

  async function saveContext(nextContext: ContextForm) {
    try {
      const res = await fetch("/api/builder-v2/ai/context", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, context: nextContext }),
      });
      if (!res.ok) return nextContext;
      const payload = await res.json();
      const merged = {
        ...(payload.context || {}),
        ...nextContext,
        researchEnabled: payload.context?.researchEnabled !== false,
      };
      setContextForm(merged);
      setSavedContextSummary(contextSummary(merged));
      return merged;
    } catch (error) {
      console.error("[AI Context] Failed to save context", error);
      return nextContext;
    }
  }

  async function uploadReferenceImage(file: File) {
    if (!file || isRunning) return;
    if (!file.type.startsWith("image/")) {
      setReferenceUploadStatus("Please attach an image file.");
      return;
    }

    setReferenceUploadStatus("Uploading reference...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("siteId", siteId);
    formData.append("usage", "ai-reference");

    try {
      const res = await fetch("/api/builder-v2/assets/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok || !payload?.asset?.url) {
        throw new Error(payload?.error || "Image upload failed.");
      }

      const nextContext = {
        ...contextForm,
        referenceImageUrl: payload.asset.url,
        referenceImageIntent:
          "Use this uploaded UI or visual reference to match layout, spacing, color relationships, imagery direction, and overall composition in the generated builder blueprint.",
      };
      setReferenceUploadStatus("Reference attached");
      await saveContext(nextContext);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      setReferenceUploadStatus(message);
    } finally {
      if (referenceInputRef.current) referenceInputRef.current.value = "";
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      try {
        const res = await fetch(`/api/builder-v2/ai/context?pageId=${encodeURIComponent(pageId)}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const payload = await res.json();
        if (cancelled || !payload?.context) return;
        const nextContext = {
          ...EMPTY_CONTEXT,
          ...payload.context,
          researchEnabled: payload.context.researchEnabled !== false,
        };
        setContextForm(nextContext);
        setSavedContextSummary(contextSummary(nextContext));
        if (Array.isArray(payload.messages)) {
          setPersistedHistory(
            payload.messages
              .map((message: any) => ({
                id: String(message.id),
                role: message.role === "user" ? "user" : "assistant",
                text:
                  typeof message.content?.text === "string"
                    ? message.content.text
                    : "",
              }))
              .filter((message: PersistedChatItem) => message.text)
              .slice(-10)
          );
        }
      } catch (error) {
        console.error("[AI Context] Failed to load saved context", error);
      }
    }

    loadContext();
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  useEffect(() => {
    function onLogoComplete(event: Event) {
      const detail =
        event instanceof CustomEvent && event.detail && typeof event.detail === "object"
          ? (event.detail as { logoUrl?: unknown })
          : {};
      const logoUrl = typeof detail.logoUrl === "string" ? detail.logoUrl.trim() : "";
      if (!logoUrl) return;

      const nextContext = {
        ...contextForm,
        logoUrl,
      };
      setContextForm(nextContext);
      setSavedContextSummary(contextSummary(nextContext));
      void saveContext(nextContext);
    }

    window.addEventListener("ai:logo-complete", onLogoComplete);
    return () => window.removeEventListener("ai:logo-complete", onLogoComplete);
  }, [contextForm]);

  const activeThought = useMemo(() => {
    if (!isRunning) return null;
    const liveAgent = agents[agents.length - 1];
    if (generationVersion === "v10" && liveAgent) return formatAgent(liveAgent);
    const thoughts = buildRunningThoughts(elapsed);
    return thoughts[thoughts.length - 1] || null;
  }, [agents, elapsed, generationVersion, isRunning]);
  const answeredDecisionCount = v10Preflight
    ? v10Preflight.questions.filter((question) => Boolean(v10Selections[question.id])).length
    : 0;
  const activeDecisionQuestion = v10Preflight?.questions.find(
    (question) => !v10Selections[question.id]
  );
  const activeDecisionIndex = v10Preflight && activeDecisionQuestion
    ? v10Preflight.questions.findIndex((question) => question.id === activeDecisionQuestion.id)
    : v10Preflight?.questions.length ?? 0;
  const decisionsComplete = Boolean(
    v10Preflight && answeredDecisionCount === v10Preflight.questions.length
  );

  useEffect(() => {
    if (!agents.length) return;
    const runId = `${Date.now()}`;
    const completedAgents = isRunning ? agents.slice(0, -1) : agents;
    const unseen = completedAgents.filter((agent) => {
      const key = `${agent.agent}:${agent.stage}:${agent.summary}`;
      if (seenAgentEventsRef.current.has(key)) return false;
      seenAgentEventsRef.current.add(key);
      return true;
    });
    if (!unseen.length) return;
    setAgentHistory((current) => [
      ...current,
      ...unseen.map((agent, index) => {
        const formatted = formatAgent(agent);
        return {
          ...formatted,
          id: `${runId}-${agent.agent}-${index}`,
          ok: agent.ok,
          stage: agent.stage,
        };
      }),
    ]);
  }, [agents, isRunning]);

  useEffect(() => {
    if (!activeDecisionQuestion?.id && !decisionsComplete) return;
    const frame = window.requestAnimationFrame(() =>
      decisionRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    );
    return () => window.cancelAnimationFrame(frame);
  }, [activeDecisionQuestion?.id, decisionsComplete]);

  useEffect(() => {
    if (!isRunning || !followingLiveUpdatesRef.current) return;
    const frame = window.requestAnimationFrame(() =>
      runtimeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    );
    return () => window.cancelAnimationFrame(frame);
  }, [
    activeThought?.title,
    activeThought?.body,
    agentHistory.length,
    isRunning,
  ]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const element = scrollRef.current;
      if (!element) return;
      const hasNewContentBelow = element.scrollHeight - element.scrollTop - element.clientHeight >= 80;
      setShowScrollToLatest(hasNewContentBelow);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [agentHistory.length, runtimeMessages.length, persistedHistory.length, contextPrompts.length, lastUserPrompt, savedContextSummary, preflightLoading, v10Preflight, activeDecisionQuestion?.id, activeThought?.title, activeThought?.body, isRunning, isError, designReviewStatus]);

  async function runGeneration(cleanPrompt: string, nextContext: ContextForm) {
    const savedContext =
      JSON.stringify(nextContext) !== JSON.stringify(contextForm)
        ? await saveContext(nextContext)
        : nextContext;

    setContextPrompts([]);
    setV10Preflight(null);
    setV10Selections({});
    setPendingGenerationPrompt("");
    setDesignReviewStatus("idle");
    addRuntimeMessage({ role: "assistant", text: "Direction approved. Website generation started.", ts: Date.now(), kind: "text" });

    await onRunAI(cleanPrompt, {
      ...(savedContext as unknown as Record<string, unknown>),
      tone,
      noCodeOutput: true,
      aiGenerationVersion: generationVersion,
      generationRunId: generationVersion === "v10" ? crypto.randomUUID() : undefined,
    });
    setDesignReviewStatus("pending");
  }

  async function acceptDesign() {
    if (acceptingDesign || designReviewStatus !== "pending") return;

    setAcceptingDesign(true);
    try {
      const res = await fetch("/api/builder-v2/ai/finalize-design", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageId }),
      });

      if (!res.ok) {
        let message = "Could not accept this design.";
        try {
          const payload = await res.json();
          message = payload?.error || payload?.message || message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      setDesignReviewStatus("accepted");
    } catch (error) {
      console.error("[AiPanel] Failed to accept design:", error);
    } finally {
      setAcceptingDesign(false);
    }
  }

  async function submitPrompt(nextPrompt = prompt) {
    const cleanPrompt = nextPrompt.trim();
    if (!cleanPrompt || isRunning || preflightLoading || preflightRequestRef.current) return;

    setAiStatus("idle");
    setAiErrorMessage(null);
    setAiAgents([]);
    clearRuntimeMessages();
    setAgentHistory([]);
    seenAgentEventsRef.current.clear();
    setPrompt("");
    setLastUserPrompt(cleanPrompt);
    setDesignReviewStatus("idle");

    if (mode === "refine" && hasGeneratedCode && onRefine) {
      setContextPrompts([]);
      setPendingGenerationPrompt("");
      onRefine(`${cleanPrompt}\n\nTone: ${tone}`);
      return;
    }

    const inferredContext = {
      ...contextForm,
      ...inferContextFromPrompt(cleanPrompt),
    };

    if (mode === "generate" && generationVersion === "v10") {
      const requestKey = `${pageId}:${cleanPrompt}`;
      if (preflightRequestRef.current) return;
      preflightRequestRef.current = requestKey;
      setContextForm(inferredContext);
      setContextPrompts([]);
      setPendingGenerationPrompt(cleanPrompt);
      setPreflightLoading(true);
      try {
        if (JSON.stringify(inferredContext) !== JSON.stringify(contextForm)) {
          await saveContext(inferredContext);
        }
        const response = await fetch("/api/builder-v2/ai/preflight-v10", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: cleanPrompt, context: inferredContext }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Could not prepare the website brief.");
        setV10Preflight(payload as V10Preflight);
        setV10Selections({});
        setAiAgents([]);
      } catch (error) {
        setAiStatus("error");
        setAiErrorMessage(error instanceof Error ? error.message : "Website brief preparation failed.");
      } finally {
        if (preflightRequestRef.current === requestKey) preflightRequestRef.current = null;
        setPreflightLoading(false);
      }
      return;
    }

    const missingQuestions =
      mode === "generate" &&
      (promptNeedsContext(cleanPrompt) || !hasSpecificDesignIntent(inferredContext.designIntent))
        ? contextQuestions(cleanPrompt, inferredContext)
        : [];

    if (missingQuestions.length) {
      setContextForm(inferredContext);
      setContextPrompts(missingQuestions);
      setPendingGenerationPrompt(cleanPrompt);
      if (JSON.stringify(inferredContext) !== JSON.stringify(contextForm)) {
        await saveContext(inferredContext);
      }
      return;
    }

    await runGeneration(cleanPrompt, inferredContext);
  }

  function chooseV10Option(question: V10PreflightQuestion, option: V10PreflightOption) {
    if (isRunning || preflightLoading) return;
    setV10Selections((current) => ({ ...current, [question.id]: option.id }));
  }

  async function generateFromV10Preflight() {
    if (!v10Preflight || !pendingGenerationPrompt || isRunning || preflightLoading) return;
    const selected = v10Preflight.questions.map((question) => ({
      question,
      option: question.options.find((option) => option.id === v10Selections[question.id]),
    }));
    if (selected.some(({ option }) => !option)) return;

    const contextPatch = selected.reduce<Partial<ContextForm>>(
      (result, { option }) => ({ ...result, ...(option?.contextPatch || {}) }),
      {}
    );
    const decisions = selected
      .map(({ question, option }) => `${question.label}: ${option?.label}. ${option?.promptAddition}`)
      .join("\n");
    const engineeredPrompt = `${v10Preflight.engineeredPrompt}\n\nUSER-APPROVED WEBSITE DECISIONS:\n${decisions}`;
    const nextContext = {
      ...contextForm,
      ...contextPatch,
      designIntent: [contextForm.designIntent, ...selected.map(({ option }) => option?.label || "")]
        .filter(Boolean)
        .join("; "),
    };
    await runGeneration(engineeredPrompt, nextContext);
  }

  async function chooseContextOption(question: ContextQuestion, value: string) {
    if (isRunning) return;

    setAiStatus("idle");
    setAiErrorMessage(null);
    const remainingQuestions = contextPrompts.filter(
      (item) => item.key !== question.key
    );
    const nextContext = {
      ...contextForm,
      [question.key]:
        question.key === "websiteUrl" && value === "Skip website research"
          ? ""
          : value,
      researchEnabled:
        question.key === "websiteUrl" && value === "Skip website research"
          ? false
          : contextForm.researchEnabled,
    };

    setContextForm(nextContext);
    setContextPrompts(remainingQuestions);
    await saveContext(nextContext);

    if (!remainingQuestions.length && pendingGenerationPrompt) {
      await runGeneration(pendingGenerationPrompt, nextContext);
    }
  }

  async function continuePendingGeneration() {
    if (!pendingGenerationPrompt || isRunning) return;
    setAiStatus("idle");
    setAiErrorMessage(null);
    await runGeneration(pendingGenerationPrompt, contextForm);
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-white/10 bg-[rgb(15_17_24/82%)] text-[13px] text-white shadow-2xl shadow-black/50 backdrop-blur-2xl">
      <style>{`
        @keyframes buildez-ai-scan {
          0% { transform: translateX(-120%); opacity: 0; }
          18% { opacity: 0.75; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes buildez-ai-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes buildez-ai-dot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .buildez-ai-scan::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.16), transparent);
          animation: buildez-ai-scan 2.4s ease-in-out infinite;
        }

        .buildez-ai-orbit {
          animation: buildez-ai-orbit 3.8s linear infinite;
        }

        .buildez-ai-dot {
          animation: buildez-ai-dot 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="border-b border-white/10 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-200">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>BuildEZ Autopilot</span>
            </div>
            <p className="mt-1 truncate text-xs text-neutral-500">
              Website generation, review, and polish
            </p>
          </div>

          <select
            aria-label="AI generation version"
            value={generationVersion}
            disabled={isRunning || preflightLoading}
            onChange={(event) => {
              setGenerationVersion(event.target.value as "v9" | "v10");
              setV10Preflight(null);
              setV10Selections({});
              setContextPrompts([]);
              setPendingGenerationPrompt("");
            }}
            className="shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs text-neutral-300 outline-none transition hover:border-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="v10">AI v10 · Website Engine</option>
            <option value="v9">AI v9 · Direct</option>
          </select>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          followingLiveUpdatesRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
          setShowScrollToLatest(!followingLiveUpdatesRef.current);
        }}
        className="h-full min-h-0 space-y-4 overflow-y-auto bg-[#121418]/70 px-4 py-4 backdrop-blur-xl"
      >
        <div
          className={`relative max-w-[92%] overflow-hidden rounded-[22px] border border-neutral-800 bg-neutral-900/70 px-4 py-3 shadow-xl shadow-black/20 ${
            isRunning ? "buildez-ai-scan" : ""
          }`}
        >
          <p className="text-xs leading-5 text-neutral-200">
            Tell me what to build or improve. I will work through strategy,
            layout, design, copy, assets, and QA, then place the result on the
            canvas.
          </p>
        </div>

        {savedContextSummary ? (
          <div className="max-w-[94%] rounded-[16px] border border-emerald-500/15 bg-emerald-500/[0.06] px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">Context in use</p>
            <p className="mt-1 text-[11px] leading-4 text-emerald-50/75">{savedContextSummary}</p>
          </div>
        ) : null}

        {contextForm.referenceImageUrl ? (
          <div className="max-w-[94%] rounded-[16px] border border-violet-500/15 bg-violet-500/[0.06] px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200/80">Visual reference in use</p>
            <p className="mt-1 text-[11px] leading-4 text-violet-50/70">The attached reference will guide composition, spacing, color, and imagery.</p>
          </div>
        ) : null}

        {persistedHistory.map((item) => (
          <div
            key={item.id}
            className={
              item.role === "user"
                ? "ml-auto max-w-[88%] rounded-[22px] bg-neutral-800 px-4 py-3 shadow-xl shadow-black/20"
                : "max-w-[94%] rounded-[22px] border border-neutral-800 bg-[#111419]/95 px-4 py-3 shadow-xl shadow-black/25"
            }
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.role === "user" ? "Previous prompt" : "Previous AI response"}
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-100">{item.text}</p>
          </div>
        ))}

        {lastUserPrompt ? (
          <div className="ml-auto max-w-[88%] rounded-[22px] bg-neutral-800 px-4 py-3 shadow-xl shadow-black/20">
            <p className="text-xs leading-5 text-neutral-100">{lastUserPrompt}</p>
          </div>
        ) : null}

        {preflightLoading ? (
          <div className="max-w-[94%] rounded-[18px] border border-violet-500/20 bg-violet-500/[0.08] px-4 py-3">
            <div className="flex items-center gap-2 text-violet-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-xs font-semibold">Preparing a website strategy from your request…</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-violet-50/75">Interpreting the use case and preparing decisions that materially change the result.</p>
          </div>
        ) : null}

        {v10Preflight ? (
          <div ref={decisionRef} className="max-w-[96%] rounded-[20px] border border-violet-400/25 bg-violet-500/[0.08] px-4 py-4 shadow-xl shadow-violet-950/10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">Website direction</p>
              <p className="text-[11px] text-violet-100/60">{Math.min(activeDecisionIndex + 1, v10Preflight.questions.length)} of {v10Preflight.questions.length}</p>
            </div>
            <div className="mt-2 flex gap-1.5" aria-label={`${answeredDecisionCount} of ${v10Preflight.questions.length} decisions completed`}>
              {v10Preflight.questions.map((question) => (
                <span key={question.id} className={`h-1 flex-1 rounded-full ${v10Selections[question.id] ? "bg-violet-300" : "bg-white/10"}`} />
              ))}
            </div>

            {v10Preflight.timing?.fallbackUsed ? (
              <p className="mt-3 rounded-xl border border-violet-300/10 bg-black/10 px-3 py-2 text-[10px] leading-4 text-violet-100/60">
                Strategy prepared locally because the AI brief service was temporarily unavailable. Website generation can continue normally.
              </p>
            ) : null}

            {answeredDecisionCount > 0 && !decisionsComplete ? (
              <div className="mt-3 space-y-1">
                {v10Preflight.questions.filter((question) => v10Selections[question.id]).map((question) => {
                  const option = question.options.find((item) => item.id === v10Selections[question.id]);
                  return <p key={question.id} className="truncate text-[10px] text-violet-100/55">Selected: <span className="text-violet-100/85">{option?.label}</span></p>;
                })}
              </div>
            ) : null}

            {activeDecisionQuestion ? (
              <div className="mt-4">
                {answeredDecisionCount === 0 ? (
                  <p className="mb-3 text-xs leading-5 text-violet-100/70">{v10Preflight.summary}</p>
                ) : null}
                <p className="text-sm font-semibold leading-5 text-white">{activeDecisionQuestion.label}</p>
                <p className="mt-1 text-[11px] leading-4 text-violet-100/60">{activeDecisionQuestion.whyItMatters}</p>
                <div className="mt-3 grid gap-2">
                  {activeDecisionQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => chooseV10Option(activeDecisionQuestion, option)}
                      className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-left transition hover:border-violet-300/45 hover:bg-violet-300/10"
                    >
                      <span className="block text-xs font-semibold text-white">{option.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-neutral-300">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {decisionsComplete ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">Direction ready</p>
                <div className="mt-2 space-y-1.5">
                  {v10Preflight.questions.map((question) => {
                    const option = question.options.find((item) => item.id === v10Selections[question.id]);
                    return (
                      <button key={question.id} type="button" onClick={() => setV10Selections((current) => {
                        const next = { ...current };
                        delete next[question.id];
                        return next;
                      })} className="flex w-full items-center justify-between gap-3 rounded-lg bg-black/15 px-2.5 py-2 text-left hover:bg-white/[0.06]">
                        <span className="truncate text-[11px] text-neutral-200">{option?.label}</span>
                        <span className="shrink-0 text-[10px] text-violet-300">Change</span>
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={generateFromV10Preflight} className="mt-4 w-full rounded-xl bg-violet-400 px-3 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-violet-300">
                  Build this website
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {contextPrompts.length ? (
          <div className="max-w-[94%] rounded-[18px] border border-sky-500/20 bg-sky-500/[0.08] px-4 py-3 shadow-xl shadow-sky-950/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
                  Brand context
                </p>
                <p className="mt-1 text-xs leading-5 text-sky-50/90">
                  Choose a few details before generation starts.
                </p>
              </div>
              <button
                type="button"
                onClick={continuePendingGeneration}
                disabled={!pendingGenerationPrompt || isRunning}
                className="shrink-0 rounded-full bg-sky-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {contextPrompts.map((question) => (
                <div key={question.key}>
                  <p className="text-xs leading-5 text-sky-50/85">
                    {question.label}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => chooseContextOption(question, option)}
                        disabled={isRunning}
                        className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[11px] text-sky-50 transition hover:border-sky-200/45 hover:bg-sky-300/18 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {runtimeMessages.filter((message) => message.text.includes("started")).map((message) => (
          <div key={`${message.ts}-${message.text}`} className="max-w-[92%] rounded-[18px] border border-sky-500/15 bg-sky-500/[0.06] px-4 py-3 text-sky-100">
            <p className="text-xs leading-5">{message.text}</p>
          </div>
        ))}

        {agentHistory.map((item) => (
          <div
            key={item.id}
            className="max-w-[94%] rounded-[22px] border border-neutral-800 bg-[#111419]/95 px-4 py-3 shadow-xl shadow-black/25"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  item.ok ? "bg-emerald-300" : "bg-amber-300"
                }`}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-neutral-300">
                    {item.title}
                  </p>
                  <span className="rounded-full border border-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                    {item.stage}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-200">
                  {item.body}
                </p>
                {item.warnings?.length ? (
                  <p className="mt-1 text-xs leading-5 text-amber-200/80">
                    {item.warnings.join(" ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {isRunning ? (
          <div ref={runtimeRef} className="relative overflow-hidden rounded-[22px] border border-sky-500/20 bg-sky-500/[0.07] px-4 py-3 shadow-[0_0_34px_rgba(14,165,233,0.12)]">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border border-sky-400/15 buildez-ai-orbit" />
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-300/[0.08] to-transparent buildez-ai-scan" />
            <div className="relative flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-100">
                  Working
                  <span className="buildez-ai-dot">.</span>
                  <span className="buildez-ai-dot [animation-delay:120ms]">.</span>
                  <span className="buildez-ai-dot [animation-delay:240ms]">.</span>
                  <span className="ml-1 text-neutral-500">{formatElapsed(elapsed)}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-300">
                  {activeThought
                    ? `${activeThought.title}: ${activeThought.body}`
                    : "Coordinating the generation agents."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!isRunning && aiChatRuntime.status === "success" && designReviewStatus !== "idle" ? (
          <div className="max-w-[92%] rounded-[22px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs leading-5 text-emerald-100">
              Done. I generated this page only and completed the quality pass.
            </p>
            {designReviewStatus === "pending" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={acceptDesign}
                  disabled={acceptingDesign}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300 px-3 py-1.5 text-[11px] font-semibold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acceptingDesign ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Accept design
                </button>
                <span className="text-[11px] leading-4 text-emerald-50/70">
                  Accept before building the rest of the pages.
                </span>
              </div>
            ) : null}
            {designReviewStatus === "accepted" ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Design accepted for future pages.
              </p>
            ) : null}
          </div>
        ) : null}

        {isError ? (
          <div className="max-w-[92%] rounded-[22px] border border-red-500/25 bg-red-500/10 px-4 py-3">
            <p className="text-xs leading-5 text-red-100">
              {aiChatRuntime.message || "AI request failed."}
            </p>
          </div>
        ) : null}

        {runtimeMessages.filter((message) => !message.text.includes("started")).map((message) => (
          <div key={`${message.ts}-${message.text}`} className={`max-w-[92%] rounded-[18px] border px-4 py-3 ${message.kind === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100" : "border-neutral-700 bg-neutral-900/80 text-neutral-200"}`}>
            <p className="text-xs leading-5">{message.text}</p>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
      {showScrollToLatest ? (
        <button
          type="button"
          aria-label="Scroll to latest AI event"
          onClick={() => {
            followingLiveUpdatesRef.current = true;
            setShowScrollToLatest(false);
            bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
          }}
          className="absolute bottom-3 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-sky-300/25 bg-neutral-900/95 text-sky-200 shadow-xl shadow-black/40 backdrop-blur transition hover:border-sky-300/50 hover:bg-neutral-800"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      ) : null}
      </div>

      <div className="shrink-0 border-t border-white/10 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {!lastUserPrompt && !isRunning ? (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setPrompt(item);
                  inputRef.current?.focus();
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-400 transition hover:border-sky-500/40 hover:text-neutral-100"
              >
                {item}
                <Plus className="h-3 w-3" />
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={`rounded-[22px] border border-neutral-800 bg-neutral-900/90 p-2 shadow-2xl shadow-black/30 ${
            isRunning ? "shadow-sky-950/20" : ""
          }`}
        >
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitPrompt();
              }
            }}
            rows={2}
            disabled={isRunning || preflightLoading}
            placeholder="Add follow up..."
            className="min-h-[46px] w-full resize-none bg-transparent px-3 py-1.5 text-xs leading-5 text-neutral-100 outline-none placeholder:text-neutral-600 disabled:opacity-60"
          />

          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === "generate" ? "refine" : "generate")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200"
              >
                {mode === "generate" ? "Generate" : "Refine"}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="rounded-lg bg-transparent px-1.5 py-1.5 text-xs text-neutral-500 outline-none transition hover:bg-neutral-800 hover:text-neutral-200"
                aria-label="Tone"
              >
                {TONES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRequestLogoUpload}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200"
                aria-label="Use brand assets"
              >
                <ImageIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200"
                onClick={() => referenceInputRef.current?.click()}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadReferenceImage(file);
                }}
              />

              <button
                type="button"
                onClick={isRunning ? onAbortAI : () => submitPrompt()}
                disabled={!isRunning && (!prompt.trim() || preflightLoading)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  isRunning
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-sky-500 text-white hover:bg-sky-400"
                }`}
                aria-label={isRunning ? "Stop AI" : "Send prompt"}
              >
                {isRunning ? (
                  <Square className="h-4 w-4" fill="currentColor" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        {referenceUploadStatus ? (
          <p className="px-2 pt-1 text-[11px] leading-4 text-neutral-500">
            {referenceUploadStatus}
          </p>
        ) : null}
      </div>
    </div>
  );
}
