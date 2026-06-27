"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

interface MediaSearchProps {
  onSearch(query: string): void | Promise<void>;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MediaSearch({
  onSearch,
}: MediaSearchProps) {
  const [query, setQuery] = useState("");
  const didMountRef = useRef(false);

  /* --------------------------------------------------------
     Debounced Search
  -------------------------------------------------------- */

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  /* --------------------------------------------------------
     Clear
  -------------------------------------------------------- */

  function clearSearch() {
    setQuery("");
  }

  /* --------------------------------------------------------
     Render
  -------------------------------------------------------- */

  return (
    <div className="relative">

      <Search
        size={18}
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-white/40
          pointer-events-none
        "
      />

      <input
        type="text"
        value={query}
        placeholder="Search images..."
        onChange={(e) => setQuery(e.target.value)}
        className="
          w-full
          h-11
          rounded-xl
          border
          border-white/10
          bg-[#0F172A]
          pl-10
          pr-10
          text-sm
          text-white
          placeholder:text-white/35
          outline-none
          transition-colors
          focus:border-blue-500
        "
      />

      {query.length > 0 && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            absolute
            right-2
            top-1/2
            -translate-y-1/2
            h-7
            w-7
            rounded-md
            flex
            items-center
            justify-center
            text-white/50
            hover:bg-white/10
            hover:text-white
            transition-colors
          "
        >
          <X size={14} />
        </button>
      )}

    </div>
  );
}
