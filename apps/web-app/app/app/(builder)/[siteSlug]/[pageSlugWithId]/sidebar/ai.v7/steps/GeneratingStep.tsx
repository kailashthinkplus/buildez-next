"use client";

import { useAIUIStore } from "../state/aiUI.store";

export default function GeneratingStep() {
  const { finalizeInterview, loading } = useAIUIStore();

  return (
    <div className="text-center space-y-4">
      <p className="text-sm text-muted">
        Generating your website…
      </p>

      <button
        disabled={loading}
        onClick={finalizeInterview}
        className="rounded-xl bg-primary px-6 py-3 text-white"
      >
        Generate Page
      </button>
    </div>
  );
}
