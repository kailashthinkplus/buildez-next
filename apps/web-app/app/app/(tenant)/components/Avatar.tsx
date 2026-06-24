"use client";

import Image from "next/image";
import { useState } from "react";

export function Avatar({
  src,
  name,
  size = 40, // 40px (same as onboarding)
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        rounded-full overflow-hidden flex items-center justify-center
        bg-[#DCE3EE] text-[#1B2B42]
        dark:bg-white/20 dark:text-white
        border border-black/10 dark:border-white/10
        shadow-sm
      `}
      style={{ width: size, height: size }}
    >
      {!imgError && src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-sm font-semibold">{initials}</span>
      )}
    </div>
  );
}
