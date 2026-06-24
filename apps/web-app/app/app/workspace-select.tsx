"use client";

import { useRouter } from "next/navigation";

export default function WorkspaceSelect({ workspaces }: { workspaces: any[] }) {
  const router = useRouter();

  async function selectWorkspace(id: string) {
    await fetch("/api/app/workspaces/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: id })
    });

    router.push(`/app/${id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[420px]">
        <h1 className="text-2xl font-semibold mb-6">Select a workspace</h1>

        <div className="space-y-3">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => selectWorkspace(ws.id)}
              className="w-full text-left p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium">{ws.name}</div>
              <div className="text-xs text-gray-500">{ws.role}</div>
            </button>
          ))}

          <button
            onClick={() => router.push("/app/create-workspace")}
            className="w-full p-4 border-dashed border rounded-lg text-sm"
          >
            + Create new workspace
          </button>
        </div>
      </div>
    </div>
  );
}
