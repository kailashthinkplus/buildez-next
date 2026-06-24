"use client";

import { useCallback } from "react";

import { DEFAULT_ASSISTANT_MESSAGE } from "../constants";
import { AiConversation } from "../services/AiConversation";
import { useAiStore } from "../store/useAiStore";

interface UseAiConversationProps {
  pageId: string;

  onRequestLogoUpload(): void;

  onRefine?: (
    request: string,
    targetSection?: string
  ) => Promise<void>;

  hasGeneratedCode: boolean;
}

const now = () => Date.now();

export function useAiConversation({
  pageId,
  onRequestLogoUpload,
  onRefine,
  hasGeneratedCode,
}: UseAiConversationProps) {
  const {
    messages,
    input,
    selectedTone,
    waitingForLogo,

    addMessage,
    setInput,
    setTone,
    setWaitingForLogo,
    setStatus,
    setElapsed,
    reset,
    setLastPrompt,
    lastPrompt,
  } = useAiStore();

  /* ==========================================================
     SEND PROMPT
  ========================================================== */

  const handleSend = useCallback(async () => {
    const prompt = input.trim();

    if (!prompt) return;

    setInput("");

    setLastPrompt(prompt);

    addMessage({
      role: "user",
      text: prompt,
      ts: now(),
      kind: "text",
    });

    if (hasGeneratedCode && onRefine) {
      await onRefine(prompt);
      return;
    }

    addMessage({
      role: "assistant",
      text: "What tone should this website have?",
      ts: now(),
      kind: "tone-pills",
    });
  }, [
    input,
    addMessage,
    setInput,
    setLastPrompt,
    hasGeneratedCode,
    onRefine,
  ]);

  /* ==========================================================
     TONE
  ========================================================== */

  const handleToneSelect = useCallback(
    (tone: string) => {
      setTone(tone);

      addMessage({
        role: "user",
        text: tone,
        ts: now(),
      });

      addMessage({
        role: "assistant",
        text: "Upload your logo to extract brand colors. You can skip this step.",
        ts: now(),
        kind: "logo-actions",
      });

      setWaitingForLogo(true);
    },
    [
      addMessage,
      setTone,
      setWaitingForLogo,
    ]
  );

  /* ==========================================================
     LOGO
  ========================================================== */

  const handleLogoUpload =
    useCallback(() => {
      onRequestLogoUpload();
    }, [onRequestLogoUpload]);

  const runFinalAI =
    useCallback(async () => {

      if (!lastPrompt || !selectedTone)
        return;

      const finalPrompt = `${lastPrompt}

Tone: ${selectedTone}

Instructions:

- Match the selected tone

- Create professional content

- Build responsive sections

- Use strong CTAs`;

      setWaitingForLogo(false);

      await AiConversation.run({
        pageId,
        prompt: finalPrompt,
        tone: selectedTone,
      });

    }, [
      lastPrompt,
      selectedTone,
      pageId,
      setWaitingForLogo,
    ]);

  const handleSkipLogo =
    useCallback(async () => {

      addMessage({
        role: "user",
        text: "Skip",
        ts: now(),
      });

      await runFinalAI();

    }, [
      addMessage,
      runFinalAI,
    ]);

  /* ==========================================================
     ABORT
  ========================================================== */

  const handleAbort =
    useCallback(() => {

      AiConversation.abort();

      setElapsed(0);

      setStatus("idle");

    }, [
      setElapsed,
      setStatus,
    ]);

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset =
    useCallback(() => {

      reset();

      addMessage({
        role: "assistant",
        text: DEFAULT_ASSISTANT_MESSAGE,
        ts: now(),
      });

    }, [
      reset,
      addMessage,
    ]);

  return {

    messages,

    input,

    selectedTone,

    waitingForLogo,

    handleSend,

    handleToneSelect,

    handleLogoUpload,

    handleSkipLogo,

    handleAbort,

    handleReset,

    runFinalAI,

  };
}