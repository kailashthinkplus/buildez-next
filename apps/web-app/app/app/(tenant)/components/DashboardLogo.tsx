"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DashboardLogo({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => queueMicrotask(() => setMounted(true)), []);

  const isShopez = pathname.split("/").includes("shopez");
  const dark = mounted && resolvedTheme === "dark";
  const src = isShopez
    ? "/shopez-logo.webp"
    : dark
      ? "/buildez-logo-dark.svg"
      : "/buildez-logo-light.svg";

  return (
    <Image
      key={isShopez ? "shopez-logo" : dark ? "dashboard-logo-dark" : "dashboard-logo-light"}
      src={src}
      alt={isShopez ? "Shopez" : "BuildEZ"}
      width={isShopez ? 799 : 210}
      height={isShopez ? 272 : 103}
      priority
      className={`${compact ? "h-9 w-[116px]" : "h-[63px] w-[175px]"} object-contain object-left`}
    />
  );
}
