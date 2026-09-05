"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function DashboardLogo({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const isShopez = pathname.split("/").includes("shopez");
  const sizeClass = compact ? "h-8 w-[102px]" : "h-12 w-[142px]";

  if (isShopez) {
    return (
      <Image
        src="/shopez-logo.webp"
        alt="Shopezy"
        width={799}
        height={272}
        priority
        className={`${sizeClass} object-contain object-left`}
      />
    );
  }

  return (
    <span className={`${sizeClass} relative block shrink-0`}>
      <Image
        src="/buildez-logo-light.svg"
        alt="BuildEzy"
        fill
        priority
        sizes={compact ? "102px" : "142px"}
        className="object-contain object-left dark:hidden"
      />
      <Image
        src="/buildez-logo-dark.svg"
        alt=""
        fill
        priority
        sizes={compact ? "102px" : "142px"}
        className="hidden object-contain object-left dark:block"
      />
    </span>
  );
}
