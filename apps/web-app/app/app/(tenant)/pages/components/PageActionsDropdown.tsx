"use client";

import Link from "next/link";
import { usePageMutations } from "../hooks/usePageMutations";
import { useState } from "react";
import { MoreVertical } from "lucide-react";

export default function PageActionsDropdown({ page }: any) {
  const [open, setOpen] = useState(false);

  const { publish, unpublish, remove, duplicate } = usePageMutations();

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          p-2 rounded-xl
          hover:bg-gray-200 dark:hover:bg-white/10
        "
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-44 z-50
            rounded-2xl overflow-hidden
            bg-white dark:bg-white/10
            border border-gray-300 dark:border-white/10
            backdrop-blur-xl
            shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]
          "
        >
          {/* EDIT */}
          <Link
            href={`/app/(tenant)/builder?pageId=${page.id}`}
            className="
              block px-4 py-2 text-sm
              hover:bg-gray-100 dark:hover:bg-white/10
            "
          >
            Edit
          </Link>

          {/* PUBLISH */}
          {page.published ? (
            <button
              onClick={() => unpublish.mutate({ pageId: page.id })}
              className="
                w-full text-left px-4 py-2 text-sm
                hover:bg-gray-100 dark:hover:bg-white/10
              "
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => publish.mutate({ pageId: page.id })}
              className="
                w-full text-left px-4 py-2 text-sm
                hover:bg-gray-100 dark:hover:bg-white/10
              "
            >
              Publish
            </button>
          )}

          {/* DUPLICATE */}
          <button
            onClick={() => duplicate.mutate({ pageId: page.id })}
            className="
              w-full text-left px-4 py-2 text-sm
              hover:bg-gray-100 dark:hover:bg-white/10
            "
          >
            Duplicate
          </button>

          {/* DELETE */}
          <button
            onClick={() => remove.mutate({ pageId: page.id })}
            className="
              w-full text-left px-4 py-2 text-sm text-red-600
              hover:bg-gray-100 dark:hover:bg-white/10
            "
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
