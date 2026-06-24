"use client";

import { useAIUIStore } from "../state/aiUI.store";

export default function IndustryStep() {
  const { questions, step, submitAnswer, loading } = useAIUIStore();

  const q = questions[step];

  if (!q) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{q.title}</h2>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt: any) => (
          <button
            key={opt.value}
            disabled={loading}
            onClick={() => submitAnswer(q.key, opt.value)}
            className="rounded-xl border p-4 hover:border-primary"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
