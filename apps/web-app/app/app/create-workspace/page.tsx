"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    const res = await fetch("/api/app/workspaces/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await res.json();

    await fetch("/api/app/workspaces/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: data.workspaceId })
    });

    router.push(`/app/${data.workspaceId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[420px]">
        <h1 className="text-2xl font-semibold mb-6">Create workspace</h1>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Workspace name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={!name || loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          Create
        </button>
      </div>
    </div>
  );
}
