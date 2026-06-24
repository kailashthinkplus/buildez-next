"use client";

// REMOVE THIS LINE:
// import "../../globals.css";

import { useState } from "react";
import { TenantHeader } from "./components/TenantHeader";
import { WorkspaceProvider } from "./components/WorkspaceContext";
import { TenantBootstrap } from "./components/TenantBootstrap";
import { SidebarShell } from "./components/sidebar/SidebarShell";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <TenantBootstrap>
      <WorkspaceProvider>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
          
          <SidebarShell
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
          />

          <div className="flex flex-col flex-1 h-full">
            
            <TenantHeader
              setMobileSidebarOpen={setMobileSidebarOpen}
            />

            <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
              {children}
            </main>

          </div>
        </div>
      </WorkspaceProvider>
    </TenantBootstrap>
  );
}
