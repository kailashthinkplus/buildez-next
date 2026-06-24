// /apps/web-app/app/app/(tenant)/components/TenantBootstrap.tsx

"use client";

import { useEffect, useState } from "react";

export function TenantBootstrap({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      console.log("🔄 TenantBootstrap → Fetching /api/tenant/me");

      try {
        const res = await fetch("/api/tenant/me", {
          credentials: "include",
        });

        const json = await res.json();

        console.log("📥 /api/tenant/me response:", json);

        const tenant = json?.data?.tenant;

        if (tenant?.id) {
          (window as any).__tenantId = tenant.id;

          console.log(
            "🟩 TenantBootstrap → SET window.__tenantId =",
            tenant.id
          );
        } else {
          console.log("❌ TenantBootstrap → No tenant found in response");
        }
      } catch (err) {
        console.log("❌ TenantBootstrap error:", err);
      }

      setReady(true);
    }

    loadTenant();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen text-white/70">
        Loading workspace…
      </div>
    );
  }

  return children;
}
