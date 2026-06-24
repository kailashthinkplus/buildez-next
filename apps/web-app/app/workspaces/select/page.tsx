"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tenant = {
  id: string;
  name: string;
};

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspaces/list")
      .then(res => res.json())
      .then(data => {
        if (data.tenants?.length === 1) {
          router.replace("/app");
        } else {
          setTenants(data.tenants || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-lg mx-auto mt-24">
      <h1 className="text-2xl font-semibold mb-6">
        Select workspace
      </h1>

      <div className="space-y-3">
        {tenants.map(t => (
          <button
            key={t.id}
            className="bez-card w-full text-left p-4 hover:border-[var(--brand)]"
            onClick={() => router.push("/app")}
          >
            {t.name}
          </button>
        ))}
      </div>

      <button
        className="mt-6 text-sm text-[var(--brand)]"
        onClick={() => router.push("/workspaces/create")}
      >
        Create new workspace
      </button>
    </div>
  );
}
