"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DashboardLogo({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  return (
    <Image
      key={dark ? "dashboard-logo-dark" : "dashboard-logo-light"}
      src={dark ? "/buildez-logo-dark.svg" : "/buildez-logo-light.svg"}
      alt="BuildEZ"
      width={210}
      height={103}
      priority
      className={`${compact ? "h-9 w-[116px]" : "h-[63px] w-[175px]"} object-contain object-left`}
    />
  );
}
